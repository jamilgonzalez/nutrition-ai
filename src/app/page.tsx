'use client'

import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { useChat } from 'ai/react'
import { useRef, useState } from 'react'

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { messages, append, isLoading } = useChat({
    api: '/api/upload',
  })

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

  const handleSendForAnalysis = async () => {
    if (!selectedImage) return

    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          resolve(base64String)
        }
        reader.readAsDataURL(selectedImage)
      })

      // Use the AI SDK's append function to send the message
      await append({
        role: 'user',
        content:
          'Analyze this meal image and provide detailed nutritional information including estimated calories, protein, carbs, and fat.',
        experimental_attachments: [
          {
            name: selectedImage.name,
            contentType: selectedImage.type,
            url: base64Image,
          },
        ],
      })
    } catch (error) {
      console.error('Error processing image:', error)
    }
  }

  // Get the latest assistant message for display
  const latestAnalysis = messages
    .filter((msg) => msg.role === 'assistant')
    .pop()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl w-full">
          <h2 className="text-3xl font-bold mb-4">Upload a Meal</h2>
          <p className="text-gray-500 mb-8">
            Take a picture of your meal to get nutritional analysis.
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
                className="mx-auto max-h-64 rounded-lg"
              />
            </div>
          )}
          <div className="flex gap-4 justify-center mb-6">
            <Button onClick={handleUploadClick}>
              {selectedImage ? 'Change Image' : 'Upload Image'}
            </Button>
            {selectedImage && (
              <Button onClick={handleSendForAnalysis} disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Send for Analysis'}
              </Button>
            )}
          </div>

          {latestAnalysis && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
              <h3 className="text-lg font-semibold mb-2">
                Nutritional Analysis
              </h3>
              <div className="whitespace-pre-wrap text-sm">
                {latestAnalysis.content}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
