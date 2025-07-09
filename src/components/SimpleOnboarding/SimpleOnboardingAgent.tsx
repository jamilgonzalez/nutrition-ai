'use client'

import { useState, useEffect } from 'react'
import { VoiceGreetingSection } from './organisms/VoiceGreetingSection'
import { SimpleOnboardingForm } from './organisms/SimpleOnboardingForm'
import { GeneratedPlanReview } from './organisms/GeneratedPlanReview'
import { PlanAdjustmentForm } from './organisms/PlanAdjustmentForm'
import { OnboardingSteps } from './organisms/OnboardingSteps'
import {
  SimpleOnboardingData,
  GeneratedPlan,
  AdjustedPlan,
  PlanAdjustmentRequest,
  OnboardingFlowState,
} from '@/types/onboarding'
import LoadingSpinner from '@/components/loadingSpinner'

interface SimpleOnboardingAgentProps {
  onComplete: (plan: GeneratedPlan | AdjustedPlan) => void
  className?: string
}

export default function SimpleOnboardingAgent({
  onComplete,
  className = '',
}: SimpleOnboardingAgentProps) {
  const [currentStep, setCurrentStep] =
    useState<OnboardingFlowState>('greeting')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)
  const [error, setError] = useState<string | null>(null)

  // TODO: Replace with actual speech synthesis
  const handleBeginGreeting = () => {
    setIsSpeaking(true)

    // TODO: Add your greeting text here and convert to speech
    // Example: "Hello! I'm your nutrition AI assistant. I'm excited to help you create a personalized nutrition plan..."
    const greetingText =
      "Hello! I'm your nutrition AI assistant. I'm excited to help you create a personalized nutrition plan..."
    const utterance = new SpeechSynthesisUtterance(greetingText)
    window.speechSynthesis.speak(utterance)

    // Simulate speech duration
    setTimeout(() => {
      setIsSpeaking(false)
      setCurrentStep('form')
    }, 3000) // Adjust timing based on actual speech duration
  }

  const handleFormSubmit = async (data: SimpleOnboardingData) => {
    setCurrentStep('generating')
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
      setGeneratedPlan(plan)
      setCurrentStep('plan_review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setCurrentStep('form')
    }
  }

  const handleAcceptPlan = () => {
    if (generatedPlan) {
      onComplete(generatedPlan)
    }
  }

  const handleAdjustPlan = () => {
    setCurrentStep('adjusting')
  }

  const handleAdjustmentSubmit = async (adjustments: PlanAdjustmentRequest) => {
    if (!generatedPlan) return

    setCurrentStep('finalizing')
    setError(null)

    try {
      const response = await fetch('/api/onboarding/adjust-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalPlan: generatedPlan,
          adjustments,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to adjust plan')
      }

      const adjustedPlan: AdjustedPlan = await response.json()
      onComplete(adjustedPlan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setCurrentStep('adjusting')
    }
  }

  const handleCancelAdjustment = () => {
    setCurrentStep('plan_review')
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'greeting':
        return (
          <VoiceGreetingSection
            onBegin={handleBeginGreeting}
            isSpeaking={isSpeaking}
            analyser={analyser}
          />
        )

      case 'form':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <SimpleOnboardingForm onSubmit={handleFormSubmit} loading={false} />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        )

      case 'generating':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600">
                Generating your personalized nutrition plan...
              </p>
            </div>
          </div>
        )

      case 'plan_review':
        return generatedPlan ? (
          <div className="max-w-4xl mx-auto p-6">
            <GeneratedPlanReview
              plan={generatedPlan}
              onAccept={handleAcceptPlan}
              onAdjust={handleAdjustPlan}
            />
          </div>
        ) : null

      case 'adjusting':
        return generatedPlan ? (
          <div className="max-w-4xl mx-auto p-6">
            <PlanAdjustmentForm
              plan={generatedPlan}
              onSubmit={handleAdjustmentSubmit}
              onCancel={handleCancelAdjustment}
              loading={false}
            />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        ) : null

      case 'finalizing':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600">
                Finalizing your adjusted plan...
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {currentStep !== 'greeting' && (
        <OnboardingSteps currentStep={currentStep} />
      )}

      {renderCurrentStep()}
    </div>
  )
}
