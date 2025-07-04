import { NutritionData } from '../types'

export function calculateMacroPercentages(macros: NutritionData['macros']) {
  const totalMacroCalories =
    macros.protein * 4 + macros.carbohydrates * 4 + macros.fat * 9

  const proteinPercentage = Math.round(
    ((macros.protein * 4) / totalMacroCalories) * 100
  )
  const carbPercentage = Math.round(
    ((macros.carbohydrates * 4) / totalMacroCalories) * 100
  )
  const fatPercentage = Math.round(((macros.fat * 9) / totalMacroCalories) * 100)

  return {
    protein: proteinPercentage,
    carbohydrates: carbPercentage,
    fat: fatPercentage,
  }
}

export function calculateMacroCalories(
  amount: number,
  macroType: 'protein' | 'carbohydrates' | 'fat'
) {
  const multiplier = macroType === 'fat' ? 9 : 4
  return amount * multiplier
}