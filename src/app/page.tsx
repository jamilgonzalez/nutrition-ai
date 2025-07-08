'use client'

import { SignedIn } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
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

export default function Home() {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [showStructuredView, setShowStructuredView] = useState(false)
  const [isSavingMeal, setIsSavingMeal] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileNutritionData, setMobileNutritionData] = useState({
    caloriesConsumed: 0,
    caloriesGoal: DEFAULT_DAILY_GOALS.calories,
    caloriesRemaining: DEFAULT_DAILY_GOALS.calories,
    macros: {
      protein: { current: 0, goal: DEFAULT_DAILY_GOALS.protein, unit: 'g' },
      carbs: { current: 0, goal: DEFAULT_DAILY_GOALS.carbs, unit: 'g' },
      fat: { current: 0, goal: DEFAULT_DAILY_GOALS.fat, unit: 'g' },
    },
    meals: [] as any[],
  })
  const imageUploadRef = useRef<ImageUploadRef>(null)

  // Check if device is mobile and load meal data
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Load today's meals for mobile view
    const loadMealsData = () => {
      const meals = getTodaysMeals()
      const summary = getTodaysNutritionSummary(meals)

      // Transform meals to mobile format
      const mobileFormatMeals = meals.reduce((acc: any[], meal) => {
        // Use meal's actual type if available, otherwise derive from timestamp
        const mealType = meal.fullNutritionData?.mealType
          ? meal.fullNutritionData.mealType.charAt(0).toUpperCase() +
            meal.fullNutritionData.mealType.slice(1)
          : getMealType(meal.timestamp)

        console.log('Meal grouping debug:', {
          mealName: meal.name,
          timestamp: meal.timestamp,
          mealType,
          fullNutritionDataMealType: meal.fullNutritionData?.mealType,
        })

        const existingMeal = acc.find((m) => m.type === mealType)

        const mealItem = {
          id: meal.id,
          name: meal.name,
          time: new Date(meal.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          calories: meal.nutritionData?.calories || 0,
          protein: meal.nutritionData?.protein || 0,
          carbs: meal.nutritionData?.carbs || 0,
          fat: meal.nutritionData?.fat || 0,
          fullMeal: meal, // Preserve full meal data for expand functionality
        }

        if (existingMeal) {
          existingMeal.items.push(mealItem)
          existingMeal.count = existingMeal.items.length
        } else {
          acc.push({
            id: acc.length + 1,
            type: mealType,
            emoji: getMealEmoji(mealType),
            count: 1,
            items: [mealItem],
          })
        }

        return acc
      }, [])

      console.log('Final grouped meals:', mobileFormatMeals)

      // Use default nutrition goals (will be user-configurable in the future)
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
  }, [])

  const getMealType = (timestamp: string | Date) => {
    const hour = new Date(timestamp).getHours()
    if (hour < 11) return 'Breakfast'
    if (hour < 15) return 'Lunch'
    if (hour < 19) return 'Dinner'
    return 'Snack'
  }

  const getMealEmoji = (mealType: string) => {
    switch (mealType) {
      case 'Breakfast':
        return '🍳'
      case 'Lunch':
        return '🍔'
      case 'Dinner':
        return '🍽️'
      case 'Snack':
        return '🥨'
      default:
        return '🍽️'
    }
  }

  const { messages, append, isLoading } = useChat({
    api: '/api/upload',
  })

  const { selectedImage, previewUrl, handleImageChange, convertToBase64 } =
    useImageUpload()

  const handleSaveNutritionEntry = () => {
    // TODO: Implement saving to database/local storage
    console.log('Saving nutrition entry:', nutritionData)
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
      console.error('Error processing meal chat:', error)
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

      const requestBody: any = {
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
      console.log('Structured nutrition data with sources:', nutritionData)

      // Save meal to database
      const savedMeal = saveMeal({
        name: nutritionData.mealName || 'Meal from Chat',
        notes: message || 'Added via chat',
        image: image ? URL.createObjectURL(image) : undefined,
        nutritionData: {
          calories: nutritionData.totalCalories || 0,
          protein: nutritionData.macros?.protein || 0,
          carbs: nutritionData.macros?.carbohydrates || 0,
          fat: nutritionData.macros?.fat || 0,
        },
        fullNutritionData: nutritionData,
      })

      console.log('Meal saved:', savedMeal)

      // Dispatch event to refresh the MacroCard
      window.dispatchEvent(new CustomEvent('mealSaved', { detail: savedMeal }))

      // Show success indicator
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error generating and saving nutrition data:', error)
    } finally {
      setIsSavingMeal(false)
    }
  }

  const latestAnalysis = messages
    .filter((msg) => msg.role === 'assistant')
    .pop()

  return (
    <>
      <SignedIn>
        {isMobile ? (
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
                  // Re-run the same load logic
                  const meals = getTodaysMeals()
                  const summary = getTodaysNutritionSummary(meals)

                  const mobileFormatMeals = meals.reduce(
                    (acc: any[], meal: any) => {
                      // Use meal's actual type if available, otherwise derive from timestamp
                      const mealType = meal.fullNutritionData?.mealType
                        ? meal.fullNutritionData.mealType
                            .charAt(0)
                            .toUpperCase() +
                          meal.fullNutritionData.mealType.slice(1)
                        : getMealType(meal.timestamp)
                      const existingMeal = acc.find((m) => m.type === mealType)

                      const mealItem = {
                        id: meal.id,
                        name: meal.name,
                        time: new Date(meal.timestamp).toLocaleTimeString(
                          'en-US',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        ),
                        calories: meal.nutritionData?.calories || 0,
                        protein: meal.nutritionData?.protein || 0,
                        carbs: meal.nutritionData?.carbs || 0,
                        fat: meal.nutritionData?.fat || 0,
                        fullMeal: meal,
                      }

                      if (existingMeal) {
                        existingMeal.items.push(mealItem)
                        existingMeal.count = existingMeal.items.length
                      } else {
                        acc.push({
                          id: acc.length + 1,
                          type: mealType,
                          emoji: getMealEmoji(mealType),
                          count: 1,
                          items: [mealItem],
                        })
                      }

                      return acc
                    },
                    []
                  )

                  const caloriesGoal = DEFAULT_DAILY_GOALS.calories
                  const proteinGoal = DEFAULT_DAILY_GOALS.protein
                  const carbsGoal = DEFAULT_DAILY_GOALS.carbs
                  const fatGoal = DEFAULT_DAILY_GOALS.fat

                  setMobileNutritionData({
                    caloriesConsumed: summary.calories,
                    caloriesGoal,
                    caloriesRemaining: Math.max(
                      0,
                      caloriesGoal - summary.calories
                    ),
                    macros: {
                      protein: {
                        current: summary.protein,
                        goal: proteinGoal,
                        unit: 'g',
                      },
                      carbs: {
                        current: summary.carbs,
                        goal: carbsGoal,
                        unit: 'g',
                      },
                      fat: { current: summary.fat, goal: fatGoal, unit: 'g' },
                    },
                    meals: mobileFormatMeals,
                  })
                }
              }}
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
    </>
  )
}
