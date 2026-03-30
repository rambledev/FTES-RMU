import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, teachingAssignmentId, formId, termId, answers } = body

    if (!studentId || !teachingAssignmentId || !formId || !termId || !answers?.length) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 })
    }

    // Check duplicate
    const existing = await prisma.response.findUnique({
      where: { studentId_teachingAssignmentId: { studentId, teachingAssignmentId } },
    })
    if (existing) {
      return NextResponse.json({ error: 'ท่านได้ประเมินรายวิชานี้แล้ว' }, { status: 409 })
    }

    // Validate assignment + student exist
    const [assignment, student] = await Promise.all([
      prisma.teachingAssignment.findUnique({ where: { id: teachingAssignmentId } }),
      prisma.student.findUnique({ where: { id: studentId } }),
    ])
    if (!assignment || !student) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลที่เกี่ยวข้อง' }, { status: 404 })
    }

    // Create response + answers in a transaction
    const response = await prisma.$transaction(async (tx) => {
      const resp = await tx.response.create({
        data: { studentId, teachingAssignmentId, formId, termId },
      })

      await tx.answer.createMany({
        data: answers.map((a: { questionId: string; valueInt: number | null; valueText: string | null }) => ({
          responseId: resp.id,
          questionId: a.questionId,
          valueInt: a.valueInt,
          valueText: a.valueText,
        })),
      })

      return resp
    })

    // Recalculate instructor evaluation summary
    await recalculateSummary(assignment.instructorId, termId)

    return NextResponse.json({ success: true, responseId: response.id })
  } catch (e: unknown) {
    console.error('[submit]', e)
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'ท่านได้ประเมินรายวิชานี้แล้ว' }, { status: 409 })
    }
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในระบบ' }, { status: 500 })
  }
}

async function recalculateSummary(instructorId: string, termId: string) {
  const responses = await prisma.response.findMany({
    where: {
      termId,
      teachingAssignment: { instructorId },
    },
    include: {
      answers: {
        where: { question: { type: 'rating' } },
        include: { question: true },
      },
    },
  })

  if (responses.length === 0) return

  let totalScore = 0
  let totalAnswers = 0
  for (const resp of responses) {
    for (const ans of resp.answers) {
      if (ans.valueInt !== null) {
        totalScore += ans.valueInt
        totalAnswers++
      }
    }
  }

  const avgScore = totalAnswers > 0 ? Math.round((totalScore / totalAnswers) * 100) / 100 : 0

  await prisma.instructorEvaluationSummary.upsert({
    where: { instructorId_termId: { instructorId, termId } },
    update: { avgScore, responseCount: responses.length },
    create: { instructorId, termId, avgScore, responseCount: responses.length },
  })
}
