import { RecordedMeal } from '@/lib/mealStorage'
import { DEFAULT_DAILY_GOALS } from '@/components/NutritionTracker/constants'
import { UserNutritionGoals } from '@/utils/userNutrition'

// Type definitions for mobile meal data
export interface MobileMealItem {
  id: string
  name: string
  time: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fullMeal: RecordedMeal
}

export interface MobileMealGroup {
  id: number
  type: string
  emoji: string
  count: number
  items: MobileMealItem[]
}

export interface MobileNutritionData {
  caloriesConsumed: number
  caloriesGoal: number
  caloriesRemaining: number
  macros: {
    protein: { current: number; goal: number; unit: string }
    carbs: { current: number; goal: number; unit: string }
    fat: { current: number; goal: number; unit: string }
  }
  meals: MobileMealGroup[]
}

export const getMealType = (timestamp: string | Date): string => {
  const hour = new Date(timestamp).getHours()
  if (hour < 11) return 'Breakfast'
  if (hour < 15) return 'Lunch'
  if (hour < 19) return 'Dinner'
  return 'Snack'
}

export const getMealEmoji = (mealType: string): string => {
  switch (mealType) {
    case 'Breakfast':
      return '🍳'
    case 'Lunch':
      return '🍔'
    case 'Dinner':
      return '🍽️'
    case 'Snack':
      return '🥨'
    default:
      return '🍽️'
  }
}

export const transformMealsToMobileFormat = (
  meals: RecordedMeal[]
): MobileMealGroup[] => {
  return meals.reduce((acc: MobileMealGroup[], meal) => {
    // Use meal's actual type if available, otherwise derive from timestamp
    const mealType = meal.fullNutritionData?.mealType
      ? meal.fullNutritionData.mealType.charAt(0).toUpperCase() +
        meal.fullNutritionData.mealType.slice(1)
      : getMealType(meal.timestamp)

    const existingMeal = acc.find((m) => m.type === mealType)

    const mealItem: MobileMealItem = {
      id: meal.id,
      name: meal.name,
      time: new Date(meal.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      calories: meal.nutritionData?.calories || 0,
      protein: meal.nutritionData?.protein || 0,
      carbs: meal.nutritionData?.carbs || 0,
      fat: meal.nutritionData?.fat || 0,
      fullMeal: meal,
    }

    if (existingMeal) {
      existingMeal.items.push(mealItem)
      existingMeal.count = existingMeal.items.length
    } else {
      acc.push({
        id: acc.length + 1,
        type: mealType,
        emoji: getMealEmoji(mealType),
        count: 1,
        items: [mealItem],
      })
    }

    return acc
  }, [])
}

export const createMobileNutritionData = (
  summary: { calories: number; protein: number; carbs: number; fat: number },
  meals: MobileMealGroup[],
  userGoals?: UserNutritionGoals
): MobileNutritionData => {
  // Use user's personalized goals if available, otherwise fall back to defaults
  const caloriesGoal = userGoals?.calories ?? DEFAULT_DAILY_GOALS.calories
  const proteinGoal = userGoals?.protein ?? DEFAULT_DAILY_GOALS.protein
  const carbsGoal = userGoals?.carbs ?? DEFAULT_DAILY_GOALS.carbs
  const fatGoal = userGoals?.fat ?? DEFAULT_DAILY_GOALS.fat

  return {
    caloriesConsumed: summary.calories,
    caloriesGoal,
    caloriesRemaining: Math.max(0, caloriesGoal - summary.calories),
    macros: {
      protein: { current: summary.protein, goal: proteinGoal, unit: 'g' },
      carbs: { current: summary.carbs, goal: carbsGoal, unit: 'g' },
      fat: { current: summary.fat, goal: fatGoal, unit: 'g' },
    },
    meals,
  }
}
