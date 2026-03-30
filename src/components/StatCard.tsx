interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
  icon?: string
}

const colorMap = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  red: 'bg-red-50 border-red-200 text-red-700',
}

export default function StatCard({ title, value, subtitle, color = 'blue', icon }: StatCardProps) {
  return (
    <div className={`rounded-xl border-2 p-5 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
        </div>
        {icon && <span className="text-3xl opacity-60">{icon}</span>}
      </div>
    </div>
  )
}
