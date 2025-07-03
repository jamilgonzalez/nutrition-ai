'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ImageIcon, Camera, X } from 'lucide-react'
import PressHoldVoiceButton from '@/components/PressHoldVoiceButton'
import Image from 'next/image'
import { getMealById, updateMeal, type RecordedMeal } from '@/lib/mealStorage'
import { useImageUpload } from '@/hooks/useImageUpload'

function EditMealContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mealDetails, setMealDetails] = useState('')
  const [mealImage, setMealImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [mealId, setMealId] = useState<string | null>(null)
  const [originalMeal, setOriginalMeal] = useState<RecordedMeal | null>(null)
  const [showImageOptions, setShowImageOptions] = useState(false)
  
  const { selectedImage, previewUrl, handleImageChange, convertToBase64 } = useImageUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    handleImageChange(file || null)
  }

  useEffect(() => {
    // Get meal ID from URL params
    const id = searchParams.get('id')
    if (id) {
      setMealId(id)
      const meal = getMealById(id)
      if (meal) {
        setOriginalMeal(meal)
        setMealDetails(meal.notes)
        setMealImage(meal.image || null)
      } else {
        alert('Meal not found')
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }, [searchParams, router])

  useEffect(() => {
    // Update meal image when a new image is selected
    if (previewUrl) {
      setMealImage(previewUrl)
    }
  }, [previewUrl])

  const handleVoiceTranscript = (text: string) => {
    setMealDetails(prev => prev + (prev ? ' ' : '') + text)
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
    setShowImageOptions(false)
  }

  const handleRemoveImage = () => {
    setMealImage(null)
    setShowImageOptions(false)
  }

  const handleUpdateMeal = async () => {
    if (!mealDetails.trim()) {
      alert('Please add some details about your meal before saving.')
      return
    }

    if (!mealId) {
      alert('Meal ID not found.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Create meal name from first few words
      const mealName = mealDetails.slice(0, 50) || 'Updated Meal'
      
      let nutritionData = originalMeal?.nutritionData
      
      // Re-analyze with AI if image or description changed and we have an image
      const imageChanged = mealImage !== originalMeal?.image
      const descriptionChanged = mealDetails !== originalMeal?.notes
      
      if (mealImage && (imageChanged || descriptionChanged)) {
        setIsAnalyzing(true)
        try {
          const analysisPrompt = `Analyze this meal image and provide nutritional estimates. Meal details: "${mealDetails}". Please provide a JSON response with estimated calories, protein, carbs, and fat values as numbers only.`
          
          // Convert blob URL to base64 if it's a new image
          let imageUrl = mealImage
          if (mealImage.startsWith('blob:') && selectedImage) {
            imageUrl = await convertToBase64(selectedImage)
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
                  content: analysisPrompt,
                  experimental_attachments: [
                    {
                      name: 'meal-image',
                      contentType: 'image/jpeg',
                      url: imageUrl,
                    },
                  ],
                },
              ],
            }),
          })

          if (response.ok) {
            const analysisResult = await response.json()
            
            // Try to extract nutrition data from the structured AI response
            if (analysisResult && analysisResult.totalCalories && analysisResult.macros) {
              nutritionData = {
                calories: parseInt(analysisResult.totalCalories?.toString() || '0') || 0,
                protein: parseInt(analysisResult.macros.protein?.toString() || '0') || 0,
                carbs: parseInt(analysisResult.macros.carbohydrates?.toString() || '0') || 0,
                fat: parseInt(analysisResult.macros.fat?.toString() || '0') || 0,
              }
            } else if (analysisResult && (analysisResult.calories || analysisResult.protein || analysisResult.carbs || analysisResult.fat)) {
              // Fallback for direct properties (if API format changes)
              nutritionData = {
                calories: parseInt(analysisResult.calories?.toString() || '0') || 0,
                protein: parseInt(analysisResult.protein?.toString() || '0') || 0,
                carbs: parseInt(analysisResult.carbs?.toString() || '0') || 0,
                fat: parseInt(analysisResult.fat?.toString() || '0') || 0,
              }
            } else {
              // Fallback: try to parse from text response
              const responseText = JSON.stringify(analysisResult).toLowerCase()
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
              }
            }
          }
        } catch (analysisError) {
          console.warn('Failed to analyze meal with AI:', analysisError)
          // Continue with existing nutrition data
        } finally {
          setIsAnalyzing(false)
        }
      }
      
      // Update the meal
      const updatedMeal = updateMeal(mealId, {
        name: mealName,
        notes: mealDetails,
        image: mealImage || undefined,
        nutritionData
      })
      
      if (updatedMeal) {
        console.log('Meal updated:', updatedMeal)
        router.push('/')
      } else {
        alert('Failed to update meal. Please try again.')
      }
    } catch (error) {
      console.error('Error updating meal:', error)
      alert('Error updating meal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!originalMeal) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept="image/*"
        capture="environment"
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
          <h1 className="text-lg font-semibold">Edit Meal</h1>
          <div></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Meal Image */}
        <div className="mb-6">
          {mealImage ? (
            <div className="relative">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={mealImage}
                  alt="Meal to edit"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowImageOptions(true)}
                  className="rounded-full w-8 h-8 p-0 bg-white/80 hover:bg-white"
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemoveImage}
                  className="rounded-full w-8 h-8 p-0 bg-white/80 hover:bg-red-100 text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="mb-6 bg-white border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => setShowImageOptions(true)}
            >
              <div className="text-center text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Tap to add image</p>
              </div>
            </div>
          )}

          {/* Image Options Modal */}
          {showImageOptions && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 m-4 w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-4">Update Photo</h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleImageUpload}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo / Choose Image
                  </Button>
                  <Button
                    onClick={() => setShowImageOptions(false)}
                    className="w-full"
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Meal Details Input */}
        <div className="mb-6">
          <label htmlFor="mealDetails" className="block text-sm font-medium text-gray-700 mb-2">
            Update meal details
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
                disabled={isSubmitting || isAnalyzing}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Press and hold the microphone to record your voice
          </p>
        </div>

        {/* Update Button */}
        <Button
          onClick={handleUpdateMeal}
          disabled={!mealDetails.trim() || isSubmitting || isAnalyzing}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          size="lg"
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Re-analyzing Nutrition...
            </div>
          ) : isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Updating Meal...
            </div>
          ) : (
            'Update Meal'
          )}
        </Button>
      </div>
    </div>
  )
}

export default function EditMealPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="w-16"></div>
            <h1 className="text-lg font-semibold">Edit Meal</h1>
            <div></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <EditMealContent />
    </Suspense>
  )
}