import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import ScoreBadge from '@/components/ScoreBadge'

async function getTeacherData(instructorId: string) {
  // Up to 3 most recent terms
  const terms = await prisma.term.findMany({
    orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    take: 6,
  })

  const summaries = await prisma.instructorEvaluationSummary.findMany({
    where: { instructorId },
    include: { term: true },
    orderBy: [{ term: { year: 'desc' } }, { term: { semester: 'desc' } }],
  })

  const activeTerm = await prisma.term.findFirst({ where: { isActive: true } })

  // Assignments per term with response counts
  const assignments = await prisma.teachingAssignment.findMany({
    where: { instructorId },
    include: {
      subject: { include: { department: true } },
      term: true,
      responses: { select: { id: true } },
    },
    orderBy: [{ term: { year: 'desc' } }, { term: { semester: 'desc' } }, { subject: { code: 'asc' } }],
  })

  return { summaries, assignments, activeTerm, terms }
}

export default async function TeacherPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'TEACHER' || !session.instructor) redirect('/')

  const { summaries, assignments, activeTerm } = await getTeacherData(session.instructor.id)

  const latestSummary = summaries[0]
  const activeAssignments = assignments.filter((a) => a.termId === activeTerm?.id)
  const totalResponses = summaries.reduce((s, x) => s + x.responseCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ผลการประเมินของฉัน</h1>
          <p className="text-gray-500 mt-1">{session.name}</p>
        </div>
        <Link
          href="/teacher/assignments"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          จัดการรายวิชาที่สอน →
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {latestSummary ? latestSummary.avgScore.toFixed(2) : '-'}
          </div>
          <div className="text-sm text-gray-500 mt-1">คะแนนล่าสุด</div>
          {latestSummary && <div className="text-xs text-gray-400 mt-0.5">{latestSummary.term.label}</div>}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{totalResponses}</div>
          <div className="text-sm text-gray-500 mt-1">ผู้ประเมินทั้งหมด</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{activeAssignments.length}</div>
          <div className="text-sm text-gray-500 mt-1">รายวิชาภาคนี้</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{summaries.length}</div>
          <div className="text-sm text-gray-500 mt-1">ภาคที่มีข้อมูล</div>
        </div>
      </div>

      {/* Active term assignments */}
      {activeTerm && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">รายวิชาที่สอนภาค {activeTerm.label}</h2>
          </div>
          {activeAssignments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-sm">ไม่มีรายวิชาที่สอนในภาคนี้</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">รหัสวิชา</th>
                  <th className="px-6 py-3 text-left">ชื่อวิชา</th>
                  <th className="px-6 py-3 text-left">สาขา</th>
                  <th className="px-6 py-3 text-center">ผู้ประเมิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <span className="font-mono text-sm font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{a.subject.code}</span>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">{a.subject.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{a.subject.department.name}</td>
                    <td className="px-6 py-3 text-center text-sm text-gray-600">{a.responses.length} คน</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Score history */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">ประวัติคะแนนการประเมิน</h2>
        </div>
        {summaries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm">ยังไม่มีข้อมูลการประเมิน</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">ภาคการศึกษา</th>
                <th className="px-6 py-3 text-center">ผู้ประเมิน</th>
                <th className="px-6 py-3 text-center">คะแนนเฉลี่ย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaries.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{s.term.label}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{s.responseCount} คน</td>
                  <td className="px-6 py-4 text-center">
                    <ScoreBadge score={s.avgScore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
