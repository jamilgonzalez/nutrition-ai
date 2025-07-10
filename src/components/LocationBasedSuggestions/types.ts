import { MenuItem, MacroTargets } from '@/types/restaurant'
import { DailyNutritionData } from '../NutritionTracker'

export interface LocationBasedSuggestionsProps {
  dailyNutritionData: DailyNutritionData
}

export interface SuggestedMeal {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type TabType = 'homecooked' | 'restaurant'

export type { MenuItem, MacroTargets, DailyNutritionData }
