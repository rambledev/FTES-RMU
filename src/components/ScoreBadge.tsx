interface ScoreBadgeProps {
  score: number
}

function getScoreStyle(score: number) {
  if (score >= 4.5) return { bg: 'bg-green-100 text-green-700', label: 'ดีเยี่ยม' }
  if (score >= 4.0) return { bg: 'bg-blue-100 text-blue-700', label: 'ดีมาก' }
  if (score >= 3.5) return { bg: 'bg-yellow-100 text-yellow-700', label: 'ดี' }
  if (score >= 3.0) return { bg: 'bg-orange-100 text-orange-700', label: 'พอใช้' }
  return { bg: 'bg-red-100 text-red-700', label: 'ต้องปรับปรุง' }
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  const { bg, label } = getScoreStyle(score)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bg}`}>
      <span className="font-bold text-sm">{score.toFixed(2)}</span>
      <span className="opacity-70">/ 5.00</span>
      <span className="ml-1 px-1.5 py-0.5 bg-white/60 rounded-full">{label}</span>
    </span>
  )
}
