'use client'

import { useOnboarding } from '@/hooks/useOnboarding'
import SimpleOnboardingAgent from './SimpleOnboarding/SimpleOnboardingAgent'
import LoadingSpinner from './loadingSpinner'
import { ErrorBoundary } from './ErrorBoundary'
import { GeneratedPlan, AdjustedPlan, SimpleOnboardingData } from '@/types/onboarding'
import DatabaseStub from '@/lib/database'
import { clearNutritionGoalsCache } from '@/utils/userNutrition'
import { useState, useEffect } from 'react'

interface AppWrapperProps {
  children: React.ReactNode
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const {
    user,
    isLoaded,
    hasCompletedOnboarding,
    isCheckingOnboarding,
    handleOnboardingComplete,
  } = useOnboarding()
  
  const [showTransition, setShowTransition] = useState(false)
  const [transitionComplete, setTransitionComplete] = useState(false)
  
  // Handle the transition when onboarding completes
  useEffect(() => {
    if (hasCompletedOnboarding && !transitionComplete) {
      setShowTransition(true)
      setTimeout(() => {
        setTransitionComplete(true)
      }, 1000)
    }
  }, [hasCompletedOnboarding, transitionComplete])

  // Show loading spinner if Clerk is loading user or if we're checking onboarding status
  if (!isLoaded || isCheckingOnboarding) {
    return <LoadingSpinner />
  }

  // Show onboarding agent if user is loaded and onboarding is not complete
  if (user && !hasCompletedOnboarding) {
    const handleSimpleOnboardingComplete = async (
      plan: GeneratedPlan | AdjustedPlan, 
      onboardingData: SimpleOnboardingData
    ) => {
      try {
        // Save the nutrition targets from the plan
        await DatabaseStub.saveNutritionTargets(user.id, {
          dailyCalories: plan.calories,
          targetProtein: plan.macros.protein,
          targetCarbs: plan.macros.carbs,
          targetFat: plan.macros.fat,
        })

        // Create user profile with the actual onboarding data
        const userProfile = {
          name: user.firstName || user.lastName || 'User',
          age: onboardingData.age,
          sex: onboardingData.gender,
          height: onboardingData.height,
          weight: onboardingData.weight,
          activityLevel: onboardingData.activityLevel,
          goals: [onboardingData.goals], // Convert string to array
          healthConditions: [],
          dietaryRestrictions: onboardingData.dietaryRestrictions ? 
            onboardingData.dietaryRestrictions.split(',').map(r => r.trim()).filter(r => r) : [],
          // Store nutrition targets in the profile as well for backup
          dailyCalories: plan.calories,
          targetProtein: plan.macros.protein,
          targetCarbs: plan.macros.carbs,
          targetFat: plan.macros.fat,
        }
        
        // Clear the nutrition goals cache so fresh data is loaded
        clearNutritionGoalsCache(user.id)
        
        // Save the profile and mark onboarding as complete
        await handleOnboardingComplete(userProfile)
      } catch (error) {
        console.error('Error saving onboarding data:', error)
      }
    }

    return (
      <SimpleOnboardingAgent
        onComplete={handleSimpleOnboardingComplete}
      />
    )
  }

  // Show transition animation when onboarding completes
  if (user && hasCompletedOnboarding && showTransition && !transitionComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
        <div className="relative z-10 text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
            Let's Get Started! 🚀
          </h1>
          <p className="text-xl text-white/90 animate-fade-in">
            Launching your nutrition tracking experience...
          </p>
        </div>
      </div>
    )
  }

  // Show main app content if user has completed onboarding and transition is done
  if (user && hasCompletedOnboarding && transitionComplete) {
    return <ErrorBoundary>{children}</ErrorBoundary>
  }

  // Return nothing if user is not signed in (handled by SignedIn/SignedOut in layout)
  return null
}