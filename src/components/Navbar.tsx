'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'หน้าหลัก' },
  { href: '/student', label: 'ประเมินการสอน' },
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
]

export default function Navbar() {
  const pathname = usePathname()

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
              link.children ? (
                <div key={link.label} className="relative group">
                  <button className="px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-1">
                    {link.label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded shadow-lg py-1 hidden group-hover:block z-50">
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
                    pathname === link.href
                      ? 'bg-blue-900 text-white'
                      : 'hover:bg-blue-700 text-blue-100'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Mock User */}
          <div className="flex items-center gap-2 bg-blue-700 rounded-full px-3 py-1.5">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-blue-900 font-bold text-xs">ส</span>
            </div>
            <span className="text-sm font-medium">สมชาย ใจดี</span>
            <span className="text-blue-300 text-xs">6501001</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
