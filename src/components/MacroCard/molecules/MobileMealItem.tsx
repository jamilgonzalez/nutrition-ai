import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { type RecordedMeal } from '@/lib/mealStorage'
import SourceCitation from '../../SourceCitation'

interface MealItemData {
  id: string
  name: string
  time: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fullMeal?: RecordedMeal
}

interface MobileMealItemProps {
  item: MealItemData
  onDelete?: () => void
}

export default function MobileMealItem({ 
  item, 
  onDelete
}: MobileMealItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasFullData = item.fullMeal?.fullNutritionData

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-800 text-sm truncate pr-2">
                {item.name}
              </h4>
              <p className="text-xs text-slate-500">{item.time}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasFullData && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 h-6 w-6"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  )}
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 h-6 w-6 text-slate-400 hover:text-red-500"
                  onClick={onDelete}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0.5"
            >
              {item.calories}cal
            </Badge>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5"
            >
              {item.protein}p
            </Badge>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-0.5"
            >
              {item.carbs}c
            </Badge>
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2 py-0.5"
            >
              {item.fat}f
            </Badge>
          </div>

          {/* Expanded Details */}
          {isExpanded && hasFullData && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
              {/* Health Score and Meal Type */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                  Health Score: {item.fullMeal?.fullNutritionData?.healthScore}/10
                </Badge>
                <Badge variant="outline" className="capitalize text-xs">
                  {item.fullMeal?.fullNutritionData?.mealType}
                </Badge>
              </div>

              {/* Portion Size */}
              {item.fullMeal?.fullNutritionData?.portionSize && (
                <div>
                  <h6 className="font-medium text-slate-700 text-xs mb-1">
                    Portion Size
                  </h6>
                  <p className="text-xs text-slate-600">
                    {item.fullMeal.fullNutritionData.portionSize}
                  </p>
                </div>
              )}

              {/* Ingredients */}
              {item.fullMeal?.fullNutritionData?.ingredients && item.fullMeal.fullNutritionData.ingredients.length > 0 && (
                <div>
                  <h6 className="font-medium text-slate-700 text-xs mb-1">
                    Ingredients
                  </h6>
                  <div className="flex flex-wrap gap-1">
                    {item.fullMeal.fullNutritionData.ingredients.map(
                      (ingredient, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {ingredient}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Macros */}
              {item.fullMeal?.fullNutritionData?.macros && (
                <div>
                  <h6 className="font-medium text-slate-700 text-xs mb-2">
                    Detailed Macros
                  </h6>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {item.fullMeal.fullNutritionData.macros.fiber && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Fiber:</span>
                        <span className="font-medium">
                          {item.fullMeal.fullNutritionData.macros.fiber}g
                        </span>
                      </div>
                    )}
                    {item.fullMeal.fullNutritionData.macros.sugar && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Sugar:</span>
                        <span className="font-medium">
                          {item.fullMeal.fullNutritionData.macros.sugar}g
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {item.fullMeal?.fullNutritionData?.recommendations && 
               item.fullMeal.fullNutritionData.recommendations.length > 0 && (
                <div>
                  <h6 className="font-medium text-slate-700 text-xs mb-2">
                    Recommendations
                  </h6>
                  <ul className="space-y-1">
                    {item.fullMeal.fullNutritionData.recommendations.map(
                      (rec, index) => (
                        <li
                          key={index}
                          className="text-xs text-slate-600 flex items-start gap-2"
                        >
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Sources */}
              {item.fullMeal?.fullNutritionData?.sources &&
               item.fullMeal.fullNutritionData.sources.length > 0 && (
                <SourceCitation sources={item.fullMeal.fullNutritionData.sources} />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}