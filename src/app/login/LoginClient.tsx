'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type UserOption = {
  id: string
  email: string
  name: string
  role: string
  departmentName?: string
  facultyName?: string
}

const ROLE_LABEL: Record<string, string> = {
  STUDENT: 'นักศึกษา',
  TEACHER: 'อาจารย์',
  EXECUTIVE_DEAN: 'คณบดี',
  EXECUTIVE_HEAD: 'หัวหน้าสาขา',
  ADMIN: 'ผู้ดูแลระบบ',
}

const ROLE_COLOR: Record<string, string> = {
  STUDENT: 'bg-blue-100 text-blue-700',
  TEACHER: 'bg-green-100 text-green-700',
  EXECUTIVE_DEAN: 'bg-purple-100 text-purple-700',
  EXECUTIVE_HEAD: 'bg-indigo-100 text-indigo-700',
  ADMIN: 'bg-red-100 text-red-700',
}

const ROLE_ICON: Record<string, string> = {
  STUDENT: '🎓',
  TEACHER: '👨‍🏫',
  EXECUTIVE_DEAN: '🏛️',
  EXECUTIVE_HEAD: '📋',
  ADMIN: '⚙️',
}

export default function LoginClient({ users }: { users: UserOption[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const grouped = users.reduce<Record<string, UserOption[]>>((acc, u) => {
    if (!acc[u.role]) acc[u.role] = []
    acc[u.role].push(u)
    return acc
  }, {})

  const roleOrder = ['ADMIN', 'EXECUTIVE_DEAN', 'EXECUTIVE_HEAD', 'TEACHER', 'STUDENT']

  async function handleLogin(email: string) {
    setLoading(email)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'เกิดข้อผิดพลาด'); return }
      router.push(data.redirect)
      router.refresh()
    } catch {
      setError('ไม่สามารถเชื่อมต่อได้')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold">RMU</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ระบบประเมินการสอน</h1>
          <p className="text-gray-500 mt-1">มหาวิทยาลัยเทคโนโลยีราชมงคล</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full px-4 py-1.5 text-sm">
            <span>⚠️</span> โหมดสาธิต — เลือกผู้ใช้เพื่อเข้าสู่ระบบ
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        {/* User Cards by Role */}
        <div className="space-y-4">
          {roleOrder.map((role) => {
            const roleUsers = grouped[role]
            if (!roleUsers?.length) return null
            return (
              <div key={role} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-lg">{ROLE_ICON[role]}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLOR[role]}`}>
                    {ROLE_LABEL[role]}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {roleUsers.map((u) => (
                    <button
                      key={u.email}
                      onClick={() => handleLogin(u.email)}
                      disabled={!!loading}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-bold text-sm">{u.name.slice(-1)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                          {(u.departmentName || u.facultyName) && (
                            <div className="text-xs text-gray-400 mt-0.5">{u.departmentName || u.facultyName}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {loading === u.email ? (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="text-gray-300 text-sm">→</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
