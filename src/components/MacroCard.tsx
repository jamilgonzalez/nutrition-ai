'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getTodaysMeals, getTodaysNutritionSummary, type RecordedMeal } from '@/lib/mealStorage'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Edit2 } from 'lucide-react'

export interface DailyNutritionData {
  totalCalories: number
  caloriesRemaining: number
  dailyGoal: number
  protein: {
    current: number
    goal: number
  }
  carbs: {
    current: number
    goal: number
  }
  fat: {
    current: number
    goal: number
  }
  sugar: {
    current: number
    goal: number
  }
  suggestedMeal?: {
    name: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

const mockDailyData: DailyNutritionData = {
  totalCalories: 1650,
  caloriesRemaining: 350,
  dailyGoal: 2000,
  protein: {
    current: 85,
    goal: 120
  },
  carbs: {
    current: 180,
    goal: 250
  },
  fat: {
    current: 55,
    goal: 70
  },
  sugar: {
    current: 45,
    goal: 50
  },
  suggestedMeal: {
    name: 'Grilled Chicken & Sweet Potato',
    calories: 320,
    protein: 35,
    carbs: 40,
    fat: 8
  }
}

function getGradientColor(percentage: number) {
  const clampedPercentage = Math.min(percentage, 100)
  const hue = (1 - clampedPercentage / 100) * 240
  return `hsl(${hue}, 70%, 50%)`
}

export default function MacroCard() {
  const router = useRouter()
  const [recordedMeals, setRecordedMeals] = useState<RecordedMeal[]>([])
  const [nutritionSummary, setNutritionSummary] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  
  useEffect(() => {
    const meals = getTodaysMeals()
    const summary = getTodaysNutritionSummary()
    console.log('Loaded meals:', meals)
    console.log('Nutrition summary:', summary)
    setRecordedMeals(meals)
    setNutritionSummary(summary)
  }, [])

  const handleEditMeal = (mealId: string) => {
    router.push(`/edit-meal?id=${mealId}`)
  }
  
  const data = mockDailyData
  const actualCaloriesConsumed = data.totalCalories + nutritionSummary.calories
  const actualCaloriesRemaining = Math.max(data.dailyGoal - actualCaloriesConsumed, 0)
  const caloriesConsumedPercentage = (actualCaloriesConsumed / data.dailyGoal) * 100
  const caloriesGradientColor = getGradientColor(caloriesConsumedPercentage)

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Today&apos;s Nutrition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calories Overview */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-green-600">
              {actualCaloriesRemaining}
            </div>
            <div className="text-sm text-muted-foreground">
              Calories remaining of {data.dailyGoal} goal
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${caloriesConsumedPercentage}%`,
                  backgroundColor: caloriesGradientColor
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {actualCaloriesConsumed} consumed • {actualCaloriesRemaining} remaining
            </div>
          </div>

          {/* Macronutrients */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Macronutrients</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <div className="text-center">
                  <span className="text-xs font-medium">Protein</span>
                  <div className="text-xs text-muted-foreground">
                    {data.protein.current}/{data.protein.goal}g
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((data.protein.current / data.protein.goal) * 100, 100)}%`,
                      backgroundColor: getGradientColor(Math.min((data.protein.current / data.protein.goal) * 100, 100))
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-center">
                  <span className="text-xs font-medium">Carbs</span>
                  <div className="text-xs text-muted-foreground">
                    {data.carbs.current}/{data.carbs.goal}g
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((data.carbs.current / data.carbs.goal) * 100, 100)}%`,
                      backgroundColor: getGradientColor(Math.min((data.carbs.current / data.carbs.goal) * 100, 100))
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-center">
                  <span className="text-xs font-medium">Fat</span>
                  <div className="text-xs text-muted-foreground">
                    {data.fat.current}/{data.fat.goal}g
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((data.fat.current / data.fat.goal) * 100, 100)}%`,
                      backgroundColor: getGradientColor(Math.min((data.fat.current / data.fat.goal) * 100, 100))
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-center">
                  <span className="text-xs font-medium">Sugar</span>
                  <div className="text-xs text-muted-foreground">
                    {data.sugar.current}/{data.sugar.goal}g
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((data.sugar.current / data.sugar.goal) * 100, 100)}%`,
                      backgroundColor: getGradientColor(Math.min((data.sugar.current / data.sugar.goal) * 100, 100))
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recorded Meals */}
          {recordedMeals.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Today&apos;s Meals</h4>
                <Badge variant="outline">{recordedMeals.length} recorded</Badge>
              </div>
              <div className="space-y-2">
                {recordedMeals.map((meal) => (
                  <Card key={meal.id} className="bg-gradient-to-r from-gray-50 to-green-50 border-gray-200 hover:shadow-sm transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Meal Image */}
                        {meal.image && (
                          <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={meal.image}
                              alt={meal.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Meal Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900 text-sm truncate">
                              {meal.name}
                            </h5>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditMeal(meal.id)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Macro Pills */}
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex-1"></div>
                            {meal.nutritionData ? (
                              <div className="flex items-center gap-1 text-xs">
                                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                  {meal.nutritionData.calories}cal
                                </span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                  {meal.nutritionData.protein}p
                                </span>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                  {meal.nutritionData.carbs}c
                                </span>
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                  {meal.nutritionData.fat}f
                                </span>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500">No nutrition data</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Meal */}
          {data.suggestedMeal && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Suggested Next Meal</h4>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  AI Recommended
                </Badge>
              </div>
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-sm transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-blue-900 text-sm">
                        {data.suggestedMeal.name}
                      </h5>
                      <p className="text-xs text-blue-700 mt-1">
                        Perfect balance for your remaining macros
                      </p>
                      
                      {/* Macro Pills for Suggested Meal */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex-1"></div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                            {data.suggestedMeal.calories}cal
                          </span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {data.suggestedMeal.protein}p
                          </span>
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            {data.suggestedMeal.carbs}c
                          </span>
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                            {data.suggestedMeal.fat}f
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}