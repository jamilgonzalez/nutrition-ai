'use client'

import { NutritionTracker } from '@/components/NutritionTracker'
import { MealChatInput } from '@/components/MealChatInput'
import { useNutritionData } from '@/hooks/useNutritionData'
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { analytics } from '@/lib/analytics'

export default function Home() {
  const {
    mobileNutritionData,
    loadNutritionData,
    handleDeleteMeal,
    isLoading,
    error,
  } = useNutritionData()
  const { user } = useUser()

  // Track dashboard view
  useEffect(() => {
    if (user) {
      analytics.dashboardViewed(user.id)
    }
  }, [user])

  return (
    <div className="flex flex-col min-h-screen">
      <NutritionTracker
        data={mobileNutritionData}
        onDeleteMeal={handleDeleteMeal}
        isLoading={isLoading}
        error={error}
      />

      <MealChatInput onMealSaved={loadNutritionData} />
    </div>
  )
}
