import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSessionCookieName } from '@/lib/session'

export async function POST() {
  cookies().delete(getSessionCookieName())
  return NextResponse.json({ ok: true })
}
