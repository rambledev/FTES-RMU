import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import ScoreBadge from '@/components/ScoreBadge'
import StatCard from '@/components/StatCard'

async function getDeanData(facultyId: string) {
  const activeTerm = await prisma.term.findFirst({ where: { isActive: true } })

  const summaries = await prisma.instructorEvaluationSummary.findMany({
    where: {
      termId: activeTerm?.id,
      instructor: { department: { facultyId } },
    },
    include: {
      instructor: { include: { department: true } },
      term: true,
    },
    orderBy: { avgScore: 'desc' },
  })

  const departments = await prisma.department.findMany({
    where: { facultyId },
    include: {
      instructors: {
        include: {
          summaries: {
            where: { termId: activeTerm?.id },
          },
        },
      },
    },
  })

  const deptStats = departments.map((d) => {
    const deptSummaries = d.instructors.flatMap((i) => i.summaries)
    const avg =
      deptSummaries.length > 0
        ? deptSummaries.reduce((s, x) => s + x.avgScore, 0) / deptSummaries.length
        : 0
    return {
      id: d.id,
      name: d.name,
      instructorCount: d.instructors.length,
      avgScore: Math.round(avg * 100) / 100,
      responseCount: deptSummaries.reduce((s, x) => s + x.responseCount, 0),
    }
  })

  return { summaries, deptStats, activeTerm }
}

async function getHeadData(departmentId: string) {
  const activeTerm = await prisma.term.findFirst({ where: { isActive: true } })

  const summaries = await prisma.instructorEvaluationSummary.findMany({
    where: {
      termId: activeTerm?.id,
      instructor: { departmentId },
    },
    include: {
      instructor: true,
      term: true,
    },
    orderBy: { avgScore: 'desc' },
  })

  const assignments = await prisma.teachingAssignment.findMany({
    where: {
      termId: activeTerm?.id,
      instructor: { departmentId },
    },
    include: {
      subject: true,
      instructor: true,
      responses: { select: { id: true } },
    },
    orderBy: { subject: { code: 'asc' } },
  })

  return { summaries, assignments, activeTerm }
}

export default async function ExecutivePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'EXECUTIVE_DEAN' && session.role !== 'EXECUTIVE_HEAD') redirect('/')

  if (session.role === 'EXECUTIVE_DEAN') {
    if (!session.facultyId) {
      return <div className="text-center py-20 text-gray-500">ไม่พบข้อมูลคณะที่รับผิดชอบ</div>
    }

    const { summaries, deptStats, activeTerm } = await getDeanData(session.facultyId)
    const avgAll =
      summaries.length > 0 ? summaries.reduce((s, x) => s + x.avgScore, 0) / summaries.length : 0
    const totalResponses = summaries.reduce((s, x) => s + x.responseCount, 0)

    return (
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">แดชบอร์ดคณบดี</div>
          <h1 className="text-2xl font-bold text-gray-900">{session.faculty?.name}</h1>
          <p className="text-gray-500 mt-1">
            {activeTerm ? `ภาคการศึกษา ${activeTerm.label}` : 'ไม่มีภาคการศึกษาที่ใช้งาน'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="คะแนนเฉลี่ยคณะ" value={avgAll > 0 ? avgAll.toFixed(2) : '-'} subtitle="ทุกอาจารย์" color="blue" icon="⭐" />
          <StatCard title="จำนวนการประเมิน" value={totalResponses} subtitle="ครั้งทั้งหมด" color="green" icon="📋" />
          <StatCard title="จำนวนอาจารย์" value={summaries.length} subtitle="ที่มีข้อมูล" color="purple" icon="👨‍🏫" />
          <StatCard title="จำนวนสาขา" value={deptStats.length} subtitle="ในคณะ" color="yellow" icon="🏛️" />
        </div>

        {/* Dept summary */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">ผลรวมรายสาขาวิชา</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">สาขาวิชา</th>
                <th className="px-6 py-3 text-center">อาจารย์</th>
                <th className="px-6 py-3 text-center">ผู้ประเมิน</th>
                <th className="px-6 py-3 text-center">คะแนนเฉลี่ย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deptStats.sort((a, b) => b.avgScore - a.avgScore).map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{d.name}</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{d.instructorCount} คน</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{d.responseCount} คน</td>
                  <td className="px-6 py-3 text-center">
                    {d.avgScore > 0 ? <ScoreBadge score={d.avgScore} /> : <span className="text-gray-300 text-sm">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Instructor table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">ผลการประเมินรายอาจารย์</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">อันดับ</th>
                <th className="px-6 py-3 text-left">อาจารย์</th>
                <th className="px-6 py-3 text-left">สาขา</th>
                <th className="px-6 py-3 text-center">ผู้ประเมิน</th>
                <th className="px-6 py-3 text-center">คะแนน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaries.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold inline-flex ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'
                    }`}>{i + 1}</span>
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">{s.instructor.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{s.instructor.department.name}</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{s.responseCount} คน</td>
                  <td className="px-6 py-3 text-center"><ScoreBadge score={s.avgScore} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {summaries.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm">ยังไม่มีข้อมูลการประเมิน</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // EXECUTIVE_HEAD
  if (!session.departmentId) {
    return <div className="text-center py-20 text-gray-500">ไม่พบข้อมูลสาขาที่รับผิดชอบ</div>
  }

  const { summaries, assignments, activeTerm } = await getHeadData(session.departmentId)
  const avgAll = summaries.length > 0 ? summaries.reduce((s, x) => s + x.avgScore, 0) / summaries.length : 0
  const totalResponses = summaries.reduce((s, x) => s + x.responseCount, 0)

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-500 mb-1">แดชบอร์ดหัวหน้าสาขา</div>
        <h1 className="text-2xl font-bold text-gray-900">{session.department?.name}</h1>
        <p className="text-gray-500 mt-1">
          {activeTerm ? `ภาคการศึกษา ${activeTerm.label}` : 'ไม่มีภาคการศึกษาที่ใช้งาน'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="คะแนนเฉลี่ยสาขา" value={avgAll > 0 ? avgAll.toFixed(2) : '-'} subtitle="ทุกอาจารย์" color="blue" icon="⭐" />
        <StatCard title="จำนวนการประเมิน" value={totalResponses} subtitle="ครั้งทั้งหมด" color="green" icon="📋" />
        <StatCard title="จำนวนอาจารย์" value={summaries.length} subtitle="ในสาขา" color="purple" icon="👨‍🏫" />
        <StatCard title="รายวิชาที่สอน" value={assignments.length} subtitle="ภาคนี้" color="yellow" icon="📚" />
      </div>

      {/* Instructor scores */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">ผลการประเมินรายอาจารย์</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">อันดับ</th>
              <th className="px-6 py-3 text-left">อาจารย์</th>
              <th className="px-6 py-3 text-center">ผู้ประเมิน</th>
              <th className="px-6 py-3 text-center">คะแนน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {summaries.map((s, i) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold inline-flex ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'
                  }`}>{i + 1}</span>
                </td>
                <td className="px-6 py-3 font-medium text-gray-900">{s.instructor.name}</td>
                <td className="px-6 py-3 text-center text-sm text-gray-600">{s.responseCount} คน</td>
                <td className="px-6 py-3 text-center"><ScoreBadge score={s.avgScore} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {summaries.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm">ยังไม่มีข้อมูลการประเมิน</p>
          </div>
        )}
      </div>

      {/* Subject list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">รายวิชาที่เปิดสอน{activeTerm ? ` (${activeTerm.label})` : ''}</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">รหัสวิชา</th>
              <th className="px-6 py-3 text-left">ชื่อวิชา</th>
              <th className="px-6 py-3 text-left">อาจารย์ผู้สอน</th>
              <th className="px-6 py-3 text-center">ผู้ประเมิน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assignments.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <span className="font-mono text-sm font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{a.subject.code}</span>
                </td>
                <td className="px-6 py-3 font-medium text-gray-900">{a.subject.name}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{a.instructor.name}</td>
                <td className="px-6 py-3 text-center text-sm text-gray-600">{a.responses.length} คน</td>
              </tr>
            ))}
          </tbody>
        </table>
        {assignments.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">ไม่มีรายวิชาในภาคนี้</p>
          </div>
        )}
      </div>
    </div>
  )
}
