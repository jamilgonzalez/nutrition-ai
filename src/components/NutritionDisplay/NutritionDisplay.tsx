'use client'

import NutritionHeader from './organisms/NutritionHeader'
import MacronutrientCard from './organisms/MacronutrientCard'
import MicronutrientCard from './organisms/MicronutrientCard'
import IngredientsCard from './organisms/IngredientsCard'
import RecommendationsCard from './organisms/RecommendationsCard'
import { NutritionDisplayProps } from './types'

export default function NutritionDisplay({
  data,
  onSaveEntry,
}: NutritionDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <NutritionHeader data={data} />
      <MacronutrientCard macros={data.macros} />
      <MicronutrientCard micronutrients={data.micronutrients} />
      <IngredientsCard ingredients={data.ingredients} />
      <RecommendationsCard recommendations={data.recommendations} />

      {onSaveEntry && (
        <div className="text-center pt-4">
          <button
            onClick={onSaveEntry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save to My Nutrition Log
          </button>
        </div>
      )}
    </div>
  )
}