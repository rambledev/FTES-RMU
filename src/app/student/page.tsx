import Link from 'next/link'
import { prisma } from '@/lib/prisma'

// Mock: current logged-in student is student ID 6501001 (index 0 in seed)
const MOCK_STUDENT_ID_CODE = '6501001'

async function getStudentData() {
  const student = await prisma.student.findUnique({
    where: { studentId: MOCK_STUDENT_ID_CODE },
    include: { department: { include: { faculty: true } } },
  })
  if (!student) return null

  const activeTerm = await prisma.term.findFirst({ where: { isActive: true } })
  if (!activeTerm) return { student, assignments: [], activeTerm: null }

  // Get all teaching assignments for the active term
  const assignments = await prisma.teachingAssignment.findMany({
    where: { termId: activeTerm.id },
    include: {
      subject: { include: { department: true } },
      instructor: true,
      term: true,
      responses: {
        where: { studentId: student.id },
        select: { id: true },
      },
    },
    orderBy: { subject: { code: 'asc' } },
  })

  return { student, assignments, activeTerm }
}

export default async function StudentPage() {
  const data = await getStudentData()

  if (!data?.student) {
    return <div className="text-center py-20 text-gray-500">ไม่พบข้อมูลนักศึกษา</div>
  }

  const { student, assignments, activeTerm } = data
  const completed = assignments.filter((a) => a.responses.length > 0).length
  const total = assignments.length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Student Info Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">{student.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-500 text-sm">รหัส: {student.studentId}</p>
              <p className="text-gray-500 text-sm">
                {student.department.name} · {student.department.faculty.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            {activeTerm && (
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-full px-3 py-1 text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                ภาคเรียน {activeTerm.label}
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">ความคืบหน้าการประเมิน</span>
            <span className="font-bold text-blue-700">{completed} / {total} รายวิชา ({progress}%)</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-blue-600 rounded-full h-3 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subject List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">รายวิชาที่ลงทะเบียน (ภาคเรียน {activeTerm?.label})</h2>
          <div className="flex gap-2 text-xs">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">✓ ประเมินแล้ว {completed}</span>
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">⏳ รอประเมิน {total - completed}</span>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p>ไม่มีรายวิชาในภาคการศึกษานี้</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">รหัสวิชา</th>
                <th className="px-6 py-3 text-left">ชื่อวิชา</th>
                <th className="px-6 py-3 text-left">อาจารย์ผู้สอน</th>
                <th className="px-6 py-3 text-center">หน่วยกิต</th>
                <th className="px-6 py-3 text-center">สถานะ</th>
                <th className="px-6 py-3 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.map((a) => {
                const done = a.responses.length > 0
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {a.subject.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{a.subject.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{a.instructor.name}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">{a.subject.credits}</td>
                    <td className="px-6 py-4 text-center">
                      {done ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          ประเมินแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                          รอประเมิน
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {done ? (
                        <span className="text-gray-400 text-sm">เสร็จสิ้น</span>
                      ) : (
                        <Link
                          href={`/student/evaluate/${a.id}`}
                          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
                        >
                          ประเมิน →
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
