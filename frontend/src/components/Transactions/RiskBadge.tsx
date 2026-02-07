interface RiskBadgeProps {
  score: number
}

export function RiskBadge({ score }: RiskBadgeProps) {
  const level =
    score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low'
  const color =
    level === 'critical'
      ? '#dc2626'
      : level === 'high'
        ? '#ea580c'
        : level === 'medium'
          ? '#ca8a04'
          : '#16a34a'

  return (
    <span
      style={{
        backgroundColor: color,
        color: 'white',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 12,
      }}
    >
      {score}%
    </span>
  )
}
