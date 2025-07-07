'use client'

import { SignedIn } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useChat } from '@ai-sdk/react'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import NutritionDisplay, {
  type NutritionData,
} from '@/components/NutritionDisplay'
import ImageUpload, { type ImageUploadRef } from '@/components/ImageUpload'
import MacroCard from '@/components/MacroCard'
import MealChatInput from '@/components/MealChatInput'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useImageUpload } from '@/hooks/useImageUpload'
import { saveMeal, type RecordedMeal } from '@/lib/mealStorage'

export default function Home() {
  const router = useRouter()
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isAnalyzingStructured, setIsAnalyzingStructured] = useState(false)
  const [showStructuredView, setShowStructuredView] = useState(false)
  const [isSavingMeal, setIsSavingMeal] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const imageUploadRef = useRef<ImageUploadRef>(null)

  const { messages, append, isLoading } = useChat({
    api: '/api/upload',
  })

  const {
    isRecording,
    transcript,
    isListening,
    speechSupported,
    toggleRecording,
    clearTranscript,
  } = useSpeechRecognition()

  const { selectedImage, previewUrl, handleImageChange, convertToBase64 } =
    useImageUpload()

  const handleSendForAnalysis = async () => {
    if (!selectedImage) return

    try {
      const base64Image = await convertToBase64(selectedImage)

      let content =
        'Analyze this meal image and provide detailed nutritional information including estimated calories, protein, carbs, and fat.'

      if (transcript.trim()) {
        content += `\n\nAdditional context from user: "${transcript.trim()}"`
      }

      await append({
        role: 'user',
        content,
        experimental_attachments: [
          {
            name: selectedImage.name,
            contentType: selectedImage.type,
            url: base64Image,
          },
        ],
      })

      clearTranscript()
    } catch (error) {
      console.error('Error processing image:', error)
    }
  }

  const handleGetStructuredAnalysis = async () => {
    if (!selectedImage) return

    setIsAnalyzingStructured(true)
    try {
      const base64Image = await convertToBase64(selectedImage)

      let content =
        'Analyze this meal image and provide detailed nutritional information including estimated calories, protein, carbs, and fat.'

      if (transcript.trim()) {
        content += `\n\nAdditional context from user: "${transcript.trim()}"`
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          structured: true,
          messages: [
            {
              role: 'user',
              content,
              experimental_attachments: [
                {
                  name: selectedImage.name,
                  contentType: selectedImage.type,
                  url: base64Image,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get structured analysis')
      }

      const data = await response.json()
      console.log('Structured analysis response:', data)
      setNutritionData(data)
      setShowStructuredView(true)

      clearTranscript()
    } catch (error) {
      console.error('Error getting structured analysis:', error)
    } finally {
      setIsAnalyzingStructured(false)
    }
  }

  const handleSaveNutritionEntry = () => {
    // TODO: Implement saving to database/local storage
    console.log('Saving nutrition entry:', nutritionData)
    alert('Nutrition entry saved! (Feature coming soon)')
  }

  const handleMealChat = async (message: string, image?: File) => {
    if (!message && !image) return

    try {
      const content =
        message ||
        'Analyze this meal image and provide detailed nutritional information.'

      // First, send the message to the chat for display
      if (image) {
        const base64Image = await convertToBase64(image)

        await append({
          role: 'user',
          content,
          experimental_attachments: [
            {
              name: image.name,
              contentType: image.type,
              url: base64Image,
            },
          ],
        })
      } else {
        await append({
          role: 'user',
          content,
        })
      }

      // Then, generate structured nutritional analysis and save to database
      await generateAndSaveNutritionData(message, image)
    } catch (error) {
      console.error('Error processing meal chat:', error)
    }
  }

  const generateAndSaveNutritionData = async (
    message: string,
    image?: File
  ) => {
    setIsSavingMeal(true)
    try {
      const content =
        message ||
        'Analyze this meal image and provide detailed nutritional information.'

      const requestBody: any = {
        structured: true,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
      }

      if (image) {
        const base64Image = await convertToBase64(image)
        requestBody.messages[0].experimental_attachments = [
          {
            name: image.name,
            contentType: image.type,
            url: base64Image,
          },
        ]
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to get structured nutrition analysis')
      }

      const nutritionData = await response.json()
      console.log('Structured nutrition data with sources:', nutritionData)

      // Save meal to database
      const savedMeal = saveMeal({
        name: nutritionData.mealName || 'Meal from Chat',
        notes: message || 'Added via chat',
        image: image ? URL.createObjectURL(image) : undefined,
        nutritionData: {
          calories: nutritionData.totalCalories || 0,
          protein: nutritionData.macros?.protein || 0,
          carbs: nutritionData.macros?.carbohydrates || 0,
          fat: nutritionData.macros?.fat || 0,
        },
        fullNutritionData: nutritionData,
      })

      console.log('Meal saved:', savedMeal)

      // Dispatch event to refresh the MacroCard
      window.dispatchEvent(new CustomEvent('mealSaved', { detail: savedMeal }))

      // Show success indicator
      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error generating and saving nutrition data:', error)
    } finally {
      setIsSavingMeal(false)
    }
  }

  const latestAnalysis = messages
    .filter((msg) => msg.role === 'assistant')
    .pop()

  return (
    <>
      <SignedIn>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 flex  p-4">
            <div className="text-center max-w-4xl w-full">
              {!showStructuredView ? (
                <>
                  <MacroCard />

                  <ImageUpload
                    ref={imageUploadRef}
                    selectedImage={selectedImage}
                    previewUrl={previewUrl}
                    onImageChange={handleImageChange}
                  />
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <Button
                      onClick={() => setShowStructuredView(false)}
                      variant="outline"
                    >
                      ← Back to Upload
                    </Button>
                    <h2 className="text-2xl font-bold">Nutrition Analysis</h2>
                    <div></div>
                  </div>

                  {nutritionData && (
                    <NutritionDisplay
                      data={nutritionData}
                      onSaveEntry={handleSaveNutritionEntry}
                    />
                  )}
                </>
              )}
            </div>
          </main>

          <MealChatInput
            onSendMessage={handleMealChat}
            disabled={isLoading}
            isLoading={isLoading}
            isSavingMeal={isSavingMeal}
            showSaveSuccess={showSaveSuccess}
          />
        </div>
      </SignedIn>
    </>
  )
}
