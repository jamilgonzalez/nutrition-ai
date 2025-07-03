'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Image as ImageIcon, X } from 'lucide-react'

interface ImageOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  onImageChange: (file: File | null) => void
  showRemoveOption?: boolean
  onRemoveImage?: () => void
}

export default function ImageOptionsModal({
  isOpen,
  onClose,
  onImageChange,
  showRemoveOption = false,
  onRemoveImage
}: ImageOptionsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageChange(file)
      onClose()
    }
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

  const handleGalleryClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveClick = () => {
    if (onRemoveImage) {
      onRemoveImage()
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept="image/*"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept="image/*"
        capture="environment"
      />

      <div className="bg-white rounded-lg p-6 m-4 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Photo</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={handleCameraClick}
            className="w-full justify-start"
            variant="outline"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
          
          <Button
            onClick={handleGalleryClick}
            className="w-full justify-start"
            variant="outline"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Choose from Gallery
          </Button>
          
          {showRemoveOption && onRemoveImage && (
            <Button
              onClick={handleRemoveClick}
              className="w-full justify-start"
              variant="destructive"
            >
              <X className="w-4 h-4 mr-2" />
              Remove Photo
            </Button>
          )}
          
          <Button
            onClick={onClose}
            className="w-full"
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}