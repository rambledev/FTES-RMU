import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import LoginClient from './LoginClient'

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect('/')

  const users = await prisma.user.findMany({
    include: {
      department: { select: { name: true } },
      faculty: { select: { name: true } },
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })

  const userOptions = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    departmentName: u.department?.name,
    facultyName: u.faculty?.name,
  }))

  return <LoginClient users={userOptions} />
}
