import { Utensils, Clock } from 'lucide-react'
import { getMealTypeIcon } from '../utils/mealTypeHelpers'
import HealthScoreBadge from '../atoms/HealthScoreBadge'

interface MealHeaderProps {
  mealName: string
  mealType: string
  portionSize: string
  healthScore: number
}

export default function MealHeader({
  mealName,
  mealType,
  portionSize,
  healthScore,
}: MealHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">{getMealTypeIcon(mealType)}</span>
          {mealName}
        </h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Utensils className="w-4 h-4" />
            {portionSize}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </span>
        </div>
      </div>
      <HealthScoreBadge score={healthScore} />
    </div>
  )
}