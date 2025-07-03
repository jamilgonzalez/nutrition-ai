'use client'

import { SignedIn } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useChat } from 'ai/react'
import { useState, useRef } from 'react'
import NutritionDisplay, {
  type NutritionData,
} from '@/components/NutritionDisplay'
import ImageUpload, { type ImageUploadRef } from '@/components/ImageUpload'
import SpeechToText from '@/components/SpeechToText'
import ActionButtons from '@/components/ActionButtons'
import AnalysisDisplay from '@/components/AnalysisDisplay'
import MacroCard from '@/components/MacroCard'
import FloatingActionButton from '@/components/FloatingActionButton'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useImageUpload } from '@/hooks/useImageUpload'

export default function Home() {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isAnalyzingStructured, setIsAnalyzingStructured] = useState(false)
  const [showStructuredView, setShowStructuredView] = useState(false)
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

  const latestAnalysis = messages
    .filter((msg) => msg.role === 'assistant')
    .pop()

  const handleMobileImageUpload = () => {
    imageUploadRef.current?.triggerUpload()
  }

  return (
    <SignedIn>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-4xl w-full">
            {!showStructuredView ? (
              <>
                <MacroCard />

                <h2 className="text-3xl font-bold mb-4">Upload a Meal</h2>
                <p className="text-gray-500 mb-8">
                  Upload a picture of your meal and optionally add voice context
                  to get nutritional analysis.
                </p>

                <ImageUpload
                  ref={imageUploadRef}
                  selectedImage={selectedImage}
                  previewUrl={previewUrl}
                  onImageChange={handleImageChange}
                />

                <ActionButtons
                  selectedImage={selectedImage}
                  isAnalyzing={isLoading}
                  isAnalyzingStructured={isAnalyzingStructured}
                  onQuickAnalysis={handleSendForAnalysis}
                  onStructuredAnalysis={handleGetStructuredAnalysis}
                />

                <SpeechToText
                  isRecording={isRecording}
                  isListening={isListening}
                  transcript={transcript}
                  speechSupported={speechSupported}
                  onToggleRecording={toggleRecording}
                  onClearTranscript={clearTranscript}
                  disabled={isLoading}
                />

                <AnalysisDisplay
                  message={latestAnalysis || null}
                  isLoading={isLoading}
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

        <FloatingActionButton
          onImageUpload={handleMobileImageUpload}
          onToggleRecording={toggleRecording}
          isRecording={isRecording}
          speechSupported={speechSupported}
        />
      </div>
    </SignedIn>
  )
}
