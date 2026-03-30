import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { formId: string; sectionId: string } }
) {
  const { text, type, order, required } = await req.json()
  if (!text || !type) return NextResponse.json({ error: 'text and type required' }, { status: 400 })

  const question = await prisma.question.create({
    data: { text, type, order, required: required ?? true, sectionId: params.sectionId },
  })
  return NextResponse.json(question, { status: 201 })
}
