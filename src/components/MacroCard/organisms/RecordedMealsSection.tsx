import MealsHeader from '../molecules/MealsHeader'
import MealItem from './MealItem'
import { RecordedMeal } from '@/lib/mealStorage'

interface RecordedMealsSectionProps {
  meals: RecordedMeal[]
  onEditMeal: (mealId: string) => void
  onDeleteMeal: (mealId: string) => void
}

const mealTypeOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'other'] as const
const mealTypeLabels = {
  breakfast: '🌅 Breakfast',
  lunch: '🌞 Lunch', 
  dinner: '🌙 Dinner',
  snack: '🍎 Snacks',
  other: '🍽️ Other'
}

export default function RecordedMealsSection({
  meals,
  onEditMeal,
  onDeleteMeal,
}: RecordedMealsSectionProps) {
  if (meals.length === 0) {
    return null
  }

  // Group meals by mealType
  const groupedMeals = meals.reduce((groups, meal) => {
    const mealType = meal.fullNutritionData?.mealType || 'other'
    if (!groups[mealType]) {
      groups[mealType] = []
    }
    groups[mealType].push(meal)
    return groups
  }, {} as Record<string, RecordedMeal[]>)

  // Sort meals within each group by timestamp (newest first)
  Object.keys(groupedMeals).forEach(mealType => {
    groupedMeals[mealType].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  })

  return (
    <div className="pt-4 border-t">
      <MealsHeader mealCount={meals.length} />
      <div className="space-y-6">
        {mealTypeOrder.map((mealType) => {
          const mealsInGroup = groupedMeals[mealType]
          if (!mealsInGroup || mealsInGroup.length === 0) {
            return null
          }

          return (
            <div key={mealType} className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 px-2 py-1 bg-gray-100 rounded-lg animate-in fade-in slide-in-from-left-1 duration-300">
                {mealTypeLabels[mealType]} ({mealsInGroup.length})
              </h4>
              <div className="space-y-2">
                {mealsInGroup.map((meal, index) => (
                  <div
                    key={meal.id}
                    className="animate-in fade-in slide-in-from-bottom-1 duration-500"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <MealItem
                      meal={meal}
                      onEdit={onEditMeal}
                      onDelete={onDeleteMeal}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
