'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, Send, X, Mic, MicOff, Loader2, Database, CheckCircle } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useImageUpload } from '@/hooks/useImageUpload'

interface MealChatInputProps {
  onSendMessage: (message: string, image?: File) => void
  disabled?: boolean
  isLoading?: boolean
  isSavingMeal?: boolean
  showSaveSuccess?: boolean
}

export default function MealChatInput({ onSendMessage, disabled, isLoading, isSavingMeal, showSaveSuccess }: MealChatInputProps) {
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    isRecording,
    transcript,
    isListening,
    speechSupported,
    toggleRecording,
    clearTranscript,
  } = useSpeechRecognition()

  const { selectedImage, previewUrl, handleImageChange, convertToBase64 } = useImageUpload()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const messageText = message.trim() || transcript.trim()
    if (!messageText && !selectedImage) return

    await onSendMessage(messageText, selectedImage || undefined)
    
    // Reset form
    setMessage('')
    clearTranscript()
    setIsExpanded(false)
    
    // Clear image
    if (selectedImage) {
      handleImageChange(null)
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
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

  const handleFocus = () => {
    setIsExpanded(true)
  }

  const handleClose = () => {
    setIsExpanded(false)
    setMessage('')
    clearTranscript()
    if (selectedImage) {
      handleImageChange(null)
    }
  }

  const displayText = message || transcript

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Chat input container */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        {/* Loading indicators */}
        {(isLoading || isSavingMeal || showSaveSuccess) && (
          <div className="mb-3 flex items-center justify-center gap-2 text-sm">
            {(isLoading || isSavingMeal) && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-gray-600">
                  {isLoading && !isSavingMeal && 'Analyzing meal...'}
                  {isSavingMeal && (
                    <>
                      <Database className="w-4 h-4 inline mr-1" />
                      Saving nutrition data...
                    </>
                  )}
                </span>
              </>
            )}
            {showSaveSuccess && !isLoading && !isSavingMeal && (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Meal saved successfully!</span>
              </>
            )}
          </div>
        )}
        {/* Expanded view */}
        {isExpanded && (
          <div className="mb-4">
            {/* Close button */}
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Image preview */}
            {previewUrl && (
              <div className="mb-4 relative">
                <img
                  src={previewUrl}
                  alt="Meal preview"
                  className="max-w-full h-32 object-cover rounded-lg border"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleImageChange(null)}
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            {/* Voice transcript */}
            {transcript && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{transcript}</p>
              </div>
            )}
          </div>
        )}

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Camera button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCameraClick}
            disabled={disabled}
            className="flex-shrink-0 p-2"
          >
            <Camera className="w-4 h-4" />
          </Button>

          {/* Voice button */}
          {speechSupported && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleRecording}
              disabled={disabled}
              className={`flex-shrink-0 p-2 ${
                isRecording ? 'bg-red-100 text-red-600' : ''
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}

          {/* Text input */}
          <Input
            value={displayText}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={handleFocus}
            placeholder="Ask about your meals or add context..."
            disabled={disabled || isRecording}
            className="flex-1"
          />

          {/* Send button */}
          <Button
            type="submit"
            size="sm"
            disabled={disabled || (!displayText.trim() && !selectedImage)}
            className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white p-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed input */}
      <div className="h-20" />
    </>
  )
}