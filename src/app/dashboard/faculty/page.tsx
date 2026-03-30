import { prisma } from '@/lib/prisma'
import ScoreBadge from '@/components/ScoreBadge'
import StatCard from '@/components/StatCard'
import FacultyPieChart from './FacultyPieChart'

async function getData() {
  const activeTerm = await prisma.term.findFirst({ where: { isActive: true } })

  const faculties = await prisma.faculty.findMany({
    include: {
      departments: {
        include: {
          instructors: {
            include: {
              summaries: {
                where: activeTerm ? { termId: activeTerm.id } : {},
              },
            },
          },
          subjects: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const facStats = faculties.map((fac) => {
    const allSummaries = fac.departments.flatMap((d) => d.instructors.flatMap((i) => i.summaries))
    const instructorCount = fac.departments.reduce((s, d) => s + d.instructors.length, 0)
    const deptCount = fac.departments.length
    const totalResponses = allSummaries.reduce((s, x) => s + x.responseCount, 0)
    const avgScore =
      allSummaries.length > 0
        ? allSummaries.reduce((s, x) => s + x.avgScore * x.responseCount, 0) / Math.max(totalResponses, 1)
        : 0

    return {
      id: fac.id,
      name: fac.name,
      code: fac.code,
      deptCount,
      instructorCount,
      responseCount: totalResponses,
      avgScore: Math.round(avgScore * 100) / 100,
    }
  })

  const totalResponses = facStats.reduce((s, f) => s + f.responseCount, 0)
  const overallAvg =
    facStats.filter((f) => f.responseCount > 0).reduce((s, f) => s + f.avgScore, 0) /
    Math.max(facStats.filter((f) => f.responseCount > 0).length, 1)

  return { facStats, activeTerm, overallAvg, totalResponses }
}

export default async function FacultyDashboard() {
  const { facStats, activeTerm, overallAvg, totalResponses } = await getData()

  const pieData = facStats.map((f) => ({ name: f.name.replace('คณะ', '').trim(), value: f.responseCount, avgScore: f.avgScore }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">รายงานผลการประเมิน — คณะ</h1>
        <p className="text-gray-500 mt-1">
          ภาพรวมผลการประเมินระดับคณะ {activeTerm && `· ภาคการศึกษา ${activeTerm.label}`}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="คะแนนเฉลี่ยรวม" value={overallAvg > 0 ? overallAvg.toFixed(2) : '-'} subtitle="ทุกคณะ" color="blue" icon="⭐" />
        <StatCard title="จำนวนการประเมิน" value={totalResponses.toLocaleString()} subtitle="ครั้งทั้งหมด" color="green" icon="📋" />
        <StatCard title="จำนวนคณะ" value={facStats.length} color="purple" icon="🎓" />
        <StatCard title="จำนวนอาจารย์" value={facStats.reduce((s, f) => s + f.instructorCount, 0)} subtitle="ทั้งมหาวิทยาลัย" color="yellow" icon="👨‍🏫" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">สัดส่วนการประเมินตามคณะ</h2>
          <FacultyPieChart data={pieData} />
        </div>

        {/* Faculty Cards */}
        <div className="space-y-4">
          {facStats.map((fac) => (
            <div key={fac.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-100 text-blue-700 font-bold text-xs px-2 py-0.5 rounded">{fac.code}</span>
                    <h3 className="font-bold text-gray-900 text-sm">{fac.name}</h3>
                  </div>
                </div>
                {fac.responseCount > 0 && <ScoreBadge score={fac.avgScore} />}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{fac.deptCount}</div>
                  <div className="text-xs text-gray-400">สาขาวิชา</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{fac.instructorCount}</div>
                  <div className="text-xs text-gray-400">อาจารย์</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{fac.responseCount}</div>
                  <div className="text-xs text-gray-400">การประเมิน</div>
                </div>
              </div>

              {fac.responseCount > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-600 rounded-full h-2" style={{ width: `${(fac.avgScore / 5) * 100}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span><span>5.00</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
