import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Utensils,
  ChefHat,
  BarChart3,
} from 'lucide-react'
import { useState } from 'react'
import { type RecordedMeal } from '@/lib/mealStorage'
import { openExternalUrl, getSafeFaviconUrl } from '@/utils/urlValidation'

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

interface RecommendationData {
  text: string
  type: 'positive' | 'caution'
}

interface ProcessedMealData {
  hasFullData: boolean
  healthScore?: number
  mealType?: string
  portionSize?: string
  ingredients?: string[]
  macros?: {
    fiber?: number
    sugar?: number
  }
  recommendations?: RecommendationData[]
  sources?: Array<{
    title?: string
    domain?: string
    url: string
  }>
}

function processRecommendations(recommendations: any[]): RecommendationData[] {
  return recommendations.map((rec) => ({
    text: typeof rec === 'string' ? rec : rec.text || String(rec),
    type: (typeof rec === 'object' && rec.type === 'caution') ? 'caution' : 'positive'
  }))
}

function processMealData(item: MealItemData): ProcessedMealData {
  const fullNutritionData = item.fullMeal?.fullNutritionData
  
  if (!fullNutritionData) {
    return { hasFullData: false }
  }
  
  return {
    hasFullData: true,
    healthScore: fullNutritionData.healthScore,
    mealType: fullNutritionData.mealType,
    portionSize: fullNutritionData.portionSize,
    ingredients: fullNutritionData.ingredients,
    macros: fullNutritionData.macros,
    recommendations: fullNutritionData.recommendations ? 
      processRecommendations(fullNutritionData.recommendations) : undefined,
    sources: fullNutritionData.sources
  }
}

export default function MobileMealItem({
  item,
  onDelete,
}: MobileMealItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const processedData = processMealData(item)
  const { hasFullData } = processedData
  
  // Validate required data
  const safeName = item.name || 'Unknown meal'
  const safeTime = item.time || 'Unknown time'
  const safeCalories = Math.max(0, item.calories || 0)
  const safeProtein = Math.max(0, item.protein || 0)
  const safeCarbs = Math.max(0, item.carbs || 0)
  const safeFat = Math.max(0, item.fat || 0)

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardContent className="p-3">
        <article className="space-y-2">
          <header className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-800 text-sm truncate pr-2">
                {safeName}
              </h4>
              <time className="text-xs text-slate-500" dateTime={safeTime}>
                {safeTime}
              </time>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0" role="toolbar" aria-label="Meal actions">
              {hasFullData && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? "Collapse meal details" : "Expand meal details"}
                  aria-expanded={isExpanded}
                  aria-controls="meal-details"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  )}
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 text-slate-400 hover:text-red-500"
                  onClick={onDelete}
                  aria-label={`Delete ${safeName} meal`}
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                </Button>
              )}
            </div>
          </header>

          <section className="flex items-center gap-2 flex-wrap" aria-label="Nutritional information">
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-2 py-0.5"
              aria-label={`${safeCalories} calories`}
            >
              {safeCalories} cal
            </Badge>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5"
              aria-label={`${safeProtein} grams protein`}
            >
              {safeProtein}p
            </Badge>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-0.5"
              aria-label={`${safeCarbs} grams carbohydrates`}
            >
              {safeCarbs}c
            </Badge>
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2 py-0.5"
              aria-label={`${safeFat} grams fat`}
            >
              {safeFat}f
            </Badge>
          </section>

          {/* Expanded Details */}
          {isExpanded && hasFullData && (
            <section id="meal-details" className="mt-4 space-y-4" aria-label="Detailed meal information">
              <Separator />
              {/* Health Score and Meal Type */}
              <div className="flex items-center gap-2 flex-wrap">
                {processedData.healthScore && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 text-xs"
                    aria-label={`Health score: ${processedData.healthScore} out of 10`}
                  >
                    Health Score: {processedData.healthScore}/10
                  </Badge>
                )}
                {processedData.mealType && (
                  <Badge variant="outline" className="capitalize text-xs">
                    {processedData.mealType}
                  </Badge>
                )}
              </div>

              {/* Portion Size */}
              {processedData.portionSize && (
                <div>
                  <h5 className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                    <Utensils className="w-4 h-4" aria-hidden="true" />
                    Portion Size
                  </h5>
                  <p className="text-xs text-slate-600">
                    {processedData.portionSize}
                  </p>
                </div>
              )}

              {/* Ingredients */}
              {processedData.ingredients && processedData.ingredients.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-1">
                    <ChefHat className="w-4 h-4" aria-hidden="true" />
                    Ingredients
                  </h5>
                  <div className="flex flex-wrap gap-1" role="list" aria-label="Meal ingredients">
                    {processedData.ingredients.map((ingredient, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs"
                        role="listitem"
                      >
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Macros */}
              {processedData.macros && (processedData.macros.fiber || processedData.macros.sugar) && (
                <>
                  <Separator />
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4" aria-hidden="true" />
                      Detailed Macros
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {processedData.macros.fiber && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Fiber:</span>
                          <span className="font-medium">
                            {processedData.macros.fiber}g
                          </span>
                        </div>
                      )}
                      {processedData.macros.sugar && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Sugar:</span>
                          <span className="font-medium">
                            {processedData.macros.sugar}g
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Recommendations */}
              {processedData.recommendations && processedData.recommendations.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" aria-hidden="true" />
                      AI Recommendations
                    </h5>
                    <div className="space-y-1" role="list" aria-label="AI recommendations">
                      {processedData.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          role="listitem"
                          className={`p-2 rounded-md border text-xs ${
                            rec.type === 'positive'
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}
                        >
                          <div className="flex items-start gap-1">
                            {rec.type === 'positive' ? (
                              <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                            )}
                            <p className="leading-relaxed">{rec.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Sources */}
              {processedData.sources && processedData.sources.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      Data Sources
                    </h5>
                    <div className="grid grid-cols-1 gap-1" role="list" aria-label="Data sources">
                      {processedData.sources.map((source, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="h-auto py-1 px-2 text-xs bg-white hover:bg-slate-50 border-slate-200 flex items-center justify-start w-full"
                          onClick={() => source.url && openExternalUrl(source.url)}
                          aria-label={`Visit ${source.title || source.domain} source`}
                          role="listitem"
                        >
                          {getSafeFaviconUrl(source.url) && (
                            <img 
                              src={getSafeFaviconUrl(source.url)}
                              alt={`${source.domain || new URL(source.url).hostname} favicon`}
                              className="w-4 h-4 mr-1 flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'inline';
                              }}
                            />
                          )}
                          <span className="mr-1 flex-shrink-0 hidden">🔗</span>
                          <span className="truncate">
                            {source.title || source.domain}
                          </span>
                          <ExternalLink className="w-2 h-2 ml-1 flex-shrink-0" aria-hidden="true" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </section>
          )}
        </article>
      </CardContent>
    </Card>
  )
}
