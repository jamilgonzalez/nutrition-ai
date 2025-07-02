'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Camera, Mic, X } from 'lucide-react'

interface FloatingActionButtonProps {
  onImageUpload: () => void
  onToggleRecording: () => void
  isRecording: boolean
  speechSupported: boolean
}

export default function FloatingActionButton({
  onImageUpload,
  onToggleRecording,
  isRecording,
  speechSupported,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      {/* Action buttons that appear when expanded */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
          {/* Camera/Upload button */}
          <Button
            onClick={() => {
              onImageUpload()
              setIsExpanded(false)
            }}
            size="sm"
            className="rounded-full w-12 h-12 shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Camera className="w-5 h-5" />
          </Button>

          {/* Voice recording button */}
          {speechSupported && (
            <Button
              onClick={() => {
                onToggleRecording()
                setIsExpanded(false)
              }}
              size="sm"
              variant={isRecording ? 'destructive' : 'secondary'}
              className="rounded-full w-12 h-12 shadow-lg"
            >
              {isRecording ? (
                <X className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={toggleExpanded}
        className="rounded-full w-14 h-14 shadow-lg bg-green-600 hover:bg-green-700 text-white"
        size="sm"
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </Button>
    </div>
  )
}