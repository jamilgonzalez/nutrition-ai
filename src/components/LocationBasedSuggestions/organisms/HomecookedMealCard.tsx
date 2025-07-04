import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MacroDisplay from '../molecules/MacroDisplay'
import { SuggestedMeal } from '../types'

interface HomecookedMealCardProps {
  meal: SuggestedMeal
}

export default function HomecookedMealCard({ meal }: HomecookedMealCardProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-blue-900">{meal.name}</h4>
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-700 border-blue-200"
          >
            AI Recommended
          </Badge>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          Perfect balance for your remaining macros
        </p>
        <MacroDisplay
          calories={meal.calories}
          protein={meal.protein}
          carbs={meal.carbs}
          fat={meal.fat}
        />
      </CardContent>
    </Card>
  )
}