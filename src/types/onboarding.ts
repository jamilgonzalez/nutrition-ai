export interface SimpleOnboardingData {
  age: number
  gender: 'male' | 'female' | 'other'
  height: number // inches
  weight: number // pounds
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  goals: string
  dietaryRestrictions: string
}

export interface GeneratedPlan {
  calories: number
  macros: {
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  explanation: string
  methodology: string
  sources: Array<{
    title: string
    url: string
    domain: string
    relevance: 'high' | 'medium' | 'low'
  }>
}

export interface PlanAdjustmentRequest {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  adjustmentReason: string
}

export interface AdjustedPlan extends GeneratedPlan {
  adjustments: PlanAdjustmentRequest
  adjustmentExplanation: string
}

export type OnboardingFlowState = 
  | 'greeting' 
  | 'form' 
  | 'generating' 
  | 'plan_review' 
  | 'adjusting' 
  | 'finalizing' 
  | 'complete'

export const ACTIVITY_LEVELS = {
  sedentary: 'Sedentary (little to no exercise)',
  lightly_active: 'Lightly Active (light exercise 1-3 days/week)',
  moderately_active: 'Moderately Active (moderate exercise 3-5 days/week)',
  very_active: 'Very Active (hard exercise 6-7 days/week)',
  extremely_active: 'Extremely Active (very hard exercise, physical job)'
} as const