import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import AssignmentsClient from './AssignmentsClient'

async function getData(instructorId: string) {
  const [assignments, subjects, terms] = await Promise.all([
    prisma.teachingAssignment.findMany({
      where: { instructorId },
      include: {
        subject: { include: { department: true } },
        term: true,
        responses: { select: { id: true } },
      },
      orderBy: [{ term: { year: 'desc' } }, { term: { semester: 'desc' } }, { subject: { code: 'asc' } }],
    }),
    prisma.subject.findMany({
      include: { department: true },
      orderBy: { code: 'asc' },
    }),
    prisma.term.findMany({ orderBy: [{ year: 'desc' }, { semester: 'desc' }] }),
  ])

  return {
    assignments: assignments.map((a) => ({
      id: a.id,
      subjectCode: a.subject.code,
      subjectName: a.subject.name,
      departmentName: a.subject.department.name,
      termLabel: a.term.label,
      termId: a.term.id,
      responseCount: a.responses.length,
    })),
    subjects: subjects.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      departmentName: s.department.name,
    })),
    terms: terms.map((t) => ({ id: t.id, label: t.label, isActive: t.isActive })),
  }
}

export default async function TeacherAssignmentsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'TEACHER' || !session.instructor) redirect('/')

  const { assignments, subjects, terms } = await getData(session.instructor.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/teacher" className="hover:text-blue-600">ผลการประเมิน</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">จัดการรายวิชาที่สอน</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">จัดการรายวิชาที่สอน</h1>
        <p className="text-gray-500 mt-1">{session.name}</p>
      </div>

      <AssignmentsClient assignments={assignments} subjects={subjects} terms={terms} />
    </div>
  )
}
