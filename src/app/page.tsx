'use client'

import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { useRef, useState } from 'react'

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Upload a Meal</h2>
          <p className="text-gray-500 mb-8">
            Take a picture of your meal to get started.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
          {previewUrl && (
            <div className="mb-4">
              <img
                src={previewUrl}
                alt="Selected meal"
                className="mx-auto h-64 rounded-lg"
              />
            </div>
          )}
          <Button onClick={handleUploadClick}>
            {selectedImage ? 'Change Image' : 'Upload Image'}
          </Button>
        </div>
      </main>
    </div>
  )
}
