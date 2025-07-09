'use client'

import { useOnboarding } from '@/hooks/useOnboarding'
import SimpleOnboardingAgent from './SimpleOnboarding/SimpleOnboardingAgent'
import LoadingSpinner from './loadingSpinner'
import { ErrorBoundary } from './ErrorBoundary'
import { GeneratedPlan, AdjustedPlan } from '@/types/onboarding'
import DatabaseStub from '@/lib/database'
import { clearNutritionGoalsCache } from '@/utils/userNutrition'

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

  // Show loading spinner if Clerk is loading user or if we're checking onboarding status
  if (!isLoaded || isCheckingOnboarding) {
    return <LoadingSpinner />
  }

  // Show onboarding agent if user is loaded and onboarding is not complete
  if (user && !hasCompletedOnboarding) {
    const handleSimpleOnboardingComplete = async (plan: GeneratedPlan | AdjustedPlan) => {
      try {
        // Save the nutrition targets from the plan
        await DatabaseStub.saveNutritionTargets(user.id, {
          dailyCalories: plan.calories,
          targetProtein: plan.macros.protein,
          targetCarbs: plan.macros.carbs,
          targetFat: plan.macros.fat,
        })

        // Create a basic user profile to mark onboarding as complete
        const userProfile = {
          name: user.firstName || user.lastName || 'User',
          age: null,
          sex: null,
          height: null,
          weight: null,
          activityLevel: null,
          goals: [],
          healthConditions: [],
          dietaryRestrictions: [],
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

  // Show main app content if user has completed onboarding
  if (user && hasCompletedOnboarding) {
    return <ErrorBoundary>{children}</ErrorBoundary>
  }

  // Return nothing if user is not signed in (handled by SignedIn/SignedOut in layout)
  return null
}