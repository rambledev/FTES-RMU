import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    include: {
      department: { select: { id: true, name: true } },
      faculty: { select: { id: true, name: true } },
      student: { select: { id: true, studentId: true } },
      instructor: { select: { id: true } },
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(users)
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'ไม่มีสิทธิ์' }, { status: 403 })
  }

  const { id, role, facultyId, departmentId } = await req.json()
  if (!id || !role) return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })

  const user = await prisma.user.update({
    where: { id },
    data: {
      role,
      facultyId: facultyId || null,
      departmentId: departmentId || null,
    },
  })

  return NextResponse.json(user)
}
