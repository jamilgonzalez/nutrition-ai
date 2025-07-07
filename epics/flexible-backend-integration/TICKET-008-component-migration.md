# TICKET-008: Component Migration

**Priority**: Medium  
**Estimate**: 4-5 hours  
**Dependencies**: TICKET-007 (useNutritionData Hook)  
**Assignee**: TBD  

## Description
Migrate existing components from direct localStorage calls to use the new `useNutritionData` hook. This enables seamless backend switching while maintaining all existing functionality.

## Acceptance Criteria
- [ ] MacroCard component uses new hook
- [ ] All direct localStorage imports removed
- [ ] Existing functionality preserved
- [ ] Real-time updates work correctly
- [ ] Loading states and error handling improved
- [ ] No performance regression

## Files to Modify
- `src/components/MacroCard/MacroCard.tsx`
- `src/components/MacroCard/organisms/RecordedMealsSection.tsx`
- `src/app/page.tsx` (meal saving logic)
- Remove or deprecate `src/lib/mealStorage.ts` (gradual migration)

## Implementation Details

### 1. Update MacroCard Component
```typescript
// src/components/MacroCard/MacroCard.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import LocationBasedSuggestions from '../LocationBasedSuggestions'
import CaloriesOverview from './molecules/CaloriesOverview'
import MacronutrientGrid from './molecules/MacronutrientGrid'
import RecordedMealsSection from './organisms/RecordedMealsSection'
import DeleteConfirmDialog from './organisms/DeleteConfirmDialog'
import { createDailyNutritionData } from './utils/nutritionCalculations'
import { useNutritionData } from '@/hooks/useNutritionData'
import { NUTRITION_SUMMARY_DEFAULT } from './constants'

export default function MacroCard() {
  const router = useRouter()
  const { user } = useUser()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  
  // Replace all the manual state management with the hook
  const {
    todaysMeals,
    nutritionTargets,
    todaysSummary,
    isLoading,
    error,
    deleteMeal,
    refreshData
  } = useNutritionData()

  const handleEditMeal = (mealId: string) => {
    router.push(`/edit-meal?id=${mealId}`)
  }

  const handleDeleteMeal = (mealId: string) => {
    setDeleteConfirmId(mealId)
  }

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      try {
        await deleteMeal(deleteConfirmId)
        setDeleteConfirmId(null)
      } catch (error) {
        console.error('Failed to delete meal:', error)
        // Error is handled by the hook, just close dialog
        setDeleteConfirmId(null)
      }
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  // Create daily nutrition data using real meal data and user's targets
  const dailyData = createDailyNutritionData(
    todaysSummary,
    nutritionTargets || undefined
  )

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Today's Nutrition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-gray-500">Loading nutrition data...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Today's Nutrition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-red-500 mb-2">Error loading nutrition data</div>
              <button 
                onClick={refreshData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Today's Nutrition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calories Overview */}
          <CaloriesOverview
            consumed={dailyData.totalCalories}
            remaining={dailyData.caloriesRemaining}
            dailyGoal={dailyData.dailyGoal}
          />

          {/* Macronutrients */}
          <MacronutrientGrid data={dailyData} />

          {/* Location-Based Meal Suggestions */}
          {/* <LocationBasedSuggestions dailyNutritionData={dailyData} /> */}

          {/* Recorded Meals */}
          <RecordedMealsSection
            meals={todaysMeals}
            onEditMeal={handleEditMeal}
            onDeleteMeal={handleDeleteMeal}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirmId}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}
```

### 2. Update Page Component for Meal Saving
```typescript
// src/app/page.tsx - Update meal saving logic
'use client'

import { SignedIn } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useChat } from '@ai-sdk/react'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import NutritionDisplay, {
  type NutritionData,
} from '@/components/NutritionDisplay'
import ImageUpload, { type ImageUploadRef } from '@/components/ImageUpload'
import MacroCard from '@/components/MacroCard'
import MealChatInput from '@/components/MealChatInput'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useNutritionData } from '@/hooks/useNutritionData'

export default function Home() {
  const router = useRouter()
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isAnalyzingStructured, setIsAnalyzingStructured] = useState(false)
  const [showStructuredView, setShowStructuredView] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const imageUploadRef = useRef<ImageUploadRef>(null)

  // Use the nutrition data hook instead of manual meal saving
  const { saveMeal, isSavingMeal } = useNutritionData()

  const { messages, append, isLoading } = useChat({
    api: '/api/upload',
  })

  const {
    isRecording,
    transcript,
    isListening,
    speechSupported,
    toggleRecording,
    clearTranscript,
  } = useSpeechRecognition()

  const { selectedImage, previewUrl, handleImageChange, convertToBase64 } =
    useImageUpload()

  // ... existing sendForAnalysis and structuredAnalysis methods remain the same

  const handleMealChat = async (message: string, image?: File) => {
    if (!message && !image) return

    try {
      const content =
        message ||
        'Analyze this meal image and provide detailed nutritional information.'

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

      // Then, generate structured nutritional analysis and save using the hook
      await generateAndSaveNutritionData(message, image)
    } catch (error) {
      console.error('Error processing meal chat:', error)
    }
  }

  const generateAndSaveNutritionData = async (
    message: string,
    image?: File
  ) => {
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

      // Use the hook to save meal instead of direct storage calls
      await saveMeal({
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

      // Show success indicator
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
      
      // No need to dispatch custom event - hook handles data refresh automatically
    } catch (error) {
      console.error('Error generating and saving nutrition data:', error)
    }
  }

  // Rest of component remains the same but uses isSavingMeal from hook
  return (
    <>
      <SignedIn>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 flex p-4">
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
                      onSaveEntry={() => {}} // This can be removed or updated
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
            isSavingMeal={isSavingMeal} // Use hook's loading state
            showSaveSuccess={showSaveSuccess}
          />
        </div>
      </SignedIn>
    </>
  )
}
```

### 3. Remove Direct Storage Dependencies
```typescript
// src/components/MacroCard/MacroCard.tsx - Remove these imports
// import {
//   getTodaysMeals,
//   getTodaysNutritionSummary,
//   deleteMeal,
//   type RecordedMeal,
// } from '@/lib/mealStorage'

// src/app/page.tsx - Remove these imports  
// import { saveMeal, type RecordedMeal } from '@/lib/mealStorage'
```

### 4. Add Error Boundary for Nutrition Data
```typescript
// src/components/NutritionErrorBoundary.tsx (new)
'use client'

import React, { Component, ReactNode } from 'react'
import { BackendError } from '@/lib/types'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class NutritionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Nutrition data error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Something went wrong with nutrition data
          </h2>
          <p className="text-gray-600 mb-4">
            {this.state.error instanceof BackendError 
              ? this.state.error.message 
              : 'An unexpected error occurred'
            }
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 5. Update Event System
```typescript
// Remove window event listeners and replace with hook's built-in refresh
// The hook automatically handles data synchronization

// Old code to remove:
// window.addEventListener('mealSaved', handleMealSaved)
// window.dispatchEvent(new CustomEvent('mealSaved', { detail: savedMeal }))

// The hook handles this internally now
```

## Migration Checklist
- [ ] Replace `getTodaysMeals()` calls with `todaysMeals` from hook
- [ ] Replace `saveMeal()` calls with hook's `saveMeal()` 
- [ ] Replace `deleteMeal()` calls with hook's `deleteMeal()`
- [ ] Replace `getTodaysNutritionSummary()` with `todaysSummary` from hook
- [ ] Remove direct localStorage imports
- [ ] Update loading states to use hook's `isLoading`
- [ ] Update error handling to use hook's `error`
- [ ] Remove manual event system for data sync

## Testing Requirements
- [ ] Verify all existing functionality works
- [ ] Test meal creation, editing, and deletion
- [ ] Verify real-time updates between components
- [ ] Test error scenarios and recovery
- [ ] Performance testing with multiple meals
- [ ] Test both backend types (localStorage and Supabase)

## Performance Considerations
- Hook uses optimistic updates for better UX
- Automatic batching of state updates
- Efficient re-rendering with proper dependencies
- Memory management for large meal lists

## Backward Compatibility
- Existing meal data continues to work
- Gradual migration path allows rollback if needed
- No breaking changes to component APIs
- Existing animations and UI behaviors preserved

## Error Handling Improvements
- Centralized error handling in the hook
- Better error messages with context
- Automatic retry mechanisms
- Graceful degradation for network issues

## Definition of Done
- [ ] All components use useNutritionData hook
- [ ] Direct localStorage calls removed
- [ ] Existing functionality preserved
- [ ] Loading states properly managed
- [ ] Error handling improved
- [ ] Real-time updates working
- [ ] Performance maintained or improved
- [ ] Tests passing
- [ ] Code review approved