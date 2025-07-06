'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getTodaysMeals,
  getTodaysNutritionSummary,
  deleteMeal,
  type RecordedMeal,
} from '@/lib/mealStorage'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import LocationBasedSuggestions from '../LocationBasedSuggestions'
import CaloriesOverview from './molecules/CaloriesOverview'
import MacronutrientGrid from './molecules/MacronutrientGrid'
import RecordedMealsSection from './organisms/RecordedMealsSection'
import DeleteConfirmDialog from './organisms/DeleteConfirmDialog'
import { createDailyNutritionData } from './utils/nutritionCalculations'
import DatabaseStub from '@/lib/database'
import { NUTRITION_SUMMARY_DEFAULT } from './constants'

export default function MacroCard() {
  const router = useRouter()
  const { user } = useUser()
  const [recordedMeals, setRecordedMeals] = useState<RecordedMeal[]>([])
  const [nutritionSummary, setNutritionSummary] = useState(
    NUTRITION_SUMMARY_DEFAULT
  )
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [nutritionTargets, setNutritionTargets] = useState<{
    dailyCalories: number
    targetProtein: number
    targetCarbs: number
    targetFat: number
  } | null>(null)

  const refreshMealData = () => {
    const meals = getTodaysMeals()
    const summary = getTodaysNutritionSummary(meals)
    setRecordedMeals(meals)
    setNutritionSummary(summary)
  }

  useEffect(() => {
    refreshMealData()

    // Load user's nutrition targets
    const loadNutritionTargets = async () => {
      if (user?.id) {
        const targets = await DatabaseStub.getNutritionTargets(user.id)
        if (targets) {
          setNutritionTargets({
            dailyCalories: targets.dailyCalories,
            targetProtein: targets.targetProtein,
            targetCarbs: targets.targetCarbs,
            targetFat: targets.targetFat,
          })
        }
      }
    }

    loadNutritionTargets()

    // Listen for meal saved events from chat
    const handleMealSaved = () => {
      refreshMealData()
    }

    window.addEventListener('mealSaved', handleMealSaved)
    
    return () => {
      window.removeEventListener('mealSaved', handleMealSaved)
    }
  }, [user])

  const handleEditMeal = (mealId: string) => {
    router.push(`/edit-meal?id=${mealId}`)
  }

  const handleDeleteMeal = (mealId: string) => {
    setDeleteConfirmId(mealId)
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
      const success = deleteMeal(deleteConfirmId)
      if (success) {
        // Refresh the meals and nutrition summary
        refreshMealData()
      } else {
        alert('Failed to delete meal. Please try again.')
      }
      setDeleteConfirmId(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  // Create daily nutrition data using real meal data and user's custom targets
  const dailyData = createDailyNutritionData(
    nutritionSummary,
    nutritionTargets || undefined
  )

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Today&apos;s Nutrition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calories Overview */}
          <CaloriesOverview
            consumed={dailyData.totalCalories}
            remaining={dailyData.caloriesRemaining}
            dailyGoal={dailyData.dailyGoal}
          />

          {/* Macronutrients */}
          <MacronutrientGrid data={dailyData} />

          {/* Location-Based Meal Suggestions */}
          {/* <LocationBasedSuggestions dailyNutritionData={dailyData} /> */}

          {/* Recorded Meals */}
          <RecordedMealsSection
            meals={recordedMeals}
            onEditMeal={handleEditMeal}
            onDeleteMeal={handleDeleteMeal}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}
