'use client'

import { SignedIn } from '@clerk/nextjs'
import { useState, useEffect, useCallback } from 'react'
import { MobileNutritionTracker } from '@/components/MacroCard'
import MealChatInput from '@/components/MealChatInput'
import { useImageUpload } from '@/hooks/useImageUpload'
import {
  saveMeal,
  getTodaysMeals,
  getTodaysNutritionSummary,
  deleteMeal,
} from '@/lib/mealStorage'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ObjectURLManager } from '@/utils/memoryManagement'
import {
  transformMealsToMobileFormat,
  createMobileNutritionData,
  type MobileNutritionData,
} from '@/utils/mealTransformation'
import { SUCCESS_NOTIFICATION_DURATION } from '@/constants/ui'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
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

  const { convertToBase64 } = useImageUpload()

  // Extracted meal loading logic using utility functions
  const loadMealsData = useCallback(() => {
    const meals = getTodaysMeals()
    const summary = getTodaysNutritionSummary(meals)
    const mobileFormatMeals = transformMealsToMobileFormat(meals)
    const nutritionData = createMobileNutritionData(summary, mobileFormatMeals)

    setMobileNutritionData(nutritionData)
  }, [])

  // Load meals data on mount and listen for meal updates
  useEffect(() => {
    loadMealsData()

    // Listen for meal updates
    const handleMealSaved = () => {
      loadMealsData()
    }

    window.addEventListener('mealSaved', handleMealSaved)

    return () => {
      window.removeEventListener('mealSaved', handleMealSaved)
    }
  }, [loadMealsData])

  // const { isLoading, status, messages } = useChat({
  //   api: '/api/upload',
  // })

  const generateAndSaveNutritionData = async (
    message: string | undefined,
    image: File | undefined
  ) => {
    setIsLoading(true)
    let objectUrl: string | undefined

    try {
      const content = `
      ${message}
      ${
        image
          ? `Use this image to analyze and extract all of the context of the meal in ordre to generate the most precise web search query. 
          Make sure to consider every aspect of the meal in the image like size, quantity, brands or company logos and ingredients: ${image.name}`
          : ''
      }
      `

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
      setIsLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <SignedIn>
        <div className="flex flex-col min-h-screen">
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

          <MealChatInput
            onSendMessage={generateAndSaveNutritionData}
            isLoading={isLoading}
            showSaveSuccess={showSaveSuccess}
          />
        </div>
      </SignedIn>
    </ErrorBoundary>
  )
}
