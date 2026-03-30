'use client'

import { useState } from 'react'

interface Question {
  id?: string
  text: string
  type: 'rating' | 'text'
  order: number
  required: boolean
}

interface Section {
  id?: string
  title: string
  order: number
  questions: Question[]
}

interface Form {
  id: string
  title: string
  description: string | null
  isActive: boolean
  sections: Section[]
}

interface FormBuilderClientProps {
  form: Form | null
}

export default function FormBuilderClient({ form: initialForm }: FormBuilderClientProps) {
  const [form, setForm] = useState<Form | null>(initialForm)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [newFormTitle, setNewFormTitle] = useState('')
  const [newFormDesc, setNewFormDesc] = useState('')
  const [newSectionTitle, setNewSectionTitle] = useState('')

  const showMsg = (text: string) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  const createForm = async () => {
    if (!newFormTitle.trim()) return
    setSaving(true)
    const res = await fetch('/api/admin/form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newFormTitle, description: newFormDesc }),
    })
    const data = await res.json()
    if (res.ok) {
      setForm(data)
      setNewFormTitle('')
      setNewFormDesc('')
      showMsg('สร้างแบบฟอร์มแล้ว')
    }
    setSaving(false)
  }

  const toggleActive = async () => {
    if (!form) return
    setSaving(true)
    const res = await fetch(`/api/admin/form/${form.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !form.isActive }),
    })
    const data = await res.json()
    if (res.ok) {
      setForm((f) => f ? { ...f, isActive: data.isActive } : f)
      showMsg(data.isActive ? 'เปิดใช้งานแล้ว' : 'ปิดใช้งานแล้ว')
    }
    setSaving(false)
  }

  const addSection = async () => {
    if (!form || !newSectionTitle.trim()) return
    setSaving(true)
    const res = await fetch(`/api/admin/form/${form.id}/section`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newSectionTitle, order: form.sections.length + 1 }),
    })
    const data = await res.json()
    if (res.ok) {
      setForm((f) => f ? { ...f, sections: [...f.sections, { ...data, questions: [] }] } : f)
      setNewSectionTitle('')
      showMsg('เพิ่มหัวข้อแล้ว')
    }
    setSaving(false)
  }

  const addQuestion = async (sectionId: string, sectionIdx: number, text: string, type: 'rating' | 'text', required: boolean) => {
    if (!form || !text.trim()) return
    const section = form.sections[sectionIdx]
    const res = await fetch(`/api/admin/form/${form.id}/section/${sectionId}/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type, required, order: section.questions.length + 1 }),
    })
    const data = await res.json()
    if (res.ok) {
      setForm((f) => {
        if (!f) return f
        const sections = [...f.sections]
        sections[sectionIdx] = { ...sections[sectionIdx], questions: [...sections[sectionIdx].questions, data] }
        return { ...f, sections }
      })
      showMsg('เพิ่มคำถามแล้ว')
    }
  }

  if (!form) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg">
        <h2 className="font-bold text-gray-900 text-lg mb-4">สร้างแบบฟอร์มใหม่</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="ชื่อแบบฟอร์ม *"
            value={newFormTitle}
            onChange={(e) => setNewFormTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <textarea
            placeholder="คำอธิบาย (ไม่บังคับ)"
            value={newFormDesc}
            onChange={(e) => setNewFormDesc(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
          <button
            onClick={createForm}
            disabled={saving || !newFormTitle.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {saving ? 'กำลังสร้าง...' : '+ สร้างแบบฟอร์ม'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className="fixed top-20 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium">
          ✓ {msg}
        </div>
      )}

      {/* Form Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{form.title}</h2>
            {form.description && <p className="text-gray-500 text-sm mt-1">{form.description}</p>}
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${form.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${form.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                {form.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </span>
              <span className="text-gray-400 text-xs">{form.sections.length} หัวข้อ · {form.sections.reduce((s, sec) => s + sec.questions.length, 0)} คำถาม</span>
            </div>
          </div>
          <button
            onClick={toggleActive}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.isActive ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'}`}
          >
            {form.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
          </button>
        </div>
      </div>

      {/* Add Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">เพิ่มหัวข้อใหม่</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="ชื่อหัวข้อ เช่น ด้านการสอน"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            onKeyDown={(e) => e.key === 'Enter' && addSection()}
          />
          <button
            onClick={addSection}
            disabled={saving || !newSectionTitle.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            + เพิ่ม
          </button>
        </div>
      </div>

      {/* Sections */}
      {form.sections.map((section, sIdx) => (
        <SectionEditor
          key={section.id ?? sIdx}
          section={section}
          sectionIdx={sIdx}
          formId={form.id}
          onAddQuestion={addQuestion}
        />
      ))}

      {form.sections.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="text-3xl mb-2">📋</div>
          <p>ยังไม่มีหัวข้อ เพิ่มหัวข้อแรกด้านบน</p>
        </div>
      )}
    </div>
  )
}

function SectionEditor({
  section,
  sectionIdx,
  formId,
  onAddQuestion,
}: {
  section: Section
  sectionIdx: number
  formId: string
  onAddQuestion: (sectionId: string, sectionIdx: number, text: string, type: 'rating' | 'text', required: boolean) => void
}) {
  const [newQ, setNewQ] = useState('')
  const [qType, setQType] = useState<'rating' | 'text'>('rating')
  const [required, setRequired] = useState(true)
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (!newQ.trim() || !section.id) return
    setAdding(true)
    await onAddQuestion(section.id, sectionIdx, newQ, qType, required)
    setNewQ('')
    setAdding(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-blue-600 px-5 py-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-blue-200 font-medium">หัวข้อที่ {sectionIdx + 1}</div>
          <h3 className="text-white font-bold">{section.title}</h3>
        </div>
        <span className="text-blue-200 text-sm">{section.questions.length} คำถาม</span>
      </div>

      {/* Questions */}
      <div className="divide-y divide-gray-100">
        {section.questions.map((q, qi) => (
          <div key={q.id ?? qi} className="px-5 py-3 flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              {qi + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm text-gray-800">{q.text}</p>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.type === 'rating' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                  {q.type === 'rating' ? '⭐ คะแนน 1-5' : '💬 ข้อความ'}
                </span>
                {q.required && <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">บังคับ</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Question */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="เพิ่มคำถามใหม่..."
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <select
            value={qType}
            onChange={(e) => setQType(e.target.value as 'rating' | 'text')}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="rating">คะแนน 1-5</option>
            <option value="text">ข้อความ</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={adding || !newQ.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-60"
          >
            {adding ? '...' : '+'}
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="rounded"
          />
          บังคับตอบ
        </label>
      </div>
    </div>
  )
}
