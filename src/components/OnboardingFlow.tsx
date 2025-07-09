'use client'

import { useOnboarding } from '@/hooks/useOnboarding'
import { OnboardingAgent } from './OnboardingAgent'
import LoadingSpinner from './loadingSpinner'

export default function OnboardingFlow() {
  const {
    user,
    isLoaded,
    hasCompletedOnboarding,
    isCheckingOnboarding,
    handleOnboardingComplete,
  } = useOnboarding()

  // show loading spinner if Clerk is loading user or if we're checking onboarding status
  if (!isLoaded || isCheckingOnboarding) {
    return <LoadingSpinner />
  }

  // show onboarding agent if user is loaded and onboarding is not complete
  if (user && !hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
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
