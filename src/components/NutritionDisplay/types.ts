export interface NutritionData {
  mealName: string
  totalCalories: number
  macros: {
    protein: number
    carbohydrates: number
    fat: number
    fiber: number
    sugar: number
  }
  micronutrients: {
    sodium?: number
    potassium?: number
    vitaminC?: number
    calcium?: number
    iron?: number
  }
  ingredients: string[]
  healthScore: number
  recommendations: string[]
  portionSize: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
}

export interface NutritionDisplayProps {
  data: NutritionData
  onSaveEntry?: () => void
}