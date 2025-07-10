import { RecordedMeal } from '@/lib/mealStorage'

export interface DailyNutritionData {
  totalCalories: number
  caloriesRemaining: number
  dailyGoal: number
  protein: {
    current: number
    goal: number
  }
  carbs: {
    current: number
    goal: number
  }
  fat: {
    current: number
    goal: number
  }
  sugar: {
    current: number
    goal: number
  }
  suggestedMeal?: {
    name: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export interface MacroCardProps {
  className?: string
}

export interface MacroProgressProps {
  current: number
  goal: number
  name: string
}

export interface MealItemProps {
  meal: RecordedMeal
  onEdit: (mealId: string) => void
  onDelete: (mealId: string) => void
}

export interface DeleteConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}
