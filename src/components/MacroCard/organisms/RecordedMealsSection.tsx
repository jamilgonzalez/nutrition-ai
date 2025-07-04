import MealsHeader from '../molecules/MealsHeader'
import MealItem from './MealItem'
import { RecordedMeal } from '@/lib/mealStorage'

interface RecordedMealsSectionProps {
  meals: RecordedMeal[]
  onEditMeal: (mealId: string) => void
  onDeleteMeal: (mealId: string) => void
}

export default function RecordedMealsSection({
  meals,
  onEditMeal,
  onDeleteMeal,
}: RecordedMealsSectionProps) {
  if (meals.length === 0) {
    return null
  }

  return (
    <div className="pt-4 border-t">
      <MealsHeader mealCount={meals.length} />
      <div className="space-y-2">
        {meals.map((meal) => (
          <MealItem
            key={meal.id}
            meal={meal}
            onEdit={onEditMeal}
            onDelete={onDeleteMeal}
          />
        ))}
      </div>
    </div>
  )
}
