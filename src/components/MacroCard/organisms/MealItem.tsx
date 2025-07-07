import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import MealImage from '../molecules/MealImage'
import MealActions from '../molecules/MealActions'
import MealNutrition from '../molecules/MealNutrition'
import SourceCitation from '../../SourceCitation'
import { MealItemProps } from '../types'

export default function MealItem({ meal, onEdit, onDelete }: MealItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isNewMeal, setIsNewMeal] = useState(false)
  const hasFullData = meal.fullNutritionData

  // Check if this is a newly added meal (within last 3 seconds)
  useEffect(() => {
    const mealAge = Date.now() - new Date(meal.timestamp).getTime()
    if (mealAge < 3000) {
      // 3 seconds
      setIsNewMeal(true)
      // Remove the new meal flag after animation
      const timer = setTimeout(() => setIsNewMeal(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [meal.timestamp])

  return (
    <Card
      className={`bg-gradient-to-r from-gray-50 to-green-50 border-gray-200 hover:shadow-sm transition-all duration-500 ${
        isNewMeal
          ? 'opacity-0 translate-y-2 animate-in fade-in slide-in-from-bottom-2'
          : 'opacity-100 translate-y-0'
      }`}
    >
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
              <div className="flex items-center gap-2">
                {hasFullData && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                )}
                <MealActions
                  onEdit={() => onEdit(meal.id)}
                  onDelete={() => onDelete(meal.id)}
                  timestamp={meal.timestamp}
                />
              </div>
            </div>

            {/* Macro Pills */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex-1"></div>
              <MealNutrition meal={meal} />
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && hasFullData && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Health Score and Meal Type */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Health Score: {meal.fullNutritionData?.healthScore}/10
              </Badge>
              <Badge variant="outline" className="capitalize">
                {meal.fullNutritionData?.mealType}
              </Badge>
            </div>

            {/* Portion Size */}
            <div>
              <h6 className="font-medium text-gray-700 text-xs mb-1">
                Portion Size
              </h6>
              <p className="text-sm text-gray-600">
                {meal.fullNutritionData?.portionSize}
              </p>
            </div>

            {/* Ingredients */}
            <div>
              <h6 className="font-medium text-gray-700 text-xs mb-1">
                Ingredients
              </h6>
              <div className="flex flex-wrap gap-1">
                {meal.fullNutritionData?.ingredients.map(
                  (ingredient, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {ingredient}
                    </Badge>
                  )
                )}
              </div>
            </div>

            {/* Detailed Macros */}
            <div>
              <h6 className="font-medium text-gray-700 text-xs mb-2">
                Detailed Macros
              </h6>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fiber:</span>
                  <span className="font-medium">
                    {meal.fullNutritionData?.macros.fiber}g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sugar:</span>
                  <span className="font-medium">
                    {meal.fullNutritionData?.macros.sugar}g
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {meal.fullNutritionData?.recommendations &&
              meal.fullNutritionData?.recommendations?.length > 0 && (
                <div>
                  <h6 className="font-medium text-gray-700 text-xs mb-2">
                    Recommendations
                  </h6>
                  <ul className="space-y-1 ">
                    {meal.fullNutritionData?.recommendations.map(
                      (rec, index) => (
                        <li
                          key={index}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <span className="text-green-500 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {/* Sources */}
            {meal.fullNutritionData?.sources &&
              meal.fullNutritionData.sources.length > 0 && (
                <SourceCitation sources={meal.fullNutritionData.sources} />
              )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
