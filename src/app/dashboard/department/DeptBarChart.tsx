'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'

interface DeptBarChartProps {
  data: { name: string; avgScore: number }[]
}

const COLORS = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#0891b2']

export default function DeptBarChart({ data }: DeptBarChartProps) {
  if (data.length === 0) return <div className="text-center py-8 text-gray-400">ไม่มีข้อมูล</div>

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: number) => [v.toFixed(2), 'คะแนนเฉลี่ย']} />
        <ReferenceLine y={4} stroke="#22c55e" strokeDasharray="4 4" />
        <Bar dataKey="avgScore" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
