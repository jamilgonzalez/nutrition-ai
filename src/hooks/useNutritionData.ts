'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
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

/**
 * TODO: Refactor transformation architecture
 * 
 * Current architecture requires multiple transformation layers:
 * RecordedMeal[] → NutritionSummary → MobileNutritionData
 * RecordedMeal[] → MobileMealGroup[] → MobileNutritionData
 * 
 * Refactoring options:
 * 1. Standardize on Mobile Format - Store meals pre-grouped by type, eliminate transformations
 * 2. Move Transformations to Components - Keep raw data in hook, transform at display time
 * 3. Nutrition Service Layer - Dedicated service for different data views with caching
 * 
 * Benefits: Reduce complexity, improve performance, better separation of concerns
 */

interface NutritionState {
  meals: ReturnType<typeof getTodaysMeals>
  summary: ReturnType<typeof getTodaysNutritionSummary>
  userGoals: Awaited<
    ReturnType<ReturnType<typeof useUserNutritionGoals>['loadUserGoals']>
  >
  lastUpdated: number
}

export function useNutritionData() {
  const { loadUserGoals } = useUserNutritionGoals()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nutritionState, setNutritionState] = useState<NutritionState | null>(
    null
  )

  // Derive mobile format meals from basic state
  const mobileFormatMeals = useMemo(() => {
    if (!nutritionState) return []
    return transformMealsToMobileFormat(nutritionState.meals)
  }, [nutritionState])

  // Derive complete nutrition data from basic state
  const mobileNutritionData = useMemo<MobileNutritionData>(() => {
    if (!nutritionState) {
      return {
        caloriesConsumed: 0,
        caloriesGoal: 2000,
        caloriesRemaining: 2000,
        macros: {
          protein: { current: 0, goal: 120, unit: 'g' },
          carbs: { current: 0, goal: 250, unit: 'g' },
          fat: { current: 0, goal: 70, unit: 'g' },
        },
        meals: [],
      }
    }

    return createMobileNutritionData(
      nutritionState.summary,
      mobileFormatMeals,
      nutritionState.userGoals
    )
  }, [nutritionState, mobileFormatMeals])

  const loadNutritionData = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const meals = getTodaysMeals()
      const summary = getTodaysNutritionSummary(meals)
      const userGoals = await loadUserGoals()

      setNutritionState({
        meals,
        summary,
        userGoals,
        lastUpdated: Date.now(),
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load nutrition data'
      setError(errorMessage)
      console.error('Error loading nutrition data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [loadUserGoals])

  const handleDeleteMeal = useCallback(
    (mealId: string) => {
      const success = deleteMeal(mealId)
      if (success) {
        loadNutritionData()
      }
      return success
    },
    [loadNutritionData]
  )

  useEffect(() => {
    loadNutritionData()
  }, [])

  return {
    mobileNutritionData,
    loadNutritionData,
    handleDeleteMeal,
    isLoading,
    error,
  }
}
