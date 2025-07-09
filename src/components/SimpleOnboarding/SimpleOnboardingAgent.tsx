'use client'

import { useState } from 'react'
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
import { useEnhancedSpeechSynthesis } from '@/hooks/useEnhancedSpeechSynthesis'
import { useUser } from '@clerk/nextjs'

interface SimpleOnboardingAgentProps {
  onComplete: (
    plan: GeneratedPlan | AdjustedPlan,
    onboardingData: SimpleOnboardingData
  ) => void
  className?: string
}

export default function SimpleOnboardingAgent({
  onComplete,
  className = '',
}: SimpleOnboardingAgentProps) {
  const [currentStep, setCurrentStep] =
    useState<OnboardingFlowState>('greeting')
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)
  const [onboardingData, setOnboardingData] =
    useState<SimpleOnboardingData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useUser()

  const { speak, isSpeaking, analyser } = useEnhancedSpeechSynthesis()

  const handleBeginGreeting = async () => {
    const greetingText = `Hey ${
      user?.firstName || ''
    }! I'm excited to help you create a personalized nutrition plan that fits your lifestyle and goals. Let's get started!`

    try {
      await speak(greetingText)
      setCurrentStep('form')
    } catch (error) {
      console.error('Speech synthesis failed:', error)
      setCurrentStep('form')
    }
  }

  const handleFormSubmit = async (data: SimpleOnboardingData) => {
    setCurrentStep('generating')
    setError(null)

    // Store the onboarding data
    setOnboardingData(data)

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

  const handleAcceptPlan = async () => {
    if (generatedPlan && onboardingData) {
      setCurrentStep('complete')
      
      // Wait for the completion animation to be visible
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Complete the onboarding after showing the completion screen
      setTimeout(() => {
        onComplete(generatedPlan, onboardingData)
      }, 2000)
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

      // Update the generated plan with the adjusted plan and show review
      setGeneratedPlan(adjustedPlan)
      setCurrentStep('plan_review')
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
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-lg mx-auto text-center">
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Creating Your Plan
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  We're analyzing your preferences and generating a personalized nutrition plan tailored just for you.
                </p>
              </div>
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.6s'
                    }}
                  />
                ))}
              </div>
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
          <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-lg mx-auto text-center">
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Finalizing Your Plan
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  We're making final adjustments to ensure your nutrition plan is perfect for your goals.
                </p>
              </div>
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-green-600 rounded-full animate-bounce"
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.6s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
            <div className="max-w-lg mx-auto text-center">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">
                  Welcome to Your Journey! 🎉
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed animate-fade-in">
                  Your personalized nutrition plan is ready. Let's start tracking your progress and achieving your goals!
                </p>
              </div>
              <div className="flex justify-center">
                <div className="animate-bounce">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
              </div>
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
