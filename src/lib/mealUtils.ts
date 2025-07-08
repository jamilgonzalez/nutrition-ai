import { MEAL_TYPES, MEAL_TIMING, MEAL_EMOJIS, TIME_FORMAT_OPTIONS } from './constants'
import { type RecordedMeal } from './mealStorage'

/**
 * Meal transformation and utility functions
 */

export interface MealItemData {
  id: string
  name: string
  time: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fullMeal?: RecordedMeal
}

export interface GroupedMeal {
  id: number
  type: string
  emoji: string
  count: number
  items: MealItemData[]
}

/**
 * Determines meal type based on timestamp
 */
export function getMealType(timestamp: string | Date): string {
  const hour = new Date(timestamp).getHours()
  
  if (hour < MEAL_TIMING.BREAKFAST_CUTOFF) return MEAL_TYPES.BREAKFAST
  if (hour < MEAL_TIMING.LUNCH_CUTOFF) return MEAL_TYPES.LUNCH
  if (hour < MEAL_TIMING.DINNER_CUTOFF) return MEAL_TYPES.DINNER
  return MEAL_TYPES.SNACK
}

/**
 * Gets emoji for meal type
 */
export function getMealEmoji(mealType: string): string {
  return MEAL_EMOJIS[mealType as keyof typeof MEAL_EMOJIS] || MEAL_EMOJIS[MEAL_TYPES.DINNER]
}

/**
 * Transforms a single meal to mobile format
 */
export function transformMealToMobileFormat(meal: RecordedMeal): MealItemData {
  return {
    id: meal.id,
    name: meal.name,
    time: new Date(meal.timestamp).toLocaleTimeString('en-US', TIME_FORMAT_OPTIONS),
    calories: meal.nutritionData?.calories || 0,
    protein: meal.nutritionData?.protein || 0,
    carbs: meal.nutritionData?.carbs || 0,
    fat: meal.nutritionData?.fat || 0,
    fullMeal: meal,
  }
}

/**
 * Groups meals by type for mobile display
 */
export function groupMealsForMobile(meals: RecordedMeal[]): GroupedMeal[] {
  return meals.reduce((acc: GroupedMeal[], meal) => {
    // Use meal's actual type if available, otherwise derive from timestamp
    const mealType = meal.fullNutritionData?.mealType
      ? meal.fullNutritionData.mealType.charAt(0).toUpperCase() +
        meal.fullNutritionData.mealType.slice(1)
      : getMealType(meal.timestamp)

    const existingMeal = acc.find((m) => m.type === mealType)
    const mealItem = transformMealToMobileFormat(meal)

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

/**
 * Validates if a URL is safe to open
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    // Only allow http and https protocols
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Safely opens an external URL
 */
export function safeOpenUrl(url: string): void {
  if (isValidUrl(url)) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

/**
 * Cleans up object URLs to prevent memory leaks
 */
export function cleanupObjectUrl(url: string): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

/**
 * Creates an object URL with automatic cleanup
 */
export function createManagedObjectUrl(file: File): { url: string; cleanup: () => void } {
  const url = URL.createObjectURL(file)
  return {
    url,
    cleanup: () => cleanupObjectUrl(url),
  }
}