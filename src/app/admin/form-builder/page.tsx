import { prisma } from '@/lib/prisma'
import FormBuilderClient from './FormBuilderClient'

async function getForm() {
  const form = await prisma.evaluationForm.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          questions: { orderBy: { order: 'asc' } },
        },
      },
    },
  })
  return form
}

export default async function FormBuilderPage() {
  const form = await getForm()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการแบบฟอร์มประเมิน</h1>
          <p className="text-gray-500 mt-1">สร้างและจัดการแบบประเมินการสอน</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg">
          <span>⚙️</span>
          <span>Admin Panel</span>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
        <span className="text-lg">ℹ️</span>
        <div>
          <strong>หมายเหตุ:</strong> ระบบรองรับแบบฟอร์มได้ 1 ชุดต่อครั้ง (Active Form)
          การเปลี่ยนแปลงจะมีผลกับการประเมินใหม่ทันที ข้อมูลการประเมินเดิมจะไม่ถูกกระทบ
        </div>
      </div>

      <FormBuilderClient form={form as Parameters<typeof FormBuilderClient>[0]['form']} />
    </div>
  )
}
