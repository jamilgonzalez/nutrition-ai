'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ImageIcon } from 'lucide-react'
import PressHoldVoiceButton from '@/components/PressHoldVoiceButton'
import Image from 'next/image'
import { saveMeal } from '@/lib/mealStorage'
import { useImageUpload } from '@/hooks/useImageUpload'
import ImageOptionsModal from '@/components/ImageOptionsModal'

function RecordMealContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mealDetails, setMealDetails] = useState('')
  const [mealImage, setMealImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showImageOptions, setShowImageOptions] = useState(false)
  
  const { selectedImage, previewUrl, handleImageChange, convertToBase64 } = useImageUpload()

  useEffect(() => {
    // Get image from sessionStorage if coming from camera
    const imageId = searchParams.get('imageId')
    if (imageId) {
      const storedImage = sessionStorage.getItem(imageId)
      if (storedImage) {
        setMealImage(storedImage)
        // Clean up sessionStorage after retrieving
        sessionStorage.removeItem(imageId)
      }
    } else {
      // Fallback: check for direct image param (for backward compatibility)
      const imageParam = searchParams.get('image')
      if (imageParam) {
        setMealImage(decodeURIComponent(imageParam))
      }
    }
  }, [searchParams])

  const handleVoiceTranscript = (text: string) => {
    setMealDetails(prev => prev + (prev ? ' ' : '') + text)
  }

  const handleImageUpload = (file: File | null) => {
    handleImageChange(file)
  }

  const handleImageClick = () => {
    setShowImageOptions(true)
  }

  // Update mealImage when a new image is selected
  useEffect(() => {
    if (previewUrl) {
      setMealImage(previewUrl)
    }
  }, [previewUrl])

  const handleSubmitMeal = async () => {
    if (!mealDetails.trim()) {
      alert('Please add some details about your meal before submitting.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Create meal name from first few words
      const mealName = mealDetails.slice(0, 50) || 'Recorded Meal'
      
      let nutritionData = undefined
      
      // Convert image to base64 if it's a blob URL
      let finalImageUrl = mealImage
      console.log('Image URL type:', mealImage?.startsWith('data:') ? 'base64' : mealImage?.startsWith('blob:') ? 'blob' : 'other')

      // Analyze with AI if we have an image
      if (finalImageUrl) {
        setIsAnalyzing(true)
        try {
          // Convert blob URL to base64 if needed
          if (finalImageUrl.startsWith('blob:') && selectedImage) {
            finalImageUrl = await convertToBase64(selectedImage)
          }

          const analysisPrompt = `Analyze this meal image and provide nutritional estimates. Meal details: "${mealDetails}". Please provide a JSON response with estimated calories, protein, carbs, and fat values as numbers only.`
          
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
                  content: analysisPrompt,
                  experimental_attachments: [
                    {
                      name: 'meal-image',
                      contentType: 'image/jpeg',
                      url: finalImageUrl,
                    },
                  ],
                },
              ],
            }),
          })

          if (response.ok) {
            const analysisResult = await response.json()
            console.log('AI Analysis Result:', analysisResult)
            
            // Try to extract nutrition data from the structured AI response
            if (analysisResult && analysisResult.totalCalories && analysisResult.macros) {
              nutritionData = {
                calories: parseInt(analysisResult.totalCalories?.toString() || '0') || 0,
                protein: parseInt(analysisResult.macros.protein?.toString() || '0') || 0,
                carbs: parseInt(analysisResult.macros.carbohydrates?.toString() || '0') || 0,
                fat: parseInt(analysisResult.macros.fat?.toString() || '0') || 0,
              }
              console.log('Extracted nutrition data from structured response:', nutritionData)
            } else if (analysisResult && (analysisResult.calories || analysisResult.protein || analysisResult.carbs || analysisResult.fat)) {
              // Fallback for direct properties (if API format changes)
              nutritionData = {
                calories: parseInt(analysisResult.calories?.toString() || '0') || 0,
                protein: parseInt(analysisResult.protein?.toString() || '0') || 0,
                carbs: parseInt(analysisResult.carbs?.toString() || '0') || 0,
                fat: parseInt(analysisResult.fat?.toString() || '0') || 0,
              }
              console.log('Extracted nutrition data from direct properties:', nutritionData)
            } else {
              // Fallback: try to parse from text response
              const responseText = JSON.stringify(analysisResult).toLowerCase()
              console.log('Fallback parsing from:', responseText)
              const calories = responseText.match(/(\d+)\s*calorie/i)?.[1]
              const protein = responseText.match(/(\d+)\s*g?\s*protein/i)?.[1]
              const carbs = responseText.match(/(\d+)\s*g?\s*carb/i)?.[1]
              const fat = responseText.match(/(\d+)\s*g?\s*fat/i)?.[1]
              
              if (calories || protein || carbs || fat) {
                nutritionData = {
                  calories: parseInt(calories || '0'),
                  protein: parseInt(protein || '0'),
                  carbs: parseInt(carbs || '0'),
                  fat: parseInt(fat || '0')
                }
                console.log('Fallback nutrition data:', nutritionData)
              } else {
                console.log('No nutrition data found in AI response')
              }
            }
          } else {
            console.error('AI analysis failed:', response.status, response.statusText)
          }
        } catch (analysisError) {
          console.warn('Failed to analyze meal with AI:', analysisError)
          // Continue without nutrition data
        } finally {
          setIsAnalyzing(false)
        }
      }
      
      // Save the meal with or without nutrition data
      const savedMeal = saveMeal({
        name: mealName,
        notes: mealDetails,
        image: finalImageUrl || undefined,
        nutritionData
      })
      
      console.log('Meal saved with nutrition data:', savedMeal, 'Nutrition data:', nutritionData)
      
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
      {/* Image Options Modal */}
      <ImageOptionsModal
        isOpen={showImageOptions}
        onClose={() => setShowImageOptions(false)}
        onImageChange={handleImageUpload}
      />

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
            <div 
              className="relative w-full h-64 rounded-lg overflow-hidden cursor-pointer group"
              onClick={handleImageClick}
            >
              <Image
                src={mealImage}
                alt="Meal to record"
                fill
                className="object-cover group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                  <ImageIcon className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Tap image to change photo
            </p>
          </div>
        ) : (
          <div 
            className="mb-6 bg-white border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
            onClick={handleImageClick}
          >
            <div className="text-center text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">Add meal photo</p>
              <p className="text-xs mt-1">Tap to take photo or upload image</p>
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
          disabled={!mealDetails.trim() || isSubmitting || isAnalyzing}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          size="lg"
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing Nutrition...
            </div>
          ) : isSubmitting ? (
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