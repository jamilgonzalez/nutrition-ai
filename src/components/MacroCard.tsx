'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

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
  const data = mockDailyData
  const caloriesConsumedPercentage = ((data.dailyGoal - data.caloriesRemaining) / data.dailyGoal) * 100

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
              {data.caloriesRemaining}
            </div>
            <div className="text-sm text-muted-foreground">
              Calories remaining of {data.dailyGoal} goal
            </div>
            <Progress value={caloriesConsumedPercentage} className="h-3" />
            <div className="text-xs text-muted-foreground">
              {data.totalCalories} consumed • {data.caloriesRemaining} remaining
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