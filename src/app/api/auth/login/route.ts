import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getSessionCookieName } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: 'ไม่พบผู้ใช้งาน' }, { status: 404 })

  cookies().set(getSessionCookieName(), user.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  // Return redirect path based on role
  const redirectMap: Record<string, string> = {
    STUDENT: '/student',
    TEACHER: '/teacher',
    EXECUTIVE_DEAN: '/executive',
    EXECUTIVE_HEAD: '/executive',
    ADMIN: '/admin',
  }

  return NextResponse.json({ redirect: redirectMap[user.role] ?? '/' })
}
