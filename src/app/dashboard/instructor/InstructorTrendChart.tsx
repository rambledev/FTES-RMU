'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface ChartData {
  term: string
  avgScore: number
}

export default function InstructorTrendChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) return <div className="text-center py-8 text-gray-400">ไม่มีข้อมูล</div>

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="term" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => [value.toFixed(2), 'คะแนนเฉลี่ย']}
          labelFormatter={(label) => `ภาคเรียน ${label}`}
        />
        <ReferenceLine y={4} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'เป้าหมาย 4.0', position: 'right', fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="avgScore"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ r: 5, fill: '#2563eb' }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
