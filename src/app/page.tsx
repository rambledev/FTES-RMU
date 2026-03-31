import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

async function getStats() {
  const [students, instructors, subjects, responses, activeTerm] = await Promise.all([
    prisma.student.count(),
    prisma.instructor.count(),
    prisma.subject.count(),
    prisma.response.count(),
    prisma.term.findFirst({ where: { isActive: true } }),
  ])
  return { students, instructors, subjects, responses, activeTerm }
}

const roleCards = [
  {
    role: 'STUDENT',
    href: '/student',
    icon: '🎓',
    title: 'นักศึกษา',
    desc: 'ดูรายวิชา ลงทะเบียน และประเมินการสอน',
    color: 'from-blue-500 to-blue-700',
  },
  {
    role: 'TEACHER',
    href: '/teacher',
    icon: '👨‍🏫',
    title: 'อาจารย์',
    desc: 'ดูผลการประเมินของตนเอง จัดการรายวิชา',
    color: 'from-green-500 to-green-700',
  },
  {
    role: 'EXECUTIVE_DEAN',
    href: '/executive',
    icon: '🏛️',
    title: 'คณบดี',
    desc: 'แดชบอร์ดสรุปผลระดับคณะ',
    color: 'from-purple-500 to-purple-700',
  },
  {
    role: 'EXECUTIVE_HEAD',
    href: '/executive',
    icon: '📋',
    title: 'หัวหน้าสาขา',
    desc: 'แดชบอร์ดสรุปผลระดับสาขา',
    color: 'from-indigo-500 to-indigo-700',
  },
  {
    role: 'ADMIN',
    href: '/admin',
    icon: '⚙️',
    title: 'ผู้ดูแลระบบ',
    desc: 'จัดการแบบฟอร์ม ผู้ใช้ และการตั้งค่า',
    color: 'from-gray-600 to-gray-800',
  },
]

export default async function Home() {
  const session = await getSession()

  // Redirect logged-in users to their home
  if (session) {
    const redirectMap: Record<string, string> = {
      STUDENT: '/student',
      TEACHER: '/teacher',
      EXECUTIVE_DEAN: '/executive',
      EXECUTIVE_HEAD: '/executive',
      ADMIN: '/admin',
    }
    redirect(redirectMap[session.role] ?? '/student')
  }

  const stats = await getStats()

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">ระบบประเมินการสอน</h1>
            <p className="text-blue-200 mt-1 text-lg">
              Faculty Teaching Evaluation System — มหาวิทยาลัยเทคโนโลยีราชมงคล
            </p>
            {stats.activeTerm && (
              <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">ภาคการศึกษา {stats.activeTerm.label} (ภาคเรียนปัจจุบัน)</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{stats.responses}</div>
            <div className="text-blue-200 text-sm">การประเมินทั้งหมด</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/15 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.students}</div>
            <div className="text-blue-200 text-sm mt-1">นักศึกษา</div>
          </div>
          <div className="bg-white/15 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.instructors}</div>
            <div className="text-blue-200 text-sm mt-1">อาจารย์</div>
          </div>
          <div className="bg-white/15 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.subjects}</div>
            <div className="text-blue-200 text-sm mt-1">รายวิชา</div>
          </div>
        </div>
      </div>

      {/* Role selector */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">เข้าสู่ระบบเพื่อใช้งาน</h2>
        <p className="text-gray-500 text-sm mb-4">เลือกบทบาทของคุณเพื่อเข้าสู่ระบบ</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleCards.map((card) => (
            <Link
              key={card.role}
              href="/login"
              className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all block`}
            >
              <div className="text-4xl mb-3">{card.icon}</div>
              <div className="font-bold text-lg">{card.title}</div>
              <div className="text-sm opacity-80 mt-1">{card.desc}</div>
              <div className="mt-4 text-xs opacity-60 border-t border-white/20 pt-2">คลิกเพื่อเข้าสู่ระบบ →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
