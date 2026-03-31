import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import EvaluateForm from './EvaluateForm'

async function getData(assignmentId: string, studentId: string) {
  const assignment = await prisma.teachingAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      subject: { include: { department: { include: { faculty: true } } } },
      instructor: true,
      term: true,
    },
  })
  if (!assignment) return null

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_teachingAssignmentId: { studentId, teachingAssignmentId: assignmentId } },
  })
  if (!enrollment) return null // not enrolled

  // Check if already evaluated
  const existing = await prisma.response.findUnique({
    where: { studentId_teachingAssignmentId: { studentId, teachingAssignmentId: assignmentId } },
  })
  if (existing) return { alreadyDone: true, assignment }

  const form = await prisma.evaluationForm.findFirst({
    where: { isActive: true },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: { questions: { orderBy: { order: 'asc' } } },
      },
    },
  })
  if (!form) return null

  return { alreadyDone: false, assignment, form }
}

export default async function EvaluatePage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'STUDENT' || !session.student) redirect('/student')

  const data = await getData(params.id, session.student.id)
  if (!data) notFound()

  const { alreadyDone, assignment, form } = data

  if (alreadyDone) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ท่านได้ประเมินรายวิชานี้แล้ว</h2>
        <p className="text-gray-500 mb-6">
          {assignment.subject.name} — {assignment.instructor.name}
        </p>
        <Link href="/student" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
          ← กลับหน้ารายวิชา
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/student" className="hover:text-blue-600">รายวิชาของฉัน</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">ประเมินการสอน</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📝</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold">
                {assignment.subject.code}
              </span>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                ภาคเรียน {assignment.term.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{assignment.subject.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <span className="text-gray-400">👨‍🏫</span>
              <span>อาจารย์ผู้สอน: <strong>{assignment.instructor.name}</strong></span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {assignment.subject.department.name} · {assignment.subject.department.faculty.name}
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-yellow-800">
          <strong>หมายเหตุ:</strong> ข้อมูลการประเมินจะถูกเก็บเป็นความลับ และไม่สามารถแก้ไขหลังส่งแล้วได้
        </div>
      </div>

      <EvaluateForm
        assignmentId={assignment.id}
        formId={form!.id}
        termId={assignment.term.id}
        studentId={session.student.id}
        sections={form!.sections}
      />
    </div>
  )
}
