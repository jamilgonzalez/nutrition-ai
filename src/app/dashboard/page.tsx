'use client'

import { Button } from '@/components/ui/button'
import { useState, useRef, useEffect } from 'react'
import NutritionDisplay, {
  type NutritionData,
} from '@/components/NutritionDisplay'
import ImageUpload, { type ImageUploadRef } from '@/components/ImageUpload'
import MacroCard from '@/components/MacroCard'
import FloatingActionButton from '@/components/FloatingActionButton'
import { useImageUpload } from '@/hooks/useImageUpload'

export default function Dashboard() {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [showStructuredView, setShowStructuredView] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const imageUploadRef = useRef<ImageUploadRef>(null)

  const { selectedImage, previewUrl, handleImageChange } = useImageUpload()

  // Refresh data when returning from record-meal page
  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey((prev) => prev + 1)
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleSaveNutritionEntry = () => {
    // TODO: Implement saving to database/local storage
    console.log('Saving nutrition entry:', nutritionData)
    alert('Nutrition entry saved! (Feature coming soon)')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex  p-4">
        <div className="text-center max-w-4xl w-full">
          {!showStructuredView ? (
            <>
              <MacroCard key={refreshKey} />
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

      <FloatingActionButton />
    </div>
  )
}
