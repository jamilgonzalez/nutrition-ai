import { useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import DatabaseStub from '@/lib/database'
import { DEFAULT_DAILY_GOALS } from '@/components/MacroCard/constants'

export interface UserNutritionGoals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

// Simple cache to prevent repeated database calls
const nutritionGoalsCache = new Map<string, { goals: UserNutritionGoals; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function clearNutritionGoalsCache(userId?: string) {
  if (userId) {
    nutritionGoalsCache.delete(userId)
  } else {
    nutritionGoalsCache.clear()
  }
}

export async function getUserNutritionGoals(userId: string): Promise<UserNutritionGoals> {
  try {
    // Check cache first
    const cached = nutritionGoalsCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.goals
    }

    // First try to get nutrition targets
    const nutritionTargets = await DatabaseStub.getNutritionTargets(userId)
    
    let goals: UserNutritionGoals

    if (nutritionTargets) {
      goals = {
        calories: nutritionTargets.dailyCalories,
        protein: nutritionTargets.targetProtein,
        carbs: nutritionTargets.targetCarbs,
        fat: nutritionTargets.targetFat,
      }
    } else {
      // If no nutrition targets, try to get from user profile
      const userProfile = await DatabaseStub.getUserProfile(userId)
      
      if (userProfile?.dailyCalories) {
        goals = {
          calories: userProfile.dailyCalories,
          protein: userProfile.targetProtein || DEFAULT_DAILY_GOALS.protein,
          carbs: userProfile.targetCarbs || DEFAULT_DAILY_GOALS.carbs,
          fat: userProfile.targetFat || DEFAULT_DAILY_GOALS.fat,
        }
      } else {
        // Fall back to defaults if no user data
        goals = {
          calories: DEFAULT_DAILY_GOALS.calories,
          protein: DEFAULT_DAILY_GOALS.protein,
          carbs: DEFAULT_DAILY_GOALS.carbs,
          fat: DEFAULT_DAILY_GOALS.fat,
        }
      }
    }

    // Cache the result
    nutritionGoalsCache.set(userId, { goals, timestamp: Date.now() })
    
    return goals
  } catch (error) {
    console.error('Error loading user nutrition goals:', error)
    // Return defaults on error
    return {
      calories: DEFAULT_DAILY_GOALS.calories,
      protein: DEFAULT_DAILY_GOALS.protein,
      carbs: DEFAULT_DAILY_GOALS.carbs,
      fat: DEFAULT_DAILY_GOALS.fat,
    }
  }
}

export function useUserNutritionGoals() {
  const { user } = useUser()
  
  const loadUserGoals = useCallback(async (): Promise<UserNutritionGoals> => {
    if (!user?.id) {
      return {
        calories: DEFAULT_DAILY_GOALS.calories,
        protein: DEFAULT_DAILY_GOALS.protein,
        carbs: DEFAULT_DAILY_GOALS.carbs,
        fat: DEFAULT_DAILY_GOALS.fat,
      }
    }
    
    return await getUserNutritionGoals(user.id)
  }, [user?.id])
  
  return { loadUserGoals }
}