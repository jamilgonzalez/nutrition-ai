import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import DatabaseStub from '@/lib/database'

export interface UserProfile {
  name: string
  age: number | null
  sex: 'male' | 'female' | 'other' | null
  height: number | null
  weight: number | null
  activityLevel:
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extremely_active'
    | null
  goals: string[]
  healthConditions: string[]
  dietaryRestrictions: string[]
}

export function useOnboarding() {
  const { user, isLoaded } = useUser()
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false)

  const checkOnboardingStatus = async () => {
    setIsCheckingOnboarding(true)

    try {
      if (!user?.id) return
      const profile = await DatabaseStub.getUserProfile(user.id)
      setHasCompletedOnboarding(!!profile)
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setHasCompletedOnboarding(false)
    } finally {
      setIsCheckingOnboarding(false)
    }
  }

  useEffect(() => {
    if (isLoaded && user) {
      checkOnboardingStatus()
    }
  }, [isLoaded, user])

  const handleOnboardingComplete = async (profile: UserProfile) => {
    try {
      if (!user?.id) return
      await DatabaseStub.saveUserProfile(user.id, profile)
      setHasCompletedOnboarding(true)
    } catch (error) {
      console.error('Error saving onboarding data:', error)
    }
  }

  return {
    user,
    isLoaded,
    hasCompletedOnboarding,
    isCheckingOnboarding,
    handleOnboardingComplete,
  }
}
