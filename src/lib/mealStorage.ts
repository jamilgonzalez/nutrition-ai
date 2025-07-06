export interface RecordedMeal {
  id: string
  name: string
  timestamp: Date
  image?: string
  notes: string
  nutritionData?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

const MEALS_STORAGE_KEY = 'recorded_meals'

export function getTodaysMeals(): RecordedMeal[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(MEALS_STORAGE_KEY)
    if (!stored) return []

    const meals: RecordedMeal[] = JSON.parse(stored)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return meals.filter((meal) => {
      const mealDate = new Date(meal.timestamp)
      mealDate.setHours(0, 0, 0, 0)
      return mealDate.getTime() === today.getTime()
    })
  } catch (error) {
    console.error('Error loading meals:', error)
    return []
  }
}

export function saveMeal(
  meal: Omit<RecordedMeal, 'id' | 'timestamp'>
): RecordedMeal {
  const newMeal: RecordedMeal = {
    ...meal,
    id: Date.now().toString(),
    timestamp: new Date(),
  }

  try {
    const existing = JSON.parse(localStorage.getItem(MEALS_STORAGE_KEY) || '[]')
    const updated = [...existing, newMeal]

    // Keep only last 30 days of meals
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const filtered = updated.filter(
      (meal) => new Date(meal.timestamp) > thirtyDaysAgo
    )

    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(filtered))
    return newMeal
  } catch (error) {
    console.error('Error saving meal:', error)
    throw error
  }
}

export function updateMeal(
  id: string,
  updates: Partial<Omit<RecordedMeal, 'id' | 'timestamp'>>
): RecordedMeal | null {
  try {
    const existing = JSON.parse(localStorage.getItem(MEALS_STORAGE_KEY) || '[]')
    const mealIndex = existing.findIndex((meal: RecordedMeal) => meal.id === id)

    if (mealIndex === -1) {
      throw new Error('Meal not found')
    }

    const updatedMeal = {
      ...existing[mealIndex],
      ...updates,
    }

    existing[mealIndex] = updatedMeal
    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(existing))
    return updatedMeal
  } catch (error) {
    console.error('Error updating meal:', error)
    return null
  }
}

export function getMealById(id: string): RecordedMeal | null {
  try {
    const existing = JSON.parse(localStorage.getItem(MEALS_STORAGE_KEY) || '[]')
    return existing.find((meal: RecordedMeal) => meal.id === id) || null
  } catch (error) {
    console.error('Error getting meal:', error)
    return null
  }
}

export function deleteMeal(id: string): boolean {
  try {
    const existing = JSON.parse(localStorage.getItem(MEALS_STORAGE_KEY) || '[]')
    const filteredMeals = existing.filter(
      (meal: RecordedMeal) => meal.id !== id
    )

    if (filteredMeals.length === existing.length) {
      // No meal was found with that ID
      return false
    }

    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(filteredMeals))
    return true
  } catch (error) {
    console.error('Error deleting meal:', error)
    return false
  }
}

export function getTodaysNutritionSummary(meals: RecordedMeal[]) {
  return meals.reduce(
    (summary, meal) => {
      if (meal.nutritionData) {
        summary.calories += meal.nutritionData.calories
        summary.protein += meal.nutritionData.protein
        summary.carbs += meal.nutritionData.carbs
        summary.fat += meal.nutritionData.fat
      }
      return summary
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}
