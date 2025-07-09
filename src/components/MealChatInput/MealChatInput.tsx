'use client'

import { useState, useRef } from 'react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useStreamingMealAnalysis } from '@/hooks/useStreamingMealAnalysis'
import { saveMeal } from '@/lib/mealStorage'
import { ObjectURLManager } from '@/utils/memoryManagement'
import { SUCCESS_NOTIFICATION_DURATION } from '@/constants/ui'
import { FileInput } from './atoms/FileInput'
import { ExpandedView } from './organisms/ExpandedView'
import { InputWithButton } from './molecules/InputWithButton'
import { InputToolbar } from './organisms/InputToolbar'
import { StreamingLoadingView } from './organisms/StreamingLoadingView'

interface MealChatInputProps {
  onMealSaved: () => void
}

export default function MealChatInput({
  onMealSaved,
}: MealChatInputProps) {
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const {
    isRecording,
    transcript,
    speechSupported,
    toggleRecording,
    clearTranscript,
  } = useSpeechRecognition()

  const { selectedImage, previewUrl, handleImageChange } = useImageUpload()
  const { analyzeMeal, isLoading, loadingState, currentMessage, cancelAnalysis } = useStreamingMealAnalysis()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const messageText = message.trim() || transcript.trim()
    if (!messageText && !selectedImage) return

    let objectUrl: string | undefined

    try {
      const { data: nutritionData, error } = await analyzeMeal({
        message: messageText,
        image: selectedImage || undefined,
      })

      if (error) {
        console.error('Error analyzing meal:', error)
        return
      }

      if (!nutritionData) {
        console.error('No nutrition data received')
        return
      }

      if (selectedImage) {
        objectUrl = ObjectURLManager.createObjectURL(selectedImage)
      }

      saveMeal({
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
      })

      onMealSaved()

      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), SUCCESS_NOTIFICATION_DURATION)
    } catch (error) {
      console.error('Error generating and saving nutrition data:', error)
    }

    setMessage('')
    clearTranscript()
    setIsExpanded(false)

    if (selectedImage) {
      handleImageChange(null)
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

  const displayText = message || transcript
  const hasContent = displayText.trim() || selectedImage

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
            hasText={!!displayText.trim()}
            onCancel={handleCancelAnalysis}
            className="mb-4"
          />
        ) : (
          <div className="space-y-3">
            <InputWithButton
              value={displayText}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your meal..."
              disabled={isLoading || isRecording}
              onSubmit={handleSubmit}
              hasContent={!!hasContent}
            />

            <InputToolbar
              onCameraClick={handleCameraClick}
              onImageClick={handleImageClick}
              onVoiceToggle={toggleRecording}
              disabled={isLoading}
              speechSupported={speechSupported}
              isRecording={isRecording}
            />
          </div>
        )}
      </div>

      <div className="h-32" />
    </>
  )
}
