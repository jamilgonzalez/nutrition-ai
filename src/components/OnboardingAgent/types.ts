export interface UserProfile {
  name: string
  age: number | null
  sex: 'male' | 'female' | 'other' | null
  height: number | null
  weight: number | null
  activityLevel:
    | 'sedentary'
    | 'light'
    | 'moderate'
    | 'active'
    | 'very_active'
    | null
  goals: string[]
  healthConditions: string[]
  dietaryRestrictions: string[]
}

export interface OnboardingAgentProps {
  userProfile: { firstName?: string; lastName?: string }
  onComplete: (profile: UserProfile) => void
  userId?: string
}

export interface QuestionOption {
  value: string
  label: string
}

export interface Question {
  id: string
  type: 'welcome' | 'number' | 'select' | 'text'
  text: string | ((name: string) => string)
  voiceText: string | ((name: string) => string)
  field?: keyof UserProfile
  options?: QuestionOption[]
}