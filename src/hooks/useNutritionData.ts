'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  getTodaysMeals,
  getTodaysNutritionSummary,
  deleteMeal,
} from '@/lib/mealStorage'
import {
  transformMealsToMobileFormat,
  createMobileNutritionData,
  type MobileNutritionData,
} from '@/utils/mealTransformation'
import { useUserNutritionGoals } from '@/utils/userNutrition'

export function useNutritionData() {
  const { loadUserGoals } = useUserNutritionGoals()
  const [mobileNutritionData, setMobileNutritionData] =
    useState<MobileNutritionData>({
      caloriesConsumed: 0,
      caloriesGoal: 2000,
      caloriesRemaining: 2000,
      macros: {
        protein: { current: 0, goal: 120, unit: 'g' },
        carbs: { current: 0, goal: 250, unit: 'g' },
        fat: { current: 0, goal: 70, unit: 'g' },
      },
      meals: [],
    })
  const [isLoading, setIsLoading] = useState(false)

  const loadNutritionData = useCallback(async () => {
    if (isLoading) return // Prevent multiple simultaneous calls
    
    setIsLoading(true)
    try {
      const meals = getTodaysMeals()
      const summary = getTodaysNutritionSummary(meals)
      const mobileFormatMeals = transformMealsToMobileFormat(meals)
      
      // Load user's personalized goals
      const userGoals = await loadUserGoals()
      
      const nutritionData = createMobileNutritionData(summary, mobileFormatMeals, userGoals)

      setMobileNutritionData(nutritionData)
    } catch (error) {
      console.error('Error loading nutrition data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [loadUserGoals, isLoading])

  const handleDeleteMeal = useCallback((mealId: string) => {
    const success = deleteMeal(mealId)
    if (success) {
      loadNutritionData()
    }
    return success
  }, [loadNutritionData])

  useEffect(() => {
    loadNutritionData()
  }, []) // Remove loadNutritionData from dependencies to prevent infinite loops

  return {
    mobileNutritionData,
    loadNutritionData,
    handleDeleteMeal,
  }
}