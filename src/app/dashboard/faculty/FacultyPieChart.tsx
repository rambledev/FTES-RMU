'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface FacultyPieChartProps {
  data: { name: string; value: number; avgScore: number }[]
}

const COLORS = ['#2563eb', '#16a34a', '#9333ea', '#ea580c']

export default function FacultyPieChart({ data }: FacultyPieChartProps) {
  if (data.every((d) => d.value === 0)) return <div className="text-center py-8 text-gray-400">ไม่มีข้อมูล</div>

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          label={({ name, percent }) => `${percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number, name: string) => [v + ' ครั้ง', name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
