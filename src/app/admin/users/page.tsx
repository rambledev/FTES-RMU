import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import UsersClient from './UsersClient'

async function getData() {
  const [users, faculties, departments] = await Promise.all([
    prisma.user.findMany({
      include: {
        department: { select: { id: true, name: true } },
        faculty: { select: { id: true, name: true } },
        student: { select: { id: true, studentId: true } },
        instructor: { select: { id: true } },
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    }),
    prisma.faculty.findMany({ orderBy: { name: 'asc' } }),
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
  ])
  return { users, faculties, departments }
}

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'ADMIN') redirect('/')

  const { users, faculties, departments } = await getData()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-blue-600">แผงควบคุม</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">จัดการผู้ใช้</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h1>
        <p className="text-gray-500 mt-1">ตั้งค่าบทบาทและสิทธิ์การเข้าถึง</p>
      </div>

      <UsersClient
        users={users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          department: u.department,
          faculty: u.faculty,
          student: u.student,
          instructor: u.instructor,
        }))}
        faculties={faculties.map((f) => ({ id: f.id, name: f.name }))}
        departments={departments.map((d) => ({ id: d.id, name: d.name, facultyId: d.facultyId }))}
      />
    </div>
  )
}
