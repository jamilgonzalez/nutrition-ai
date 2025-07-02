'use client'

import { Button } from '@/components/ui/button'
import { Mic, Square } from 'lucide-react'

interface SpeechToTextProps {
  isRecording: boolean
  isListening: boolean
  transcript: string
  speechSupported: boolean
  onToggleRecording: () => void
  onClearTranscript: () => void
  disabled?: boolean
}

export default function SpeechToText({
  isRecording,
  isListening,
  transcript,
  speechSupported,
  onToggleRecording,
  onClearTranscript,
  disabled = false,
}: SpeechToTextProps) {
  if (!speechSupported) {
    return (
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
        <p className="text-sm text-yellow-700">
          Speech recognition is not supported in your browser. You can
          still upload images for analysis.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">
        Add Voice Context (Optional)
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Describe your meal, dietary restrictions, or ask specific
        questions about the nutritional content.
      </p>

      <div className="flex gap-2 justify-center mb-4">
        <Button
          onClick={onToggleRecording}
          variant={isRecording ? 'destructive' : 'outline'}
          size="sm"
          disabled={disabled}
        >
          {isRecording ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </>
          )}
        </Button>

        {transcript && (
          <Button
            onClick={onClearTranscript}
            variant="outline"
            size="sm"
          >
            Clear
          </Button>
        )}
      </div>

      {isListening && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="animate-pulse rounded-full h-3 w-3 bg-red-500"></div>
          <span className="text-sm text-red-600">Listening...</span>
        </div>
      )}

      {transcript && (
        <div className="mt-4 p-3 bg-white rounded-lg border text-left">
          <h4 className="font-medium mb-2">Your voice input:</h4>
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}
    </div>
  )
}