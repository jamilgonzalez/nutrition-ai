'use client'

import { useState, useRef } from 'react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useImageUpload } from '@/hooks/useImageUpload'
import { FileInput } from './atoms/FileInput'
import { ExpandedView } from './organisms/ExpandedView'
import { InputWithButton } from './molecules/InputWithButton'
import { InputToolbar } from './organisms/InputToolbar'

interface MealChatInputProps {
  onSendMessage: (message: string, image?: File) => void
  isLoading?: boolean
  showSaveSuccess?: boolean
}

export default function MealChatInput({
  onSendMessage,
  isLoading,
  showSaveSuccess,
}: MealChatInputProps) {
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const messageText = message.trim() || transcript.trim()
    if (!messageText && !selectedImage) return

    await onSendMessage(messageText, selectedImage || undefined)

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

  const displayText = message || transcript
  const hasContent = displayText.trim() || selectedImage

  return (
    <>
      <FileInput
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />
      <FileInput
        ref={imageInputRef}
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 rounded-t-3xl">
        {isExpanded && (
          <ExpandedView
            previewUrl={previewUrl}
            transcript={transcript}
            onClose={handleClose}
            onImageRemove={handleImageRemove}
          />
        )}

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
      </div>

      <div className="h-32" />
    </>
  )
}
