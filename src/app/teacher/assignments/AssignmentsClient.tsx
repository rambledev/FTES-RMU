'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Assignment = {
  id: string
  subjectCode: string
  subjectName: string
  departmentName: string
  termLabel: string
  termId: string
  responseCount: number
}

type Subject = { id: string; code: string; name: string; departmentName: string }
type Term = { id: string; label: string; isActive: boolean }

export default function AssignmentsClient({
  assignments,
  subjects,
  terms,
}: {
  assignments: Assignment[]
  subjects: Subject[]
  terms: Term[]
}) {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTerm, setSelectedTerm] = useState(terms.find((t) => t.isActive)?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd() {
    if (!selectedSubject || !selectedTerm) { setError('กรุณาเลือกรายวิชาและภาคการศึกษา'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: selectedSubject, termId: selectedTerm }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.refresh()
      setSelectedSubject('')
    } catch {
      setError('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('ยืนยันการลบรายวิชานี้?')) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error); return }
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">เพิ่มรายวิชาที่สอน</h2>
        <div className="flex gap-3 flex-wrap">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="flex-1 min-w-48 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— เลือกรายวิชา —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                ภาค {t.label}{t.isActive ? ' (ปัจจุบัน)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'กำลังเพิ่ม...' : '+ เพิ่ม'}
          </button>
        </div>
        {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
      </div>

      {/* Assignments list */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">รายวิชาที่รับผิดชอบทั้งหมด ({assignments.length} รายการ)</h2>
        </div>
        {assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-sm">ยังไม่มีรายวิชา</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">ภาค</th>
                <th className="px-6 py-3 text-left">รหัสวิชา</th>
                <th className="px-6 py-3 text-left">ชื่อวิชา</th>
                <th className="px-6 py-3 text-left">สาขา</th>
                <th className="px-6 py-3 text-center">ผู้ประเมิน</th>
                <th className="px-6 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-600">{a.termLabel}</td>
                  <td className="px-6 py-3">
                    <span className="font-mono text-sm font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{a.subjectCode}</span>
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">{a.subjectName}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{a.departmentName}</td>
                  <td className="px-6 py-3 text-center text-sm text-gray-600">{a.responseCount} คน</td>
                  <td className="px-6 py-3 text-center">
                    {a.responseCount === 0 ? (
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                      >
                        {deletingId === a.id ? 'กำลังลบ...' : 'ลบ'}
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs">มีการประเมินแล้ว</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
