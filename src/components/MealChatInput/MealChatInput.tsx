'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useStreamingMealAnalysis } from '@/hooks/useStreamingMealAnalysis'
import { saveMeal, type RecordedMeal } from '@/lib/mealStorage'
import { ObjectURLManager } from '@/utils/memoryManagement'
import { toast } from 'sonner'
import { FileInput } from './atoms/FileInput'
import { ExpandedView } from './organisms/ExpandedView'
import { InputWithButton } from './molecules/InputWithButton'
import { InputToolbar } from './organisms/InputToolbar'
import { StreamingLoadingView } from './organisms/StreamingLoadingView'
import { analytics } from '@/lib/analytics'
import { useUser } from '@clerk/nextjs'

interface MealChatInputProps {
  onMealSaved: () => void
}

export default function MealChatInput({ onMealSaved }: MealChatInputProps) {
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const { user } = useUser()

  const {
    isRecording,
    transcript,
    speechSupported,
    toggleRecording,
    clearTranscript,
  } = useSpeechRecognition()

  const { selectedImage, previewUrl, handleImageChange } = useImageUpload()
  const {
    analyzeMeal,
    isLoading,
    loadingState,
    currentMessage,
    cancelAnalysis,
  } = useStreamingMealAnalysis()

  // Derive form state from basic state
  const formState = useMemo(() => {
    const displayText = message || transcript
    const hasContent = displayText.trim() || selectedImage

    return {
      displayText,
      hasContent,
      canSubmit: hasContent && !isLoading && !isRecording,
    }
  }, [message, transcript, selectedImage, isLoading, isRecording])

  // Track voice input usage when transcript changes
  useEffect(() => {
    if (transcript && !isRecording && user) {
      analytics.voiceInputUsed(user.id, transcript.length)
    }
  }, [transcript, isRecording, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formState.canSubmit) return

    const messageText = formState.displayText.trim()
    let objectUrl: string | undefined
    const analysisStartTime = Date.now()

    // Track chat usage
    if (user) {
      analytics.chatUsed(user.id, messageText.length, !!selectedImage)
    }

    try {
      const {
        data: nutritionData,
        error,
        errorCode,
        retryable,
      } = await analyzeMeal({
        message: messageText,
        image: selectedImage || undefined,
      })

      const analysisTime = Date.now() - analysisStartTime

      if (error) {
        console.error('Error analyzing meal:', error)

        // Track error
        if (user) {
          analytics.errorOccurred(user.id, error, 'meal_analysis')
        }

        // Show specific error message to user
        toast.error(`Analysis Failed`, {
          description: error,
        })

        // Only clear form data if error is not retryable
        if (!retryable) {
          setMessage('')
          clearTranscript()
          setIsExpanded(false)
          if (selectedImage) {
            handleImageChange(null)
          }
        }

        return
      }

      if (!nutritionData) {
        console.error('No nutrition data received')
        toast.error('Analysis Failed', {
          description:
            'No nutrition data was generated. Please try again with a different image or description.',
        })
        return
      }

      if (selectedImage) {
        objectUrl = ObjectURLManager.createObjectURL(selectedImage)
      }

      const mealData = {
        name: nutritionData.mealName || 'Meal from Chat',
        notes: messageText || 'Added via chat',
        image: objectUrl,
        nutritionData: {
          calories: nutritionData.totalCalories || 0,
          protein: nutritionData.macros?.protein || 0,
          carbs: nutritionData.macros?.carbohydrates || 0,
          fat: nutritionData.macros?.fat || 0,
        },
        fullNutritionData: nutritionData,
      }

      saveMeal(mealData)

      // Track meal analysis and addition
      if (user) {
        analytics.mealAnalyzed(user.id, {
          image: selectedImage,
          text: messageText,
          analysisTime,
          calories: nutritionData.totalCalories || 0,
        })

        analytics.mealAdded(user.id, {
          calories: nutritionData.totalCalories || 0,
          protein: nutritionData.macros?.protein || 0,
          carbs: nutritionData.macros?.carbohydrates || 0,
          fat: nutritionData.macros?.fat || 0,
          image: objectUrl,
          source: 'chat',
        })
      }

      onMealSaved()
      toast('Meal saved successfully!', {
        description: 'Your meal has been added to your nutrition tracker',
      })

      // Reset form state only on successful completion
      setMessage('')
      clearTranscript()
      setIsExpanded(false)
      if (selectedImage) {
        handleImageChange(null)
      }
    } catch (error) {
      console.error('Error generating and saving nutrition data:', error)

      // Track error
      if (user) {
        analytics.errorOccurred(
          user.id,
          error instanceof Error ? error.message : 'Unknown error',
          'meal_analysis'
        )
      }

      toast.error('Failed to save meal', {
        description: 'Please try again',
      })
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageClick = () => {
    imageInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageChange(file)
      if (!isExpanded) {
        setIsExpanded(true)
      }
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = ''
  }

  const handleClose = () => {
    setIsExpanded(false)
    setMessage('')
    clearTranscript()
    if (selectedImage) {
      handleImageChange(null)
    }
  }

  const handleImageRemove = () => {
    handleImageChange(null)
  }

  const handleCancelAnalysis = () => {
    cancelAnalysis()
  }

  const handleMealFromHistoryAdded = (meal: RecordedMeal) => {
    onMealSaved()
  }

  return (
    <>
      <FileInput
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        data-testid="camera-file-input"
      />
      <FileInput
        ref={imageInputRef}
        accept="image/*"
        onChange={handleFileChange}
        data-testid="image-file-input"
      />

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 rounded-t-3xl">
        {isExpanded && !isLoading && (
          <ExpandedView
            previewUrl={previewUrl}
            transcript={transcript}
            onClose={handleClose}
            onImageRemove={handleImageRemove}
          />
        )}

        {isLoading ? (
          <StreamingLoadingView
            loadingState={loadingState}
            currentMessage={currentMessage}
            hasImage={!!selectedImage}
            hasText={!!formState.displayText.trim()}
            onCancel={handleCancelAnalysis}
            className="mb-4"
          />
        ) : (
          <div className="space-y-3">
            <InputWithButton
              value={formState.displayText}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your meal..."
              disabled={isLoading || isRecording}
              onSubmit={handleSubmit}
              hasContent={!!formState.hasContent}
            />

            <InputToolbar
              onCameraClick={handleCameraClick}
              onImageClick={handleImageClick}
              onVoiceToggle={toggleRecording}
              onMealFromHistoryAdded={handleMealFromHistoryAdded}
              disabled={isLoading}
              speechSupported={speechSupported}
              isRecording={isRecording}
              user={user}
            />
          </div>
        )}
      </div>

      <div className="h-32" />
    </>
  )
}
