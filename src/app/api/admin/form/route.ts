import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { title, description } = await req.json()
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const form = await prisma.evaluationForm.create({
    data: { title, description, isActive: true },
    include: { sections: { include: { questions: true } } },
  })
  return NextResponse.json(form, { status: 201 })
}
