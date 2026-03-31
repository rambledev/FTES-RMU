'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { SessionUser } from '@/lib/session'

const ROLE_LABEL: Record<string, string> = {
  STUDENT: 'นักศึกษา',
  TEACHER: 'อาจารย์',
  EXECUTIVE_DEAN: 'คณบดี',
  EXECUTIVE_HEAD: 'หัวหน้าสาขา',
  ADMIN: 'ผู้ดูแลระบบ',
}

function getNavLinks(role: string | undefined) {
  const base = [{ href: '/', label: 'หน้าหลัก' }]

  if (!role) return base

  if (role === 'STUDENT') {
    return [...base, { href: '/student', label: 'รายวิชาของฉัน' }]
  }

  if (role === 'TEACHER') {
    return [
      ...base,
      { href: '/teacher', label: 'ผลการประเมินของฉัน' },
      { href: '/teacher/assignments', label: 'จัดการรายวิชา' },
    ]
  }

  if (role === 'EXECUTIVE_DEAN' || role === 'EXECUTIVE_HEAD') {
    return [
      ...base,
      { href: '/executive', label: 'แดชบอร์ดผู้บริหาร' },
    ]
  }

  if (role === 'ADMIN') {
    return [
      ...base,
      {
        label: 'แดชบอร์ด',
        children: [
          { href: '/dashboard/instructor', label: 'ผู้สอน' },
          { href: '/dashboard/department', label: 'สาขา' },
          { href: '/dashboard/faculty', label: 'คณะ' },
          { href: '/dashboard/subject', label: 'รายวิชา' },
        ],
      },
      { href: '/admin/form-builder', label: 'จัดการแบบฟอร์ม' },
      { href: '/admin/users', label: 'จัดการผู้ใช้' },
    ]
  }

  return base
}

export default function Navbar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const navLinks = getNavLinks(user?.role)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const isLoginPage = pathname === '/login'
  if (isLoginPage) return null

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-800 font-bold text-sm">RMU</span>
            </div>
            <div className="leading-tight">
              <div className="font-bold text-sm">ระบบประเมินการสอน</div>
              <div className="text-blue-300 text-xs">Rajamangala University</div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) =>
              'children' in link ? (
                <div key={link.label} className="relative group">
                  <button className="px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-1">
                    {link.label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded shadow-lg py-1 hidden group-hover:block z-50">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-4 py-2 text-sm hover:bg-blue-50 ${
                          pathname === child.href ? 'text-blue-700 font-medium bg-blue-50' : 'text-gray-700'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    pathname === link.href ? 'bg-blue-900 text-white' : 'hover:bg-blue-700 text-blue-100'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* User Info */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-blue-700 rounded-full px-3 py-1.5">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-xs">{user.name.slice(-1)}</span>
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-blue-300 text-xs">{ROLE_LABEL[user.role]}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-blue-300 hover:text-white text-xs px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-white text-blue-800 text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-blue-50 transition-colors">
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
