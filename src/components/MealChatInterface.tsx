'use client'

import { useState } from 'react'
import {
  AIInput,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
  AIInputSubmit,
  AIInputButton,
} from '@/components/ui/kibo-ui/ai/input'
import { Camera, Image, Mic, MicOff } from 'lucide-react'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

interface MealChatInterfaceProps {
  onSendMessage: (message: string, image?: File) => void
  disabled?: boolean
  isLoading?: boolean
  isSavingMeal?: boolean
  showSaveSuccess?: boolean
}

export default function MealChatInterface({
  onSendMessage,
  disabled,
  isLoading,
  isSavingMeal,
  showSaveSuccess,
}: MealChatInterfaceProps) {
  const [input, setInput] = useState('')

  const { selectedImage, previewUrl, handleImageChange } = useImageUpload()
  const {
    isRecording,
    transcript,
    speechSupported,
    toggleRecording,
    clearTranscript,
  } = useSpeechRecognition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const messageText = input.trim() || transcript.trim()
    if (!messageText && !selectedImage) return

    await onSendMessage(messageText, selectedImage || undefined)

    setInput('')
    clearTranscript()
    if (selectedImage) {
      handleImageChange(null)
    }
  }

  const handleCameraClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) handleImageChange(file)
    }
    input.click()
  }

  const handleImageClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) handleImageChange(file)
    }
    input.click()
  }

  const getSubmitStatus = () => {
    if (isSavingMeal) return 'submitted'
    if (isLoading) return 'streaming'
    return 'ready'
  }

  const displayText = input || transcript

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
      {/* Loading indicators */}
      {isSavingMeal && (
        <div className="mb-2 text-sm text-gray-600 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Saving meal...
        </div>
      )}

      {showSaveSuccess && (
        <div className="mb-2 text-sm text-green-600 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          Meal saved successfully!
        </div>
      )}

      {/* Image preview */}
      {previewUrl && (
        <div className="mb-4 relative">
          <img
            src={previewUrl}
            alt="Selected meal"
            className="w-20 h-20 object-cover rounded-lg border"
          />
          <button
            onClick={() => handleImageChange(null)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <AIInput onSubmit={handleSubmit}>
            <AIInputTextarea
              value={displayText}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your meal or upload an image..."
              disabled={disabled || isRecording}
              minHeight={48}
              maxHeight={120}
            />
            <AIInputToolbar>
              <AIInputTools>
                <AIInputButton onClick={handleCameraClick} disabled={disabled}>
                  <Camera className="w-4 h-4" />
                </AIInputButton>
                <AIInputButton onClick={handleImageClick} disabled={disabled}>
                  <Image className="w-4 h-4" />
                </AIInputButton>
                {speechSupported && (
                  <AIInputButton
                    onClick={toggleRecording}
                    disabled={disabled}
                    variant={isRecording ? 'default' : 'ghost'}
                  >
                    {isRecording ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </AIInputButton>
                )}
              </AIInputTools>
              <AIInputSubmit
                status={getSubmitStatus()}
                disabled={disabled || (!displayText.trim() && !selectedImage)}
              />
            </AIInputToolbar>
          </AIInput>
        </div>
      </div>
    </div>
  )
}
