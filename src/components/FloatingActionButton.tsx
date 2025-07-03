'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Camera, Mic, X } from 'lucide-react'

interface FloatingActionButtonProps {
  onImageUpload: () => void
}

export default function FloatingActionButton({
  onImageUpload,
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
          <div className="flex items-center gap-2 mb-2">
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
            <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full shadow-md text-center w-full">
              Record Meal
            </span>
          </div>
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={toggleExpanded}
        className="rounded-full w-14 h-14 shadow-lg bg-green-600 hover:bg-green-700 text-white"
        size="sm"
      >
        {isExpanded ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Button>
    </div>
  )
}
