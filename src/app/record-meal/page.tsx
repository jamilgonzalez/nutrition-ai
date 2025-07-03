'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ImageIcon } from 'lucide-react'
import PressHoldVoiceButton from '@/components/PressHoldVoiceButton'
import Image from 'next/image'
import { saveMeal } from '@/lib/mealStorage'

function RecordMealContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mealDetails, setMealDetails] = useState('')
  const [mealImage, setMealImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Get image from URL params if coming from camera
    const imageParam = searchParams.get('image')
    if (imageParam) {
      setMealImage(decodeURIComponent(imageParam))
    }
  }, [searchParams])

  const handleVoiceTranscript = (text: string) => {
    setMealDetails(prev => prev + (prev ? ' ' : '') + text)
  }

  const handleSubmitMeal = async () => {
    if (!mealDetails.trim()) {
      alert('Please add some details about your meal before submitting.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Create meal name from first few words
      const mealName = mealDetails.slice(0, 50) || 'Recorded Meal'
      
      // For now, we'll save without AI analysis
      // In the future, you could optionally analyze with AI here
      const savedMeal = saveMeal({
        name: mealName,
        notes: mealDetails,
        image: mealImage || undefined,
      })
      
      console.log('Meal saved:', savedMeal)
      
      // Navigate back to home
      router.push('/')
    } catch (error) {
      console.error('Error submitting meal:', error)
      alert('Error saving meal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">Record Meal</h1>
          <div></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Meal Image */}
        {mealImage ? (
          <div className="mb-6">
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                src={mealImage}
                alt="Meal to record"
                fill
                className="object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-white border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No image uploaded</p>
            </div>
          </div>
        )}

        {/* Meal Details Input */}
        <div className="mb-6">
          <label htmlFor="mealDetails" className="block text-sm font-medium text-gray-700 mb-2">
            Add details about your meal
          </label>
          <div className="relative">
            <Textarea
              id="mealDetails"
              value={mealDetails}
              onChange={(e) => setMealDetails(e.target.value)}
              placeholder="Describe what you ate, portion sizes, cooking method, or any other details..."
              className="min-h-[120px] pr-12"
              rows={5}
            />
            <div className="absolute bottom-3 right-3">
              <PressHoldVoiceButton
                onTranscript={handleVoiceTranscript}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Press and hold the microphone to record your voice
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitMeal}
          disabled={!mealDetails.trim() || isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          size="lg"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving Meal...
            </div>
          ) : (
            'Submit Meal'
          )}
        </Button>
      </div>
    </div>
  )
}

export default function RecordMealPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="w-16"></div>
            <h1 className="text-lg font-semibold">Record Meal</h1>
            <div></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <RecordMealContent />
    </Suspense>
  )
}