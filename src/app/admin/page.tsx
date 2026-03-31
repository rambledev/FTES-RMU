import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function getAdminStats() {
  const [userCount, studentCount, instructorCount, responseCount, formCount, activeTerm] = await Promise.all([
    prisma.user.count(),
    prisma.student.count(),
    prisma.instructor.count(),
    prisma.response.count(),
    prisma.evaluationForm.count(),
    prisma.term.findFirst({ where: { isActive: true } }),
  ])
  return { userCount, studentCount, instructorCount, responseCount, formCount, activeTerm }
}

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'ADMIN') redirect('/')

  const stats = await getAdminStats()

  const adminMenus = [
    { href: '/admin/users', icon: '👥', title: 'จัดการผู้ใช้', desc: `${stats.userCount} บัญชีในระบบ`, color: 'bg-blue-600 hover:bg-blue-700' },
    { href: '/admin/form-builder', icon: '📋', title: 'จัดการแบบฟอร์ม', desc: `${stats.formCount} แบบฟอร์ม`, color: 'bg-green-600 hover:bg-green-700' },
    { href: '/dashboard/instructor', icon: '👨‍🏫', title: 'รายงานผู้สอน', desc: 'ดูผลการประเมินทั้งหมด', color: 'bg-purple-600 hover:bg-purple-700' },
    { href: '/dashboard/department', icon: '🏛️', title: 'รายงานสาขา', desc: 'เปรียบเทียบระดับสาขา', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { href: '/dashboard/faculty', icon: '🎓', title: 'รายงานคณะ', desc: 'ภาพรวมระดับคณะ', color: 'bg-orange-600 hover:bg-orange-700' },
    { href: '/dashboard/subject', icon: '📚', title: 'รายงานรายวิชา', desc: 'ผลประเมินแยกวิชา', color: 'bg-teal-600 hover:bg-teal-700' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">แผงควบคุมผู้ดูแลระบบ</h1>
        <p className="text-gray-500 mt-1">
          {stats.activeTerm ? `ภาคการศึกษา ${stats.activeTerm.label}` : 'ไม่มีภาคการศึกษาที่ใช้งาน'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.userCount}</div>
          <div className="text-sm text-gray-500 mt-1">ผู้ใช้ทั้งหมด</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.studentCount}</div>
          <div className="text-sm text-gray-500 mt-1">นักศึกษา</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.instructorCount}</div>
          <div className="text-sm text-gray-500 mt-1">อาจารย์</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.responseCount}</div>
          <div className="text-sm text-gray-500 mt-1">การประเมินทั้งหมด</div>
        </div>
      </div>

      {/* Menu */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {adminMenus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`${menu.color} text-white rounded-2xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all block`}
          >
            <div className="text-3xl mb-3">{menu.icon}</div>
            <div className="font-bold">{menu.title}</div>
            <div className="text-sm opacity-80 mt-1">{menu.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
