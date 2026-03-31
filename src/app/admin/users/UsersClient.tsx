'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  email: string
  name: string
  role: string
  department?: { id: string; name: string } | null
  faculty?: { id: string; name: string } | null
  student?: { studentId: string } | null
  instructor?: { id: string } | null
}

type Faculty = { id: string; name: string }
type Department = { id: string; name: string; facultyId: string }

const ROLE_OPTIONS = [
  { value: 'STUDENT', label: 'นักศึกษา' },
  { value: 'TEACHER', label: 'อาจารย์' },
  { value: 'EXECUTIVE_DEAN', label: 'คณบดี' },
  { value: 'EXECUTIVE_HEAD', label: 'หัวหน้าสาขา' },
  { value: 'ADMIN', label: 'ผู้ดูแลระบบ' },
]

const ROLE_BADGE: Record<string, string> = {
  STUDENT: 'bg-blue-100 text-blue-700',
  TEACHER: 'bg-green-100 text-green-700',
  EXECUTIVE_DEAN: 'bg-purple-100 text-purple-700',
  EXECUTIVE_HEAD: 'bg-indigo-100 text-indigo-700',
  ADMIN: 'bg-red-100 text-red-700',
}

export default function UsersClient({
  users,
  faculties,
  departments,
}: {
  users: User[]
  faculties: Faculty[]
  departments: Department[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<string | null>(null)
  const [editRole, setEditRole] = useState('')
  const [editFacultyId, setEditFacultyId] = useState('')
  const [editDeptId, setEditDeptId] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')

  function startEdit(user: User) {
    setEditing(user.id)
    setEditRole(user.role)
    setEditFacultyId(user.faculty?.id ?? '')
    setEditDeptId(user.department?.id ?? '')
  }

  function cancelEdit() {
    setEditing(null)
    setEditRole('')
    setEditFacultyId('')
    setEditDeptId('')
  }

  async function saveEdit(userId: string) {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          role: editRole,
          facultyId: editRole === 'EXECUTIVE_DEAN' ? editFacultyId : null,
          departmentId: editRole === 'EXECUTIVE_HEAD' ? editDeptId : null,
        }),
      })
      if (!res.ok) { alert('เกิดข้อผิดพลาด'); return }
      router.refresh()
      cancelEdit()
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search || u.name.includes(search) || u.email.includes(search)
    const matchRole = !filterRole || u.role === filterRole
    return matchSearch && matchRole
  })

  const filteredDepts = editFacultyId
    ? departments.filter((d) => d.facultyId === editFacultyId)
    : departments

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="ค้นหาชื่อ / อีเมล..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">ทุกบทบาท</option>
          {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <span className="font-bold text-gray-900">ผู้ใช้ทั้งหมด ({filteredUsers.length} คน)</span>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">ชื่อ / อีเมล</th>
              <th className="px-6 py-3 text-left">บทบาท</th>
              <th className="px-6 py-3 text-left">สังกัด</th>
              <th className="px-6 py-3 text-left">ข้อมูลเชื่อม</th>
              <th className="px-6 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </td>
                <td className="px-6 py-3">
                  {editing === user.id ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  ) : (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGE[user.role]}`}>
                      {ROLE_OPTIONS.find((r) => r.value === user.role)?.label}
                    </span>
                  )}
                </td>
                <td className="px-6 py-3 text-sm text-gray-500">
                  {editing === user.id ? (
                    <div className="space-y-1">
                      {editRole === 'EXECUTIVE_DEAN' && (
                        <select
                          value={editFacultyId}
                          onChange={(e) => setEditFacultyId(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">— เลือกคณะ —</option>
                          {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                      )}
                      {editRole === 'EXECUTIVE_HEAD' && (
                        <select
                          value={editDeptId}
                          onChange={(e) => setEditDeptId(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">— เลือกสาขา —</option>
                          {filteredDepts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      )}
                      {editRole !== 'EXECUTIVE_DEAN' && editRole !== 'EXECUTIVE_HEAD' && (
                        <span className="text-gray-400 text-xs">ไม่จำเป็น</span>
                      )}
                    </div>
                  ) : (
                    <span>{user.faculty?.name || user.department?.name || '-'}</span>
                  )}
                </td>
                <td className="px-6 py-3 text-sm text-gray-500">
                  {user.student ? (
                    <span className="text-blue-600">นักศึกษา #{user.student.studentId}</span>
                  ) : user.instructor ? (
                    <span className="text-green-600">อาจารย์</span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="px-6 py-3 text-center">
                  {editing === user.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => saveEdit(user.id)}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg disabled:opacity-50"
                      >
                        {saving ? 'บันทึก...' : 'บันทึก'}
                      </button>
                      <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1">
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      แก้ไข
                    </button>
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
