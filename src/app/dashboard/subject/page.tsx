import { prisma } from '@/lib/prisma'
import ScoreBadge from '@/components/ScoreBadge'
import StatCard from '@/components/StatCard'

async function getData() {
  const activeTerm = await prisma.term.findFirst({ where: { isActive: true } })

  const assignments = await prisma.teachingAssignment.findMany({
    where: activeTerm ? { termId: activeTerm.id } : {},
    include: {
      subject: { include: { department: { include: { faculty: true } } } },
      instructor: true,
      term: true,
      responses: {
        include: {
          answers: {
            where: { question: { type: 'rating' } },
            include: { question: true },
          },
        },
      },
    },
    orderBy: { subject: { code: 'asc' } },
  })

  const subjectStats = assignments.map((a) => {
    const allAnswers = a.responses.flatMap((r) => r.answers.filter((ans) => ans.valueInt !== null))
    const avgScore =
      allAnswers.length > 0
        ? allAnswers.reduce((s, ans) => s + (ans.valueInt ?? 0), 0) / allAnswers.length
        : 0

    return {
      id: a.id,
      subjectCode: a.subject.code,
      subjectName: a.subject.name,
      credits: a.subject.credits,
      instructor: a.instructor.name,
      department: a.subject.department.name,
      faculty: a.subject.department.faculty.name,
      responseCount: a.responses.length,
      avgScore: Math.round(avgScore * 100) / 100,
    }
  })

  const totalResponses = subjectStats.reduce((s, x) => s + x.responseCount, 0)
  const overallAvg =
    subjectStats.filter((s) => s.responseCount > 0).length > 0
      ? subjectStats.filter((s) => s.responseCount > 0).reduce((s, x) => s + x.avgScore, 0) /
        subjectStats.filter((s) => s.responseCount > 0).length
      : 0

  return { subjectStats, activeTerm, overallAvg, totalResponses }
}

export default async function SubjectDashboard() {
  const { subjectStats, activeTerm, overallAvg, totalResponses } = await getData()

  const sorted = [...subjectStats].sort((a, b) => b.avgScore - a.avgScore)
  const top = sorted[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">รายงานผลการประเมิน — รายวิชา</h1>
        <p className="text-gray-500 mt-1">
          ผลการประเมินแยกตามรายวิชา {activeTerm && `· ภาคการศึกษา ${activeTerm.label}`}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="คะแนนเฉลี่ยรวม" value={overallAvg > 0 ? overallAvg.toFixed(2) : '-'} subtitle="ทุกรายวิชา" color="blue" icon="⭐" />
        <StatCard title="จำนวนการประเมิน" value={totalResponses.toLocaleString()} subtitle="ครั้งทั้งหมด" color="green" icon="📋" />
        <StatCard title="จำนวนรายวิชา" value={subjectStats.length} subtitle="ที่มีการสอน" color="purple" icon="📚" />
        <StatCard title="คะแนนสูงสุด" value={top?.avgScore.toFixed(2) ?? '-'} subtitle={top?.subjectCode} color="yellow" icon="🏆" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">ผลการประเมินรายวิชา{activeTerm ? ` (${activeTerm.label})` : ''}</h2>
          <span className="text-sm text-gray-400">{subjectStats.length} รายวิชา</span>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">อันดับ</th>
              <th className="px-6 py-3 text-left">รหัสวิชา</th>
              <th className="px-6 py-3 text-left">ชื่อวิชา</th>
              <th className="px-6 py-3 text-left">อาจารย์ผู้สอน</th>
              <th className="px-6 py-3 text-left">สาขา</th>
              <th className="px-6 py-3 text-center">หน่วยกิต</th>
              <th className="px-6 py-3 text-center">ผู้ประเมิน</th>
              <th className="px-6 py-3 text-center">คะแนน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((s, i) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold inline-flex ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {s.subjectCode}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{s.subjectName}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{s.instructor}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.department}</td>
                <td className="px-6 py-4 text-center text-sm text-gray-500">{s.credits}</td>
                <td className="px-6 py-4 text-center text-sm text-gray-600">{s.responseCount} คน</td>
                <td className="px-6 py-4 text-center">
                  {s.responseCount > 0 ? (
                    <ScoreBadge score={s.avgScore} />
                  ) : (
                    <span className="text-gray-400 text-sm">ยังไม่มีข้อมูล</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {subjectStats.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">📚</div>
            <p>ยังไม่มีข้อมูลการสอนในภาคการศึกษานี้</p>
          </div>
        )}
      </div>
    </div>
  )
}
