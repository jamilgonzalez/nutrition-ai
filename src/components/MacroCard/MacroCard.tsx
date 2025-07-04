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
import LocationBasedSuggestions from '../LocationBasedSuggestions'
import CaloriesOverview from './molecules/CaloriesOverview'
import MacronutrientGrid from './molecules/MacronutrientGrid'
import RecordedMealsSection from './organisms/RecordedMealsSection'
import DeleteConfirmDialog from './organisms/DeleteConfirmDialog'
import { createDailyNutritionData } from './utils/nutritionCalculations'

export default function MacroCard() {
  const router = useRouter()
  const [recordedMeals, setRecordedMeals] = useState<RecordedMeal[]>([])
  const [nutritionSummary, setNutritionSummary] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const meals = getTodaysMeals()
    const summary = getTodaysNutritionSummary()
    console.log('Loaded meals:', meals)
    console.log('Nutrition summary:', summary)
    setRecordedMeals(meals)
    setNutritionSummary(summary)
  }, [])

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
        const meals = getTodaysMeals()
        const summary = getTodaysNutritionSummary()
        setRecordedMeals(meals)
        setNutritionSummary(summary)
      } else {
        alert('Failed to delete meal. Please try again.')
      }
      setDeleteConfirmId(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  console.log(nutritionSummary)

  // Create daily nutrition data using real meal data
  const dailyData = createDailyNutritionData(nutritionSummary)

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
          <LocationBasedSuggestions dailyNutritionData={dailyData} />

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
