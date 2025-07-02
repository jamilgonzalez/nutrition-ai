'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRef, useImperativeHandle, forwardRef } from 'react'

interface ImageUploadProps {
  selectedImage: File | null
  previewUrl: string | null
  onImageChange: (file: File | null) => void
}

export interface ImageUploadRef {
  triggerUpload: () => void
}

const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(({
  selectedImage,
  previewUrl,
  onImageChange,
}, ref) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageChange(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  useImperativeHandle(ref, () => ({
    triggerUpload: handleUploadClick,
  }))

  return (
    <div className="mb-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
        accept="image/*"
        capture="environment"
      />

      {previewUrl && (
        <div className="mb-4">
          <Image
            src={previewUrl}
            alt="Selected meal"
            width={256}
            height={256}
            className="mx-auto max-h-64 rounded-lg object-cover"
          />
        </div>
      )}

      <Button onClick={handleUploadClick}>
        {selectedImage ? 'Change Image' : 'Upload or Take Photo'}
      </Button>
    </div>
  )
})

ImageUpload.displayName = 'ImageUpload'

export default ImageUpload