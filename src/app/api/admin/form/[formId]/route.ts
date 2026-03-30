import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { formId: string } }) {
  const { isActive } = await req.json()
  const form = await prisma.evaluationForm.update({
    where: { id: params.formId },
    data: { isActive },
  })
  return NextResponse.json(form)
}
