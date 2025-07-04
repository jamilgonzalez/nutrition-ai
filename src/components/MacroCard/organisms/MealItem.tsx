import { Card, CardContent } from '@/components/ui/card'
import MealImage from '../molecules/MealImage'
import MealActions from '../molecules/MealActions'
import MealNutrition from '../molecules/MealNutrition'
import { MealItemProps } from '../types'

export default function MealItem({ meal, onEdit, onDelete }: MealItemProps) {
  return (
    <Card className="bg-gradient-to-r from-gray-50 to-green-50 border-gray-200 hover:shadow-sm transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Meal Image */}
          {meal.image && <MealImage src={meal.image} alt={meal.name} />}

          {/* Meal Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-gray-900 text-sm truncate">
                {meal.name}
              </h5>
              <MealActions
                onEdit={() => onEdit(meal.id)}
                onDelete={() => onDelete(meal.id)}
                timestamp={meal.timestamp}
              />
            </div>

            {/* Macro Pills */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex-1"></div>
              <MealNutrition meal={meal} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}