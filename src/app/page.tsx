'use client'

import { SignedIn } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import NutritionDisplay, {
  type NutritionData,
} from '@/components/NutritionDisplay'
import ImageUpload, { type ImageUploadRef } from '@/components/ImageUpload'
import MacroCard, { MobileNutritionTracker } from '@/components/MacroCard'
import MealChatInput from '@/components/MealChatInput'
import { useImageUpload } from '@/hooks/useImageUpload'
import {
  saveMeal,
  getTodaysMeals,
  getTodaysNutritionSummary,
  deleteMeal,
  type RecordedMeal,
} from '@/lib/mealStorage'
import { DEFAULT_DAILY_GOALS } from '@/components/MacroCard/constants'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { BREAKPOINTS, UI_FEEDBACK } from '@/lib/constants'
import { groupMealsForMobile, createManagedObjectUrl } from '@/lib/mealUtils'
import type { MobileNutritionData, ApiRequestBody } from '@/types/nutrition'

export default function Home() {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [showStructuredView, setShowStructuredView] = useState(false)
  const [isSavingMeal, setIsSavingMeal] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileNutritionData, setMobileNutritionData] = useState<MobileNutritionData>({
    caloriesConsumed: 0,
    caloriesGoal: DEFAULT_DAILY_GOALS.calories,
    caloriesRemaining: DEFAULT_DAILY_GOALS.calories,
    macros: {
      protein: { current: 0, goal: DEFAULT_DAILY_GOALS.protein, unit: 'g' },
      carbs: { current: 0, goal: DEFAULT_DAILY_GOALS.carbs, unit: 'g' },
      fat: { current: 0, goal: DEFAULT_DAILY_GOALS.fat, unit: 'g' },
    },
    meals: [],
  })
  const imageUploadRef = useRef<ImageUploadRef>(null)

  // Memoized mobile meal data calculation
  const mobileNutritionDataMemo = useMemo(() => {
    const meals = getTodaysMeals()
    const summary = getTodaysNutritionSummary(meals)
    const mobileFormatMeals = groupMealsForMobile(meals)

    const caloriesGoal = DEFAULT_DAILY_GOALS.calories
    const proteinGoal = DEFAULT_DAILY_GOALS.protein
    const carbsGoal = DEFAULT_DAILY_GOALS.carbs
    const fatGoal = DEFAULT_DAILY_GOALS.fat

    return {
      caloriesConsumed: summary.calories,
      caloriesGoal,
      caloriesRemaining: Math.max(0, caloriesGoal - summary.calories),
      macros: {
        protein: { current: summary.protein, goal: proteinGoal, unit: 'g' },
        carbs: { current: summary.carbs, goal: carbsGoal, unit: 'g' },
        fat: { current: summary.fat, goal: fatGoal, unit: 'g' },
      },
      meals: mobileFormatMeals,
    }
  }, []) // Dependencies will be handled by the meal update trigger

  // Check if device is mobile and load meal data
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.MOBILE)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Load initial meal data
    setMobileNutritionData(mobileNutritionDataMemo)

    // Listen for meal updates
    const handleMealSaved = () => {
      // Force re-calculation by updating the state
      const meals = getTodaysMeals()
      const summary = getTodaysNutritionSummary(meals)
      const mobileFormatMeals = groupMealsForMobile(meals)

      const caloriesGoal = DEFAULT_DAILY_GOALS.calories
      const proteinGoal = DEFAULT_DAILY_GOALS.protein
      const carbsGoal = DEFAULT_DAILY_GOALS.carbs
      const fatGoal = DEFAULT_DAILY_GOALS.fat

      setMobileNutritionData({
        caloriesConsumed: summary.calories,
        caloriesGoal,
        caloriesRemaining: Math.max(0, caloriesGoal - summary.calories),
        macros: {
          protein: { current: summary.protein, goal: proteinGoal, unit: 'g' },
          carbs: { current: summary.carbs, goal: carbsGoal, unit: 'g' },
          fat: { current: summary.fat, goal: fatGoal, unit: 'g' },
        },
        meals: mobileFormatMeals,
      })
    }

    window.addEventListener('mealSaved', handleMealSaved)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('mealSaved', handleMealSaved)
    }
  }, [mobileNutritionDataMemo])

  // Memoized delete handler to prevent recreation on every render
  const handleDeleteMeal = useCallback((mealId: string) => {
    const success = deleteMeal(mealId)
    if (success) {
      const meals = getTodaysMeals()
      const summary = getTodaysNutritionSummary(meals)
      const mobileFormatMeals = groupMealsForMobile(meals)

      const caloriesGoal = DEFAULT_DAILY_GOALS.calories
      const proteinGoal = DEFAULT_DAILY_GOALS.protein
      const carbsGoal = DEFAULT_DAILY_GOALS.carbs
      const fatGoal = DEFAULT_DAILY_GOALS.fat

      setMobileNutritionData({
        caloriesConsumed: summary.calories,
        caloriesGoal,
        caloriesRemaining: Math.max(0, caloriesGoal - summary.calories),
        macros: {
          protein: { current: summary.protein, goal: proteinGoal, unit: 'g' },
          carbs: { current: summary.carbs, goal: carbsGoal, unit: 'g' },
          fat: { current: summary.fat, goal: fatGoal, unit: 'g' },
        },
        meals: mobileFormatMeals,
      })
    }
  }, [])

  const { messages, append, isLoading } = useChat({
    api: '/api/upload',
  })

  const { selectedImage, previewUrl, handleImageChange, convertToBase64 } =
    useImageUpload()

  const handleSaveNutritionEntry = () => {
    // TODO: Implement saving to database/local storage
    alert('Nutrition entry saved! (Feature coming soon)')
  }

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
      // TODO: Implement proper error handling/reporting
      alert('Failed to process meal. Please try again.')
    }
  }

  const generateAndSaveNutritionData = async (
    message: string,
    image?: File
  ) => {
    setIsSavingMeal(true)
    try {
      const content =
        message ||
        'Analyze this meal image and provide detailed nutritional information.'

      const requestBody: ApiRequestBody = {
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

      // Handle image with proper cleanup
      let imageUrl: string | undefined
      let imageCleanup: (() => void) | undefined
      
      if (image) {
        const managed = createManagedObjectUrl(image)
        imageUrl = managed.url
        imageCleanup = managed.cleanup
      }

      // Save meal to database
      const savedMeal = saveMeal({
        name: nutritionData.mealName || 'Meal from Chat',
        notes: message || 'Added via chat',
        image: imageUrl,
        nutritionData: {
          calories: nutritionData.totalCalories || 0,
          protein: nutritionData.macros?.protein || 0,
          carbs: nutritionData.macros?.carbohydrates || 0,
          fat: nutritionData.macros?.fat || 0,
        },
        fullNutritionData: nutritionData,
      })

      // Clean up image URL after a delay to ensure it's been used
      if (imageCleanup) {
        setTimeout(imageCleanup, 5000)
      }

      // Dispatch event to refresh the MacroCard
      window.dispatchEvent(new CustomEvent('mealSaved', { detail: savedMeal }))

      // Show success indicator
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), UI_FEEDBACK.SUCCESS_DISPLAY_DURATION)
    } catch (error) {
      // TODO: Implement proper error handling/reporting
      alert('Failed to save meal. Please try again.')
    } finally {
      setIsSavingMeal(false)
    }
  }

  const latestAnalysis = messages
    .filter((msg) => msg.role === 'assistant')
    .pop()

  return (
    <ErrorBoundary>
      <SignedIn>
        {isMobile ? (
          <div className="flex flex-col min-h-screen">
            <MobileNutritionTracker
              caloriesConsumed={mobileNutritionData.caloriesConsumed}
              caloriesGoal={mobileNutritionData.caloriesGoal}
              caloriesRemaining={mobileNutritionData.caloriesRemaining}
              macros={mobileNutritionData.macros}
              meals={mobileNutritionData.meals}
              onDeleteMeal={handleDeleteMeal}
            />

            <MealChatInput
              onSendMessage={handleMealChat}
              disabled={isLoading}
              isLoading={isLoading}
              isSavingMeal={isSavingMeal}
              showSaveSuccess={showSaveSuccess}
            />
          </div>
        ) : (
          <div className="flex flex-col min-h-screen">
            <main className="flex-1 flex  p-4">
              <div className="text-center max-w-4xl w-full">
                {!showStructuredView ? (
                  <>
                    <MacroCard />

                    <ImageUpload
                      ref={imageUploadRef}
                      selectedImage={selectedImage}
                      previewUrl={previewUrl}
                      onImageChange={handleImageChange}
                    />
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <Button
                        onClick={() => setShowStructuredView(false)}
                        variant="outline"
                      >
                        ← Back to Upload
                      </Button>
                      <h2 className="text-2xl font-bold">Nutrition Analysis</h2>
                      <div></div>
                    </div>

                    {nutritionData && (
                      <NutritionDisplay
                        data={nutritionData}
                        onSaveEntry={handleSaveNutritionEntry}
                      />
                    )}
                  </>
                )}
              </div>
            </main>

            <MealChatInput
              onSendMessage={handleMealChat}
              disabled={isLoading}
              isLoading={isLoading}
              isSavingMeal={isSavingMeal}
              showSaveSuccess={showSaveSuccess}
            />
          </div>
        )}
      </SignedIn>
    </ErrorBoundary>
  )
}
