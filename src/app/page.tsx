'use client'

import { NutritionTracker } from '@/components/NutritionTracker'
import MealChatInput from '@/components/MealChatInput'
import { useNutritionData } from '@/hooks/useNutritionData'

export default function Home() {
  const {
    mobileNutritionData,
    loadNutritionData,
    handleDeleteMeal,
    isLoading,
    error,
  } = useNutritionData()

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
