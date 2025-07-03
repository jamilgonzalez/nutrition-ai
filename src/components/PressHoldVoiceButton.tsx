'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square } from 'lucide-react'
import { useWhisperSpeechRecognition } from '@/hooks/useWhisperSpeechRecognition'

interface PressHoldVoiceButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export default function PressHoldVoiceButton({
  onTranscript,
  disabled = false,
}: PressHoldVoiceButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { 
    isRecording, 
    transcript, 
    isProcessing, 
    error, 
    startRecording, 
    stopRecording, 
    clearTranscript 
  } = useWhisperSpeechRecognition()

  // Watch for transcript changes and call onTranscript
  useEffect(() => {
    if (transcript.trim()) {
      onTranscript(transcript)
      clearTranscript()
    }
  }, [transcript, onTranscript, clearTranscript])

  // Show error if there's one
  useEffect(() => {
    if (error) {
      console.error('Speech recognition error:', error)
    }
  }, [error])

  const handleMouseDown = useCallback(() => {
    if (disabled || isProcessing) return
    
    setIsPressed(true)
    
    // Start recording after a brief delay to avoid accidental triggers
    timeoutRef.current = setTimeout(() => {
      startRecording()
    }, 100)
  }, [disabled, isProcessing, startRecording])

  const handleMouseUp = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    setIsPressed(false)
    
    if (isRecording) {
      stopRecording()
    }
  }, [isRecording, stopRecording])

  const handleMouseLeave = useCallback(() => {
    // Treat mouse leave as mouse up to stop recording
    handleMouseUp()
  }, [handleMouseUp])

  return (
    <Button
      variant="outline"
      size="sm"
      className={`rounded-full w-10 h-10 transition-all duration-150 ${
        isPressed || isRecording
          ? 'bg-red-100 border-red-300 scale-110' 
          : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      disabled={disabled || isProcessing}
    >
      {isRecording ? (
        <Square className="w-4 h-4 text-red-600" />
      ) : isProcessing ? (
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Mic className={`w-4 h-4 ${isPressed ? 'text-red-600' : 'text-gray-600'}`} />
      )}
    </Button>
  )
}