import { DEFAULT_DAILY_GOALS } from '../constants'
import { DailyNutritionData } from '../types'

export function createDailyNutritionData(nutritionSummary: {
  calories: number
  protein: number
  carbs: number
  fat: number
}): DailyNutritionData {
  const actualCaloriesConsumed = nutritionSummary.calories
  const actualCaloriesRemaining = Math.max(
    DEFAULT_DAILY_GOALS.calories - actualCaloriesConsumed,
    0
  )

  return {
    totalCalories: actualCaloriesConsumed,
    caloriesRemaining: actualCaloriesRemaining,
    dailyGoal: DEFAULT_DAILY_GOALS.calories,
    protein: {
      current: nutritionSummary.protein,
      goal: DEFAULT_DAILY_GOALS.protein,
    },
    carbs: {
      current: nutritionSummary.carbs,
      goal: DEFAULT_DAILY_GOALS.carbs,
    },
    fat: {
      current: nutritionSummary.fat,
      goal: DEFAULT_DAILY_GOALS.fat,
    },
    sugar: {
      current: 0, // Sugar data not tracked in meals yet
      goal: DEFAULT_DAILY_GOALS.sugar,
    },
  }
}