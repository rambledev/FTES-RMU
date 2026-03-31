import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'TEACHER' || !session.instructor) {
    return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 })
  }

  const { subjectId, termId } = await req.json()
  if (!subjectId || !termId) {
    return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })
  }

  try {
    const assignment = await prisma.teachingAssignment.create({
      data: { subjectId, instructorId: session.instructor.id, termId },
      include: { subject: true, term: true },
    })
    return NextResponse.json(assignment)
  } catch {
    return NextResponse.json({ error: 'รายวิชานี้ถูกเพิ่มแล้วในภาคนี้' }, { status: 409 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'TEACHER' || !session.instructor) {
    return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 })
  }

  const { id } = await req.json()
  const assignment = await prisma.teachingAssignment.findUnique({ where: { id } })

  if (!assignment || assignment.instructorId !== session.instructor.id) {
    return NextResponse.json({ error: 'ไม่พบหรือไม่มีสิทธิ์' }, { status: 404 })
  }

  // Don't allow deletion if there are responses
  const responseCount = await prisma.response.count({ where: { teachingAssignmentId: id } })
  if (responseCount > 0) {
    return NextResponse.json({ error: 'ไม่สามารถลบได้ เนื่องจากมีการประเมินแล้ว' }, { status: 409 })
  }

  await prisma.enrollment.deleteMany({ where: { teachingAssignmentId: id } })
  await prisma.teachingAssignment.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
