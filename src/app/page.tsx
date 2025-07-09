'use client'

import { MobileNutritionTracker } from '@/components/MacroCard'
import MealChatInput from '@/components/MealChatInput'
import { useNutritionData } from '@/hooks/useNutritionData'

export default function Home() {
  const { mobileNutritionData, loadNutritionData, handleDeleteMeal } = useNutritionData()

  return (
    <div className="flex flex-col min-h-screen">
      <MobileNutritionTracker
        caloriesConsumed={mobileNutritionData.caloriesConsumed}
        caloriesGoal={mobileNutritionData.caloriesGoal}
        caloriesRemaining={mobileNutritionData.caloriesRemaining}
        macros={mobileNutritionData.macros}
        meals={mobileNutritionData.meals}
        onDeleteMeal={handleDeleteMeal}
      />

      <MealChatInput
        onMealSaved={loadNutritionData}
      />
    </div>
  )
}
