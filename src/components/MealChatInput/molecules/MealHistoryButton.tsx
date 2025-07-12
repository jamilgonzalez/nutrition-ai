'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Search,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  AlertTriangle,
  ExternalLink,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getAllMeals,
  getMealsByFrequency,
  deleteMeal,
  saveMeal,
  type RecordedMeal,
} from '@/lib/mealStorage'
import { analytics } from '@/lib/analytics'
// Import useUser conditionally to avoid errors when ClerkProvider is not available
import { toast } from 'sonner'

interface MealHistoryData {
  id: string
  name: string
  lastEaten: string
  frequency: number
  calories: number
  protein: number
  carbs: number
  fat: number
  isFavorite: boolean
  category: string
}

interface ExpandableMealCardProps {
  meal: MealHistoryData
  onDelete: (mealId: string) => void
  originalMeal: RecordedMeal
  isSelected?: boolean
  onSelect: (mealId: string, selected: boolean) => void
}

function ExpandableMealCard({
  meal,
  onDelete,
  originalMeal,
  isSelected = false,
  onSelect,
}: ExpandableMealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleDelete = () => {
    onDelete(originalMeal.id)
  }

  const handleCardClick = () => {
    onSelect(meal.id, !isSelected)
  }

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleDelete()
  }

  return (
    <Card
      className={`transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white hover:bg-slate-50'
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        {/* Main card header - always visible */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-slate-800 text-sm truncate">
                {meal.name}
              </h4>
              {meal.isFavorite && (
                <Star
                  className="w-3 h-3 text-yellow-500 fill-current"
                  data-testid="star-icon"
                />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Clock className="w-3 h-3" />
              <span>{meal.lastEaten}</span>
              <span>•</span>
              <span>{meal.frequency} times</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
              >
                {meal.calories}cal
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
              >
                {meal.protein}p
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 text-xs"
              >
                {meal.carbs}c
              </Badge>
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
              >
                {meal.fat}f
              </Badge>
            </div>
          </div>

          {/* Action buttons - fixed position */}
          <div className="flex items-start gap-2 ml-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExpandClick}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 flex-shrink-0"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDeleteClick}
              className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
              aria-label="Delete meal from history"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Expanded content - separate from main layout */}
        {isExpanded && originalMeal.fullNutritionData && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="space-y-4">
              {/* Health Score & Meal Type */}
              <div className="flex items-center gap-2 flex-wrap">
                {originalMeal.fullNutritionData.healthScore && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                    Health Score: {originalMeal.fullNutritionData.healthScore}
                    /10
                  </Badge>
                )}
                {originalMeal.fullNutritionData.mealType && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {originalMeal.fullNutritionData.mealType}
                  </Badge>
                )}
              </div>

              {/* Portion Size */}
              {originalMeal.fullNutritionData.portionSize && (
                <div className="text-xs text-slate-600">
                  <span className="font-medium">Portion:</span>{' '}
                  {originalMeal.fullNutritionData.portionSize}
                </div>
              )}

              {/* Ingredients */}
              {originalMeal.fullNutritionData.ingredients &&
                originalMeal.fullNutritionData.ingredients.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-slate-700 mb-2">
                      Ingredients
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {originalMeal.fullNutritionData.ingredients.map(
                        (ingredient, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-slate-50"
                          >
                            {ingredient}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Detailed Macros */}
              {originalMeal.fullNutritionData.macros && (
                <div>
                  <div className="text-xs font-medium text-slate-700 mb-2">
                    Detailed Nutrition
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {originalMeal.fullNutritionData.macros.fiber && (
                      <div className="text-xs text-slate-600">
                        <span className="font-medium">Fiber:</span>{' '}
                        {originalMeal.fullNutritionData.macros.fiber}g
                      </div>
                    )}
                    {originalMeal.fullNutritionData.macros.sugar && (
                      <div className="text-xs text-slate-600">
                        <span className="font-medium">Sugar:</span>{' '}
                        {originalMeal.fullNutritionData.macros.sugar}g
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Micronutrients */}
              {originalMeal.fullNutritionData.micronutrients &&
                Object.keys(originalMeal.fullNutritionData.micronutrients)
                  .length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-slate-700 mb-2">
                      Micronutrients
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {originalMeal.fullNutritionData.micronutrients.sodium && (
                        <Badge variant="outline" className="text-xs">
                          Sodium:{' '}
                          {originalMeal.fullNutritionData.micronutrients.sodium}
                          mg
                        </Badge>
                      )}
                      {originalMeal.fullNutritionData.micronutrients
                        .potassium && (
                        <Badge variant="outline" className="text-xs">
                          Potassium:{' '}
                          {
                            originalMeal.fullNutritionData.micronutrients
                              .potassium
                          }
                          mg
                        </Badge>
                      )}
                      {originalMeal.fullNutritionData.micronutrients
                        .vitaminC && (
                        <Badge variant="outline" className="text-xs">
                          Vitamin C:{' '}
                          {
                            originalMeal.fullNutritionData.micronutrients
                              .vitaminC
                          }
                          mg
                        </Badge>
                      )}
                      {originalMeal.fullNutritionData.micronutrients
                        .calcium && (
                        <Badge variant="outline" className="text-xs">
                          Calcium:{' '}
                          {
                            originalMeal.fullNutritionData.micronutrients
                              .calcium
                          }
                          mg
                        </Badge>
                      )}
                      {originalMeal.fullNutritionData.micronutrients.iron && (
                        <Badge variant="outline" className="text-xs">
                          Iron:{' '}
                          {originalMeal.fullNutritionData.micronutrients.iron}mg
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

              {/* AI Recommendations */}
              {originalMeal.fullNutritionData.recommendations &&
                originalMeal.fullNutritionData.recommendations.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-slate-700 mb-2">
                      AI Recommendations
                    </div>
                    <div className="space-y-2">
                      {originalMeal.fullNutritionData.recommendations.map(
                        (rec, idx) => {
                          const isPositive =
                            rec.toLowerCase().includes('good') ||
                            rec.toLowerCase().includes('excellent') ||
                            rec.toLowerCase().includes('great')
                          const isCaution =
                            rec.toLowerCase().includes('high') ||
                            rec.toLowerCase().includes('consider') ||
                            rec.toLowerCase().includes('limit')
                          return (
                            <div
                              key={idx}
                              className={`flex items-start gap-2 p-2 rounded-md text-xs ${
                                isPositive
                                  ? 'bg-green-50 text-green-800'
                                  : isCaution
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-slate-50 text-slate-700'
                              }`}
                            >
                              {isPositive ? (
                                <Check className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              ) : isCaution ? (
                                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              ) : null}
                              <span>{rec}</span>
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>
                )}

              {/* Data Sources */}
              {originalMeal.fullNutritionData.sources &&
                originalMeal.fullNutritionData.sources.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-slate-700 mb-2">
                      Sources
                    </div>
                    <div className="space-y-2">
                      {originalMeal.fullNutritionData.sources.map(
                        (source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-700 truncate">
                                {source.title || source.domain}
                              </div>
                              {source.snippet && (
                                <div className="text-slate-500 text-xs truncate">
                                  {source.snippet}
                                </div>
                              )}
                            </div>
                            <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MealHistoryButtonProps {
  onMealAdded: (meal: RecordedMeal) => void
  user?: any // Optional user prop to avoid Clerk dependency
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MealHistoryButton({
  onMealAdded,
  user = null,
  isOpen,
  onOpenChange,
}: MealHistoryButtonProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('recent')
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set())

  const allMeals = useMemo(() => getAllMeals(), [])
  const frequentMeals = useMemo(() => getMealsByFrequency(), [])

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getMealFrequency = useCallback(
    (mealName: string) => {
      return allMeals.filter(
        (m) => m.name.toLowerCase().trim() === mealName.toLowerCase().trim()
      ).length
    },
    [allMeals]
  )

  const convertToHistoryData = useCallback(
    (meals: RecordedMeal[]): MealHistoryData[] => {
      return meals.map((meal) => ({
        id: meal.id,
        name: meal.name,
        lastEaten: formatRelativeTime(new Date(meal.timestamp)),
        frequency: getMealFrequency(meal.name),
        calories: meal.nutritionData?.calories || 0,
        protein: meal.nutritionData?.protein || 0,
        carbs: meal.nutritionData?.carbs || 0,
        fat: meal.nutritionData?.fat || 0,
        isFavorite: getMealFrequency(meal.name) >= 3,
        category: meal.fullNutritionData?.mealType || 'other',
      }))
    },
    [getMealFrequency]
  )

  const recentMeals = useMemo(
    () => convertToHistoryData(allMeals.slice(0, 20)),
    [allMeals, convertToHistoryData]
  )
  const mostFrequentMeals = useMemo(
    () => convertToHistoryData(frequentMeals.slice(0, 15)),
    [frequentMeals, convertToHistoryData]
  )

  const filteredRecentMeals = useMemo(() => {
    if (!searchQuery) return recentMeals

    const query = searchQuery.toLowerCase().trim()
    return recentMeals.filter(
      (meal) =>
        meal.name.toLowerCase().includes(query) ||
        meal.category.toLowerCase().includes(query)
    )
  }, [searchQuery, recentMeals])

  const filteredFrequentMeals = useMemo(() => {
    if (!searchQuery) return mostFrequentMeals

    const query = searchQuery.toLowerCase().trim()
    return mostFrequentMeals.filter(
      (meal) =>
        meal.name.toLowerCase().includes(query) ||
        meal.category.toLowerCase().includes(query)
    )
  }, [searchQuery, mostFrequentMeals])

  useEffect(() => {
    if (isOpen && user) {
      analytics.mealHistoryOpened(user.id)
    }
  }, [isOpen, user])

  useEffect(() => {
    if (user && isOpen) {
      analytics.mealHistoryTabChanged(user.id, activeTab)
    }
  }, [activeTab, user, isOpen])

  useEffect(() => {
    if (searchQuery && user) {
      const debounceTimer = setTimeout(() => {
        analytics.mealHistorySearchUsed(user.id, searchQuery)
      }, 500)

      return () => clearTimeout(debounceTimer)
    }
  }, [searchQuery, user])

  const handleSelectMeal = (mealId: string, selected: boolean) => {
    setSelectedMeals((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(mealId)
      } else {
        newSet.delete(mealId)
      }
      return newSet
    })
  }

  const handleAddSelectedMeals = async () => {
    try {
      const mealsToAdd = allMeals.filter((m) => selectedMeals.has(m.id))

      for (const originalMeal of mealsToAdd) {
        const newMeal = {
          name: originalMeal.name,
          notes: `Added from history: ${originalMeal.notes}`,
          image: originalMeal.image,
          nutritionData: originalMeal.nutritionData,
          fullNutritionData: originalMeal.fullNutritionData,
        }

        const savedMeal = saveMeal(newMeal)
        onMealAdded(savedMeal)

        if (user) {
          analytics.mealFromHistoryAdded(user.id, {
            calories: originalMeal.nutritionData?.calories || 0,
            protein: originalMeal.nutritionData?.protein || 0,
            carbs: originalMeal.nutritionData?.carbs || 0,
            fat: originalMeal.nutritionData?.fat || 0,
            name: originalMeal.name,
          })
        }
      }

      toast.success('Meals added!', {
        description: `${mealsToAdd.length} meal${
          mealsToAdd.length > 1 ? 's' : ''
        } added to today's nutrition`,
      })

      setSelectedMeals(new Set())
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding meals from history:', error)
      toast.error('Failed to add meals', {
        description: 'Please try again',
      })
    }
  }

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const success = deleteMeal(mealId)

      if (success) {
        if (user) {
          analytics.mealFromHistoryDeleted(user.id, mealId)
        }

        toast.success('Meal deleted from history')

        // Refresh the component by closing and reopening
        onOpenChange(false)
        setTimeout(() => onOpenChange(true), 100)
      } else {
        throw new Error('Failed to delete meal')
      }
    } catch (error) {
      console.error('Error deleting meal:', error)
      toast.error('Failed to delete meal', {
        description: 'Please try again',
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b border-slate-200">
            <SheetTitle className="text-left">Meal History</SheetTitle>
            <SheetDescription className="text-left text-slate-600">
              Browse and add meals from your history to today's nutrition
            </SheetDescription>
            <div className="flex items-center gap-2 mt-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 border-slate-200"
                />
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-2 mt-4">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="frequent">Frequent</TabsTrigger>
              </TabsList>

              <div
                className={`flex-1 overflow-y-auto ${
                  selectedMeals.size > 0 ? 'pb-20' : ''
                }`}
              >
                <TabsContent value="recent" className="p-4 space-y-3 mt-0">
                  {filteredRecentMeals.map((meal) => {
                    const originalMeal = allMeals.find((m) => m.id === meal.id)!
                    return (
                      <ExpandableMealCard
                        key={meal.id}
                        meal={meal}
                        onDelete={handleDeleteMeal}
                        originalMeal={originalMeal}
                        isSelected={selectedMeals.has(meal.id)}
                        onSelect={handleSelectMeal}
                      />
                    )
                  })}
                  {filteredRecentMeals.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {searchQuery
                          ? 'No recent meals found matching your search'
                          : 'No recent meals found'}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="frequent" className="p-4 space-y-3 mt-0">
                  {filteredFrequentMeals.map((meal) => {
                    const originalMeal = frequentMeals.find(
                      (m) => m.id === meal.id
                    )!
                    return (
                      <ExpandableMealCard
                        key={meal.id}
                        meal={meal}
                        onDelete={handleDeleteMeal}
                        originalMeal={originalMeal}
                        isSelected={selectedMeals.has(meal.id)}
                        onSelect={handleSelectMeal}
                      />
                    )
                  })}
                  {filteredFrequentMeals.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {searchQuery
                          ? 'No frequent meals found matching your search'
                          : 'No frequent meals found'}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Sticky bottom button for adding selected meals */}
          {selectedMeals.size > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg z-50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {selectedMeals.size}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {selectedMeals.size} meal{selectedMeals.size > 1 ? 's' : ''}{' '}
                    selected
                  </span>
                </div>
                <Button
                  onClick={handleAddSelectedMeals}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Today
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
