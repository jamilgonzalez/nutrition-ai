'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getTodaysMeals, getTodaysNutritionSummary, type RecordedMeal } from '@/lib/mealStorage'
import { useEffect, useState } from 'react'
import Image from 'next/image'

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

interface MacroItemProps {
  label: string
  current: number
  goal: number
  unit: string
}

function MacroItem({ label, current, goal, unit }: MacroItemProps) {
  const percentage = Math.min((current / goal) * 100, 100)
  const remaining = Math.max(goal - current, 0)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <div className="text-right">
          <span className="text-sm font-semibold">
            {current}{unit} / {goal}{unit}
          </span>
          <div className="text-xs text-muted-foreground">
            {remaining}{unit} remaining
          </div>
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
}

export default function MacroCard() {
  const [recordedMeals, setRecordedMeals] = useState<RecordedMeal[]>([])
  const [nutritionSummary, setNutritionSummary] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  
  useEffect(() => {
    const meals = getTodaysMeals()
    const summary = getTodaysNutritionSummary()
    setRecordedMeals(meals)
    setNutritionSummary(summary)
  }, [])
  
  const data = mockDailyData
  const actualCaloriesConsumed = data.totalCalories + nutritionSummary.calories
  const actualCaloriesRemaining = Math.max(data.dailyGoal - actualCaloriesConsumed, 0)
  const caloriesConsumedPercentage = (actualCaloriesConsumed / data.dailyGoal) * 100

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
            <Progress value={caloriesConsumedPercentage} className="h-3" />
            <div className="text-xs text-muted-foreground">
              {actualCaloriesConsumed} consumed • {actualCaloriesRemaining} remaining
            </div>
          </div>

          {/* Macronutrients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MacroItem
              label="Protein"
              current={data.protein.current}
              goal={data.protein.goal}
              unit="g"
            />
            <MacroItem
              label="Carbs"
              current={data.carbs.current}
              goal={data.carbs.goal}
              unit="g"
            />
            <MacroItem
              label="Fat"
              current={data.fat.current}
              goal={data.fat.goal}
              unit="g"
            />
            <MacroItem
              label="Sugar"
              current={data.sugar.current}
              goal={data.sugar.goal}
              unit="g"
            />
          </div>

          {/* Recorded Meals */}
          {recordedMeals.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Today&apos;s Meals</h4>
                <Badge variant="outline">{recordedMeals.length} recorded</Badge>
              </div>
              <div className="space-y-2">
                {recordedMeals.map((meal) => (
                  <Card key={meal.id} className="bg-gradient-to-r from-gray-50 to-green-50 border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {meal.image && (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={meal.image}
                              alt={meal.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">
                            {meal.name}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(meal.timestamp).toLocaleTimeString()}
                          </p>
                          {meal.nutritionData && (
                            <div className="text-xs text-gray-500 mt-1 space-x-2">
                              <span>{meal.nutritionData.calories} cal</span>
                              <span>{meal.nutritionData.protein}g protein</span>
                              <span>{meal.nutritionData.carbs}g carbs</span>
                              <span>{meal.nutritionData.fat}g fat</span>
                            </div>
                          )}
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
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Suggested Next Meal</h4>
                <Badge variant="outline">AI Recommended</Badge>
              </div>
              <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-blue-900">
                        {data.suggestedMeal.name}
                      </h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Perfect balance for your remaining macros
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-semibold text-blue-900">
                        {data.suggestedMeal.calories} cal
                      </div>
                      <div className="text-blue-700 space-x-2">
                        <span>{data.suggestedMeal.protein}g protein</span>
                        <span>{data.suggestedMeal.carbs}g carbs</span>
                        <span>{data.suggestedMeal.fat}g fat</span>
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