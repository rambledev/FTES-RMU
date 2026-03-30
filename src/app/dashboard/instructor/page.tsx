import { prisma } from '@/lib/prisma'
import ScoreBadge from '@/components/ScoreBadge'
import StatCard from '@/components/StatCard'
import InstructorTrendChart from './InstructorTrendChart'

async function getData() {
  const [summaries, terms, totalResponses] = await Promise.all([
    prisma.instructorEvaluationSummary.findMany({
      include: {
        instructor: { include: { department: { include: { faculty: true } } } },
        term: true,
      },
      orderBy: [{ term: { year: 'desc' } }, { term: { semester: 'desc' } }, { avgScore: 'desc' }],
    }),
    prisma.term.findMany({ orderBy: [{ year: 'asc' }, { semester: 'asc' }] }),
    prisma.response.count(),
  ])

  // Group summaries by instructor for trend data
  const byInstructor = new Map<string, typeof summaries>()
  for (const s of summaries) {
    const key = s.instructorId
    if (!byInstructor.has(key)) byInstructor.set(key, [])
    byInstructor.get(key)!.push(s)
  }

  // Latest term summaries for main table
  const activeTerm = await prisma.term.findFirst({ where: { isActive: true } })
  const latestSummaries = activeTerm
    ? summaries.filter((s) => s.termId === activeTerm.id)
    : []

  const avgAll =
    latestSummaries.length > 0
      ? latestSummaries.reduce((s, r) => s + r.avgScore, 0) / latestSummaries.length
      : 0

  const trendData = terms.map((t) => ({
    label: t.label,
    instructors: Array.from(byInstructor.entries()).map(([, sums]) => {
      const s = sums.find((x) => x.termId === t.id)
      return s ? { name: s.instructor.name, score: s.avgScore } : null
    }).filter(Boolean),
  }))

  return { summaries, terms, latestSummaries, activeTerm, avgAll, totalResponses, byInstructor, trendData }
}

export default async function InstructorDashboard() {
  const { latestSummaries, activeTerm, avgAll, totalResponses, summaries, terms } = await getData()

  const chartData = terms.map((t) => {
    const termSummaries = summaries.filter((s) => s.termId === t.id)
    const avg = termSummaries.length > 0
      ? termSummaries.reduce((s, r) => s + r.avgScore, 0) / termSummaries.length
      : 0
    return { term: t.label, avgScore: Math.round(avg * 100) / 100 }
  })

  const topInstructor = latestSummaries[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">รายงานผลการประเมิน — อาจารย์ผู้สอน</h1>
        <p className="text-gray-500 mt-1">
          ผลการประเมินแยกตามอาจารย์ {activeTerm && `· ภาคการศึกษา ${activeTerm.label}`}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="คะแนนเฉลี่ยรวม" value={avgAll > 0 ? avgAll.toFixed(2) : '-'} subtitle="ทุกอาจารย์" color="blue" icon="⭐" />
        <StatCard title="จำนวนการประเมิน" value={totalResponses.toLocaleString()} subtitle="ครั้งทั้งหมด" color="green" icon="📋" />
        <StatCard title="จำนวนอาจารย์" value={latestSummaries.length} subtitle="ที่มีข้อมูล" color="purple" icon="👨‍🏫" />
        <StatCard
          title="คะแนนสูงสุด"
          value={topInstructor ? topInstructor.avgScore.toFixed(2) : '-'}
          subtitle={topInstructor?.instructor.name.split(' ').slice(-1)[0]}
          color="yellow"
          icon="🏆"
        />
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">แนวโน้มคะแนนเฉลี่ยตามภาคการศึกษา</h2>
        <InstructorTrendChart data={chartData} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">ผลการประเมินรายอาจารย์{activeTerm ? ` (${activeTerm.label})` : ''}</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">อันดับ</th>
              <th className="px-6 py-3 text-left">อาจารย์</th>
              <th className="px-6 py-3 text-left">สาขา</th>
              <th className="px-6 py-3 text-left">คณะ</th>
              <th className="px-6 py-3 text-center">จำนวนผู้ประเมิน</th>
              <th className="px-6 py-3 text-center">คะแนน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {latestSummaries
              .sort((a, b) => b.avgScore - a.avgScore)
              .map((s, i) => (
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
                    <div className="font-medium text-gray-900">{s.instructor.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.instructor.department.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.instructor.department.faculty.name}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{s.responseCount} คน</td>
                  <td className="px-6 py-4 text-center">
                    <ScoreBadge score={s.avgScore} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {latestSummaries.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <p>ยังไม่มีข้อมูลการประเมิน</p>
          </div>
        )}
      </div>

      {/* Historical Data */}
      {terms.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">ประวัติผลการประเมินทุกภาคเรียน</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">อาจารย์</th>
                {terms.map((t) => (
                  <th key={t.id} className="px-6 py-3 text-center">{t.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from(
                new Map(summaries.map((s) => [s.instructorId, s.instructor])).values()
              ).map((instructor) => (
                <tr key={instructor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900 text-sm">{instructor.name}</td>
                  {terms.map((t) => {
                    const s = summaries.find((x) => x.instructorId === instructor.id && x.termId === t.id)
                    return (
                      <td key={t.id} className="px-6 py-3 text-center">
                        {s ? <ScoreBadge score={s.avgScore} /> : <span className="text-gray-300 text-sm">-</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
