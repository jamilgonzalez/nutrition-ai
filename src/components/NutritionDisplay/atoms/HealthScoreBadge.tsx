import { Star } from 'lucide-react'
import { getHealthScoreColor } from '../utils/mealTypeHelpers'

interface HealthScoreBadgeProps {
  score: number
}

export default function HealthScoreBadge({ score }: HealthScoreBadgeProps) {
  return (
    <div className={`px-3 py-2 rounded-lg font-semibold ${getHealthScoreColor(score)}`}>
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4" />
        {score}/10
      </div>
    </div>
  )
}