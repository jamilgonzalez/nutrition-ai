import { useState } from 'react'
import { 
  SimpleOnboardingData, 
  GeneratedPlan, 
  AdjustedPlan, 
  PlanAdjustmentRequest 
} from '@/types/onboarding'

interface UseSimpleOnboardingResult {
  generatePlan: (data: SimpleOnboardingData) => Promise<GeneratedPlan>
  adjustPlan: (plan: GeneratedPlan, adjustments: PlanAdjustmentRequest) => Promise<AdjustedPlan>
  isGenerating: boolean
  isAdjusting: boolean
  error: string | null
}

export function useSimpleOnboarding(): UseSimpleOnboardingResult {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePlan = async (data: SimpleOnboardingData): Promise<GeneratedPlan> => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/onboarding/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to generate plan')
      }

      const plan: GeneratedPlan = await response.json()
      return plan
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate plan'
      setError(errorMessage)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }

  const adjustPlan = async (
    plan: GeneratedPlan, 
    adjustments: PlanAdjustmentRequest
  ): Promise<AdjustedPlan> => {
    setIsAdjusting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/onboarding/adjust-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalPlan: plan,
          adjustments
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to adjust plan')
      }

      const adjustedPlan: AdjustedPlan = await response.json()
      return adjustedPlan
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to adjust plan'
      setError(errorMessage)
      throw err
    } finally {
      setIsAdjusting(false)
    }
  }

  return {
    generatePlan,
    adjustPlan,
    isGenerating,
    isAdjusting,
    error
  }
}