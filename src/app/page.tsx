'use client'

import { SignedIn } from '@clerk/nextjs'
import { useChat } from '@ai-sdk/react'
import { useState, useEffect, useCallback } from 'react'
import { MobileNutritionTracker } from '@/components/MacroCard'
import MealChatInterface from '@/components/MealChatInterface'
import OnboardingGate from '@/components/OnboardingGate'
import { useImageUpload } from '@/hooks/useImageUpload'
import {
  saveMeal,
  getTodaysMeals,
  getTodaysNutritionSummary,
  deleteMeal,
} from '@/lib/mealStorage'
import {
  transformMealsToMobileFormat,
  createMobileNutritionData,
  type MobileNutritionData,
} from '@/utils/mealTransformation'
import {
  MOBILE_BREAKPOINT,
  SUCCESS_NOTIFICATION_DURATION,
} from '@/constants/ui'
import { ObjectURLManager } from '@/utils/memoryManagement'

export default function Home() {
  const [isSavingMeal, setIsSavingMeal] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileNutritionData, setMobileNutritionData] =
    useState<MobileNutritionData>({
      caloriesConsumed: 0,
      caloriesGoal: 2000, // Use constant from imported utilities
      caloriesRemaining: 2000,
      macros: {
        protein: { current: 0, goal: 120, unit: 'g' },
        carbs: { current: 0, goal: 250, unit: 'g' },
        fat: { current: 0, goal: 70, unit: 'g' },
      },
      meals: [],
    })

  // Extracted meal loading logic using utility functions
  const loadMealsData = useCallback(() => {
    const meals = getTodaysMeals()
    const summary = getTodaysNutritionSummary(meals)
    const mobileFormatMeals = transformMealsToMobileFormat(meals)
    const nutritionData = createMobileNutritionData(summary, mobileFormatMeals)

    setMobileNutritionData(nutritionData)
  }, [])

  // Check if device is mobile and load meal data
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    loadMealsData()

    // Listen for meal updates
    const handleMealSaved = () => {
      loadMealsData()
    }

    window.addEventListener('mealSaved', handleMealSaved)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('mealSaved', handleMealSaved)
    }
  }, [loadMealsData])

  const { append, isLoading } = useChat({
    api: '/api/upload',
  })

  const { convertToBase64 } = useImageUpload()

  const handleMealChat = async (message: string, image?: File) => {
    if (!message && !image) return

    try {
      const content =
        message ||
        'Analyze this meal image and provide detailed nutritional information.'

      // For mobile, don't show the chat interface - just process the message
      if (!isMobile) {
        // First, send the message to the chat for display
        if (image) {
          const base64Image = await convertToBase64(image)

          await append({
            role: 'user',
            content,
            experimental_attachments: [
              {
                name: image.name,
                contentType: image.type,
                url: base64Image,
              },
            ],
          })
        } else {
          await append({
            role: 'user',
            content,
          })
        }
      }

      // Then, generate structured nutritional analysis and save to database
      await generateAndSaveNutritionData(message, image)
    } catch (error) {
      // TODO: Show user-friendly error message
      console.error('Error processing meal chat:', error)
    }
  }

  const generateAndSaveNutritionData = async (
    message: string,
    image?: File
  ) => {
    setIsSavingMeal(true)
    let objectUrl: string | undefined

    try {
      const content =
        message ||
        'Analyze this meal image and provide detailed nutritional information.'

      const requestBody: {
        structured: boolean
        messages: Array<{
          role: string
          content: string
          experimental_attachments?: Array<{
            name: string
            contentType: string
            url: string
          }>
        }>
      } = {
        structured: true,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
      }

      if (image) {
        const base64Image = await convertToBase64(image)
        requestBody.messages[0].experimental_attachments = [
          {
            name: image.name,
            contentType: image.type,
            url: base64Image,
          },
        ]
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to get structured nutrition analysis')
      }

      const nutritionData = await response.json()

      // Create object URL with proper cleanup
      if (image) {
        objectUrl = ObjectURLManager.createObjectURL(image)
      }

      // Save meal to database
      const savedMeal = saveMeal({
        name: nutritionData.mealName || 'Meal from Chat',
        notes: message || 'Added via chat',
        image: objectUrl,
        nutritionData: {
          calories: nutritionData.totalCalories || 0,
          protein: nutritionData.macros?.protein || 0,
          carbs: nutritionData.macros?.carbohydrates || 0,
          fat: nutritionData.macros?.fat || 0,
        },
        fullNutritionData: nutritionData,
      })

      // Dispatch event to refresh the MacroCard
      window.dispatchEvent(new CustomEvent('mealSaved', { detail: savedMeal }))

      // Show success indicator
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), SUCCESS_NOTIFICATION_DURATION)
    } catch (error) {
      // TODO: Show user-friendly error message
      console.error('Error generating and saving nutrition data:', error)
    } finally {
      setIsSavingMeal(false)
    }
  }

  return (
    <SignedIn>
      <OnboardingGate>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1 pb-40">
            <MobileNutritionTracker
              caloriesConsumed={mobileNutritionData.caloriesConsumed}
              caloriesGoal={mobileNutritionData.caloriesGoal}
              caloriesRemaining={mobileNutritionData.caloriesRemaining}
              macros={mobileNutritionData.macros}
              meals={mobileNutritionData.meals}
              onDeleteMeal={(mealId: string) => {
                // Use existing delete functionality
                const success = deleteMeal(mealId)
                if (success) {
                  // Reload meals data using the extracted function
                  loadMealsData()
                }
              }}
            />
          </div>

          <MealChatInterface
            onSendMessage={handleMealChat}
            disabled={isLoading}
            isLoading={isLoading}
            isSavingMeal={isSavingMeal}
            showSaveSuccess={showSaveSuccess}
          />
        </div>
      </OnboardingGate>
    </SignedIn>
  )
}
