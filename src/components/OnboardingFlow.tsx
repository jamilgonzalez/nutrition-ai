'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { OnboardingAgent } from './OnboardingAgent'
import DatabaseStub from '@/lib/database'
import LoadingSpinner from './loadingSpinner'

interface UserProfile {
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

export default function OnboardingFlow() {
  const { user, isLoaded } = useUser()
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false)

  const checkOnboardingStatus = async () => {
    setIsCheckingOnboarding(true)

    try {
      if (!user?.id) return
      // Check if user has completed onboarding using database stub
      const profile = await DatabaseStub.getUserProfile(user.id)
      setHasCompletedOnboarding(!!profile)
    } catch (error) {
      // TODO: handle UI in case of error
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

  // show loading spinner if Clerk is loading user or if we're checking onboarding status
  if (!isLoaded || isCheckingOnboarding) {
    return <LoadingSpinner />
  }

  // show onboarding agent if user is loaded and onboarding is not complete
  if (user && !hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <OnboardingAgent
          userProfile={{
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
          }}
          onComplete={handleOnboardingComplete}
          userId={user.id}
        />
      </div>
    )
  }

  return <></>
}
