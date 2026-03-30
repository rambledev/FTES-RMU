'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  text: string
  type: string
  order: number
  required: boolean
}

interface Section {
  id: string
  title: string
  order: number
  questions: Question[]
}

interface EvaluateFormProps {
  assignmentId: string
  formId: string
  termId: string
  studentId: string
  sections: Section[]
}


export default function EvaluateForm({ assignmentId, formId, termId, studentId, sections }: EvaluateFormProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, number | string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [currentSection, setCurrentSection] = useState(0)

  const allRatingQuestions = sections.flatMap((s) => s.questions.filter((q) => q.type === 'rating' && q.required))
  const answeredRating = allRatingQuestions.filter((q) => answers[q.id] !== undefined).length
  const progress = allRatingQuestions.length > 0 ? Math.round((answeredRating / allRatingQuestions.length) * 100) : 0

  const setRating = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const setText = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    // Validate required questions
    const missing = allRatingQuestions.filter((q) => answers[q.id] === undefined)
    if (missing.length > 0) {
      setError(`กรุณาตอบคำถามให้ครบทุกข้อ (ยังเหลืออีก ${missing.length} ข้อ)`)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        valueInt: typeof value === 'number' ? value : null,
        valueText: typeof value === 'string' ? value : null,
      }))

      const res = await fetch('/api/evaluation/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          teachingAssignmentId: assignmentId,
          formId,
          termId,
          answers: formattedAnswers,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'เกิดข้อผิดพลาด')
      }

      router.push('/student?submitted=1')
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setSubmitting(false)
    }
  }

  const totalSections = sections.length

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">ความคืบหน้า</span>
          <span className="font-bold text-blue-700">{answeredRating} / {allRatingQuestions.length} ข้อ ({progress}%)</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Rating Scale Legend */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-blue-800">
        <span className="font-semibold text-blue-700 shrink-0">เกณฑ์การให้คะแนน:</span>
        {([
          [1, 'ควรปรับปรุง'],
          [2, 'พอใช้'],
          [3, 'ดี'],
          [4, 'ดีมาก'],
          [5, 'ดีเยี่ยม'],
        ] as [number, string][]).map(([v, label]) => (
          <span key={v} className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{v}</span>
            <span className="text-gray-600">{label}</span>
          </span>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 flex-wrap">
        {sections.map((sec, i) => (
          <button
            key={sec.id}
            onClick={() => setCurrentSection(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentSection === i
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-blue-50'
            }`}
          >
            {i + 1}. {sec.title}
          </button>
        ))}
      </div>

      {/* Current Section */}
      {sections[currentSection] && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <div className="text-xs text-blue-200 font-medium">ส่วนที่ {currentSection + 1} / {totalSections}</div>
            <h2 className="text-white font-bold text-lg">{sections[currentSection].title}</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {sections[currentSection].questions.map((q, qi) => (
              <div key={q.id} className="p-6">
                <div className="flex gap-3 mb-4">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {qi + 1}
                  </span>
                  <p className="text-gray-900 font-medium leading-relaxed">
                    {q.text}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                </div>

                {q.type === 'rating' ? (
                  <div className="flex gap-2 ml-10">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setRating(q.id, v)}
                        className={`w-12 h-12 rounded-xl border-2 font-bold text-lg transition-all ${
                          answers[q.id] === v
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md scale-110'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className="ml-10 w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                    rows={3}
                    placeholder="ข้อเสนอแนะ (ไม่บังคับ)"
                    value={typeof answers[q.id] === 'string' ? (answers[q.id] as string) : ''}
                    onChange={(e) => setText(q.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
            <button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-white transition-colors"
            >
              ← ก่อนหน้า
            </button>

            {currentSection < totalSections - 1 ? (
              <button
                onClick={() => setCurrentSection(currentSection + 1)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ถัดไป →
              </button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      กำลังส่ง...
                    </>
                  ) : (
                    '✓ ส่งแบบประเมิน'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
