/**
 * TypeScript type definitions for nutrition tracking
 */

export interface MacroData {
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  carbohydrates?: number // Alternative field name
}

export interface NutritionSummary {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface MobileNutritionData {
  caloriesConsumed: number
  caloriesGoal: number
  caloriesRemaining: number
  macros: {
    protein: { current: number; goal: number; unit: string }
    carbs: { current: number; goal: number; unit: string }
    fat: { current: number; goal: number; unit: string }
  }
  meals: GroupedMeal[]
}

export interface GroupedMeal {
  id: number
  type: string
  emoji: string
  count: number
  items: MealItemData[]
}

export interface MealItemData {
  id: string
  name: string
  time: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fullMeal?: RecordedMeal
}

export interface RecordedMeal {
  id: string
  name: string
  timestamp: string
  nutritionData?: NutritionSummary
  fullNutritionData?: FullNutritionData
}

export interface FullNutritionData {
  mealName?: string
  totalCalories?: number
  macros?: MacroData
  mealType?: string
  healthScore?: number
  portionSize?: string
  ingredients?: string[]
  recommendations?: (string | RecommendationObject)[]
  sources?: DataSource[]
}

export interface RecommendationObject {
  text: string
  type: 'positive' | 'warning'
}

export interface DataSource {
  title?: string
  url: string
  domain?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  experimental_attachments?: Array<{
    name: string
    contentType: string
    url: string
  }>
}

export interface ApiRequestBody {
  structured: boolean
  messages: ChatMessage[]
}