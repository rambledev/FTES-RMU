import { cookies } from 'next/headers'
import { prisma } from './prisma'

const COOKIE_NAME = 'ftes_session'

export type SessionUser = {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'TEACHER' | 'EXECUTIVE_DEAN' | 'EXECUTIVE_HEAD' | 'ADMIN'
  facultyId: string | null
  departmentId: string | null
  faculty: { id: string; name: string } | null
  department: { id: string; name: string } | null
  student: { id: string; studentId: string } | null
  instructor: { id: string } | null
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = cookies()
  const userId = cookieStore.get(COOKIE_NAME)?.value
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      faculty: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
      student: { select: { id: true, studentId: true } },
      instructor: { select: { id: true } },
    },
  })

  if (!user) return null
  return user as SessionUser
}

export function getSessionCookieName() {
  return COOKIE_NAME
}
