'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import MobileHeader from '../molecules/MobileHeader'
import MobileNutritionOverview from '../molecules/MobileNutritionOverview'
import MobileMacroGrid from '../molecules/MobileMacroGrid'
import MobileMealItem from '../molecules/MobileMealItem'

interface MealItem {
  id: string
  name: string
  time: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fullMeal?: any
}

interface MealGroup {
  id: number
  type: string
  emoji: string
  count: number
  items: MealItem[]
}

interface MobileNutritionTrackerProps {
  caloriesConsumed: number
  caloriesGoal: number
  caloriesRemaining: number
  macros: {
    protein: { current: number; goal: number; unit: string }
    carbs: { current: number; goal: number; unit: string }
    fat: { current: number; goal: number; unit: string }
  }
  meals: MealGroup[]
  onDeleteMeal?: (mealId: string) => void
}

export default function MobileNutritionTracker({
  caloriesConsumed,
  caloriesGoal,
  caloriesRemaining,
  macros,
  meals,
  onDeleteMeal,
}: MobileNutritionTrackerProps) {
  const totalMealItems = meals.reduce(
    (sum, mealGroup) => sum + mealGroup.count,
    0
  )

  const handleMenuClick = () => {
    // TODO: Implement menu functionality
    console.log('Menu clicked')
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-50 to-white">
      <div className="px-4 py-4 space-y-4">
        <MobileNutritionOverview
          caloriesConsumed={caloriesConsumed}
          caloriesGoal={caloriesGoal}
          caloriesRemaining={caloriesRemaining}
        />

        <MobileMacroGrid macros={macros} />

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-slate-800">
              Today's Meals
            </h2>
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-600 text-xs"
            >
              {totalMealItems} items
            </Badge>
          </div>

          {meals.map((mealGroup) => (
            <div key={mealGroup.id} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="text-lg">{mealGroup.emoji}</span>
                <span className="font-medium text-slate-700 text-sm">
                  {mealGroup.type} ({mealGroup.count})
                </span>
              </div>

              {mealGroup.items.map((item, index) => (
                <MobileMealItem
                  key={index}
                  item={item}
                  onDelete={onDeleteMeal ? () => onDeleteMeal(item.id) : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
