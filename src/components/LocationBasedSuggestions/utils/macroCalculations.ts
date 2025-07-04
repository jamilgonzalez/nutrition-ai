import { MacroTargets } from '../types'

export function getMacroTargetsFromDailyGoals(
  caloriesRemaining: number,
  proteinRatio: number,
  carbRatio: number,
  fatRatio: number
): MacroTargets {
  const proteinGrams = Math.round((caloriesRemaining * proteinRatio) / 4)
  const carbGrams = Math.round((caloriesRemaining * carbRatio) / 4)
  const fatGrams = Math.round((caloriesRemaining * fatRatio) / 9)

  return {
    calories: { min: caloriesRemaining, max: caloriesRemaining },
    protein: { min: proteinGrams, max: proteinGrams },
    carbs: { min: carbGrams, max: carbGrams },
    fat: { min: fatGrams, max: fatGrams },
  }
}

export function createCacheKey(
  city: string,
  caloriesRemaining: number
): string {
  return `${city}-${Math.round(caloriesRemaining / 100) * 100}`
}
