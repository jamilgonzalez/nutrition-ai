import { DEFAULT_DAILY_GOALS } from '../constants'
import { DailyNutritionData } from '../types'

export function createDailyNutritionData(
  nutritionSummary: {
    calories: number
    protein: number
    carbs: number
    fat: number
  },
  customTargets?: {
    dailyCalories: number
    targetProtein: number
    targetCarbs: number
    targetFat: number
  }
): DailyNutritionData {
  // Use custom targets if provided, otherwise fall back to defaults
  const targets = customTargets || {
    dailyCalories: DEFAULT_DAILY_GOALS.calories,
    targetProtein: DEFAULT_DAILY_GOALS.protein,
    targetCarbs: DEFAULT_DAILY_GOALS.carbs,
    targetFat: DEFAULT_DAILY_GOALS.fat,
  }

  const actualCaloriesConsumed = nutritionSummary.calories
  const actualCaloriesRemaining = Math.max(
    targets.dailyCalories - actualCaloriesConsumed,
    0
  )

  return {
    totalCalories: actualCaloriesConsumed,
    caloriesRemaining: actualCaloriesRemaining,
    dailyGoal: targets.dailyCalories,
    protein: {
      current: nutritionSummary.protein,
      goal: targets.targetProtein,
    },
    carbs: {
      current: nutritionSummary.carbs,
      goal: targets.targetCarbs,
    },
    fat: {
      current: nutritionSummary.fat,
      goal: targets.targetFat,
    },
    sugar: {
      current: 0, // Sugar data not tracked in meals yet
      goal: DEFAULT_DAILY_GOALS.sugar,
    },
  }
}