'use client'

import posthog from 'posthog-js'

// Initialize PostHog (already done in instrumentation-client.ts, but keeping for reference)
export const initPostHog = () => {
  if (typeof window !== 'undefined' && !posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: '/ingest',
      ui_host: 'https://us.posthog.com',
      defaults: '2025-05-24',
      capture_exceptions: true,
      debug: process.env.NODE_ENV === 'development',
    })
  }
}

// User identification
export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.identify(userId, userProperties)
  }
}

// Event tracking
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog.__loaded) {
    posthog.capture(eventName, properties)
  }
}

// Specific event tracking functions for common actions
export const analytics = {
  // Authentication events
  userSignedIn: (userId: string, userProperties?: Record<string, any>) => {
    identifyUser(userId, userProperties)
    trackEvent('user_signed_in', { userId, ...userProperties })
  },

  userSignedUp: (userId: string, userProperties?: Record<string, any>) => {
    identifyUser(userId, userProperties)
    trackEvent('user_signed_up', { userId, ...userProperties })
  },

  // Onboarding events
  onboardingStarted: (userId: string) => {
    trackEvent('onboarding_started', { userId })
  },

  onboardingStepCompleted: (userId: string, step: string, stepData?: Record<string, any>) => {
    trackEvent('onboarding_step_completed', { 
      userId, 
      step, 
      ...stepData 
    })
  },

  onboardingCompleted: (userId: string, userProfile: Record<string, any>) => {
    trackEvent('onboarding_completed', { 
      userId, 
      age: userProfile.age,
      gender: userProfile.sex,
      activityLevel: userProfile.activityLevel,
      goals: userProfile.goals,
      dailyCalories: userProfile.dailyCalories,
      hasDietaryRestrictions: userProfile.dietaryRestrictions?.length > 0,
    })
  },

  // Nutrition tracking events
  mealAdded: (userId: string, mealData: Record<string, any>) => {
    trackEvent('meal_added', { 
      userId,
      calories: mealData.calories,
      protein: mealData.protein,
      carbs: mealData.carbs,
      fat: mealData.fat,
      hasImage: !!mealData.image,
      source: mealData.source || 'manual', // 'chat', 'manual', 'photo'
    })
  },

  mealAnalyzed: (userId: string, analysisData: Record<string, any>) => {
    trackEvent('meal_analyzed', {
      userId,
      hasImage: !!analysisData.image,
      hasText: !!analysisData.text,
      analysisTime: analysisData.analysisTime,
      calories: analysisData.calories,
    })
  },

  nutritionGoalsViewed: (userId: string) => {
    trackEvent('nutrition_goals_viewed', { userId })
  },

  dashboardViewed: (userId: string) => {
    trackEvent('dashboard_viewed', { userId })
  },

  // Engagement events
  chatUsed: (userId: string, messageLength: number, hasImage: boolean) => {
    trackEvent('chat_used', { 
      userId, 
      messageLength, 
      hasImage,
      interactionType: hasImage ? 'image_chat' : 'text_chat'
    })
  },

  voiceInputUsed: (userId: string, transcriptLength: number) => {
    trackEvent('voice_input_used', { 
      userId, 
      transcriptLength 
    })
  },

  // Error tracking
  errorOccurred: (userId: string, error: string, context?: string) => {
    trackEvent('error_occurred', { 
      userId, 
      error, 
      context,
      timestamp: new Date().toISOString()
    })
  },
}

export default analytics