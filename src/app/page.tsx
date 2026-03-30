import Link from 'next/link'
import { prisma } from '@/lib/prisma'

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

export default async function Home() {
  const stats = await getStats()

  const quickLinks = [
    {
      href: '/student',
      title: 'ประเมินการสอน',
      desc: 'กรอกแบบประเมินอาจารย์ผู้สอนในภาคการศึกษาปัจจุบัน',
      icon: '📝',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      href: '/dashboard/instructor',
      title: 'รายงานผู้สอน',
      desc: 'ดูผลการประเมินเฉลี่ยของอาจารย์แต่ละท่าน',
      icon: '👨‍🏫',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      href: '/dashboard/department',
      title: 'รายงานสาขา',
      desc: 'เปรียบเทียบผลการประเมินระดับสาขา',
      icon: '🏛️',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      href: '/dashboard/faculty',
      title: 'รายงานคณะ',
      desc: 'ภาพรวมผลการประเมินระดับคณะ',
      icon: '🎓',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      href: '/dashboard/subject',
      title: 'รายงานรายวิชา',
      desc: 'ผลการประเมินแยกตามรายวิชา',
      icon: '📚',
      color: 'bg-teal-600 hover:bg-teal-700',
    },
    {
      href: '/admin/form-builder',
      title: 'จัดการแบบฟอร์ม',
      desc: 'สร้างและแก้ไขแบบประเมินการสอน',
      icon: '⚙️',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ]

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
                <span className="text-sm font-medium">ภาคการศึกษาที่ {stats.activeTerm.label} (ภาคเรียนปัจจุบัน)</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{stats.responses}</div>
            <div className="text-blue-200 text-sm">การประเมินทั้งหมด</div>
          </div>
        </div>

        {/* Stats row */}
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

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">เข้าใช้งานระบบ</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${link.color} text-white rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 block`}
            >
              <div className="text-3xl mb-2">{link.icon}</div>
              <div className="font-bold">{link.title}</div>
              <div className="text-sm opacity-80 mt-1">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Demo Flow Guide */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">วิธีใช้งานระบบ (Demo Flow)</h2>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { step: '1', label: 'ไปที่ /student', icon: '👤' },
            { step: '2', label: 'คลิก "ประเมิน"', icon: '📝' },
            { step: '3', label: 'กรอกแบบประเมิน', icon: '✅' },
            { step: '4', label: 'ดู Dashboard', icon: '📊' },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div className="text-xs text-blue-500 font-medium">ขั้นตอน {item.step}</div>
                  <div className="text-sm font-semibold text-blue-800">{item.label}</div>
                </div>
              </div>
              {i < arr.length - 1 && (
                <span className="text-gray-400 text-xl">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
