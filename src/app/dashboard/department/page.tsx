import { prisma } from '@/lib/prisma'
import ScoreBadge from '@/components/ScoreBadge'
import StatCard from '@/components/StatCard'
import DeptBarChart from './DeptBarChart'

async function getData() {
  const activeTerm = await prisma.term.findFirst({ where: { isActive: true } })

  const departments = await prisma.department.findMany({
    include: {
      faculty: true,
      instructors: {
        include: {
          summaries: {
            where: activeTerm ? { termId: activeTerm.id } : {},
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const deptStats = departments.map((dept) => {
    const allSummaries = dept.instructors.flatMap((i) => i.summaries)
    const totalResponses = allSummaries.reduce((s, x) => s + x.responseCount, 0)
    const avgScore =
      allSummaries.length > 0
        ? allSummaries.reduce((s, x) => s + x.avgScore * x.responseCount, 0) / Math.max(totalResponses, 1)
        : 0

    return {
      id: dept.id,
      name: dept.name,
      facultyName: dept.faculty.name,
      instructorCount: dept.instructors.length,
      responseCount: totalResponses,
      avgScore: Math.round(avgScore * 100) / 100,
    }
  })

  const overallAvg =
    deptStats.filter((d) => d.responseCount > 0).reduce((s, d) => s + d.avgScore, 0) /
    Math.max(deptStats.filter((d) => d.responseCount > 0).length, 1)

  return { deptStats, activeTerm, overallAvg }
}

export default async function DepartmentDashboard() {
  const { deptStats, activeTerm, overallAvg } = await getData()

  const chartData = deptStats
    .filter((d) => d.responseCount > 0)
    .map((d) => ({ name: d.name.replace('สาขาวิชา', ''), avgScore: d.avgScore }))
    .sort((a, b) => b.avgScore - a.avgScore)

  const totalResponses = deptStats.reduce((s, d) => s + d.responseCount, 0)
  const best = [...deptStats].filter((d) => d.responseCount > 0).sort((a, b) => b.avgScore - a.avgScore)[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">รายงานผลการประเมิน — สาขาวิชา</h1>
        <p className="text-gray-500 mt-1">
          เปรียบเทียบผลการประเมินระดับสาขาวิชา {activeTerm && `· ภาคการศึกษา ${activeTerm.label}`}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="คะแนนเฉลี่ยรวม" value={overallAvg > 0 ? overallAvg.toFixed(2) : '-'} subtitle="ทุกสาขาวิชา" color="blue" icon="⭐" />
        <StatCard title="จำนวนการประเมิน" value={totalResponses.toLocaleString()} subtitle="ครั้งทั้งหมด" color="green" icon="📋" />
        <StatCard title="จำนวนสาขาวิชา" value={deptStats.length} subtitle="ที่มีข้อมูล" color="purple" icon="🏛️" />
        <StatCard title="สาขาคะแนนสูงสุด" value={best?.avgScore.toFixed(2) ?? '-'} subtitle={best?.name.replace('สาขาวิชา', '')} color="yellow" icon="🏆" />
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">เปรียบเทียบคะแนนเฉลี่ยตามสาขาวิชา</h2>
        <DeptBarChart data={chartData} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">ผลการประเมินรายสาขาวิชา{activeTerm ? ` (${activeTerm.label})` : ''}</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">สาขาวิชา</th>
              <th className="px-6 py-3 text-left">คณะ</th>
              <th className="px-6 py-3 text-center">จำนวนอาจารย์</th>
              <th className="px-6 py-3 text-center">จำนวนผู้ประเมิน</th>
              <th className="px-6 py-3 text-center">คะแนนเฉลี่ย</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deptStats
              .sort((a, b) => b.avgScore - a.avgScore)
              .map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{dept.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{dept.facultyName}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{dept.instructorCount} คน</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{dept.responseCount} ครั้ง</td>
                  <td className="px-6 py-4 text-center">
                    {dept.responseCount > 0 ? (
                      <ScoreBadge score={dept.avgScore} />
                    ) : (
                      <span className="text-gray-400 text-sm">ยังไม่มีข้อมูล</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
