'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import OnboardingAgent from './OnboardingAgent'
import DatabaseStub from '@/lib/database'

interface UserProfile {
  name: string
  age: number | null
  sex: 'male' | 'female' | 'other' | null
  height: number | null
  weight: number | null
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
  goals: string[]
  healthConditions: string[]
  dietaryRestrictions: string[]
}

interface OnboardingFlowProps {
  children: React.ReactNode
}

export default function OnboardingFlow({ children }: OnboardingFlowProps) {
  const { user, isLoaded } = useUser()
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      checkOnboardingStatus()
    }
  }, [isLoaded, user])

  const checkOnboardingStatus = async () => {
    try {
      if (!user?.id) return
      
      // Check if user has completed onboarding using database stub
      const profile = await DatabaseStub.getUserProfile(user.id)
      setHasCompletedOnboarding(!!profile)
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setHasCompletedOnboarding(false)
    } finally {
      setIsCheckingOnboarding(false)
    }
  }

  const handleOnboardingComplete = async (profile: UserProfile) => {
    try {
      if (!user?.id) return
      
      // Save user profile using database stub
      await DatabaseStub.saveUserProfile(user.id, profile)
      
      console.log('Onboarding completed for user:', user.id)
      setHasCompletedOnboarding(true)
    } catch (error) {
      console.error('Error saving onboarding data:', error)
    }
  }

  if (!isLoaded || isCheckingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <>{children}</>
  }

  if (!hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <OnboardingAgent
          userProfile={{
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined
          }}
          onComplete={handleOnboardingComplete}
        />
      </div>
    )
  }

  return <>{children}</>
}