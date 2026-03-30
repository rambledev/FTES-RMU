import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { formId: string } }) {
  const { title, order } = await req.json()
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const section = await prisma.section.create({
    data: { title, order, formId: params.formId },
  })
  return NextResponse.json(section, { status: 201 })
}
