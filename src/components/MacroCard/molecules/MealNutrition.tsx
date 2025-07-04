import NutritionBadge from '../atoms/NutritionBadge'
import { RecordedMeal } from '../types'

interface MealNutritionProps {
  meal: RecordedMeal
}

export default function MealNutrition({ meal }: MealNutritionProps) {
  if (!meal.nutritionData) {
    return <p className="text-xs text-gray-500">No nutrition data</p>
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      <NutritionBadge type="calories" value={meal.nutritionData.calories} />
      <NutritionBadge type="protein" value={meal.nutritionData.protein} />
      <NutritionBadge type="carbs" value={meal.nutritionData.carbs} />
      <NutritionBadge type="fat" value={meal.nutritionData.fat} />
    </div>
  )
}