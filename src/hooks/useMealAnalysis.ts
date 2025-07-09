import { useState } from 'react'
import { useImageUpload } from '@/hooks/useImageUpload'
import { nutritionSchema } from '@/app/api/upload/types'
import { z } from 'zod'

export type NutritionData = z.infer<typeof nutritionSchema>

export interface MealAnalysisRequest {
  message?: string
  image?: File
}

export interface MealAnalysisResponse {
  data: NutritionData | null
  error: string | null
}

export function useMealAnalysis() {
  const [isLoading, setIsLoading] = useState(false)
  const { convertToBase64 } = useImageUpload()

  const analyzeMeal = async ({ message, image }: MealAnalysisRequest): Promise<MealAnalysisResponse> => {
    if (!message && !image) {
      return { data: null, error: 'Message or image is required' }
    }

    setIsLoading(true)

    try {
      const content = `
      ${message}
      ${
        image
          ? `Use this image to analyze and extract all of the context of the meal in ordre to generate the most precise web search query. 
          Make sure to consider every aspect of the meal in the image like size, quantity, brands or company logos and ingredients: ${image.name}`
          : ''
      }
      `

      const requestBody: {
        messages: Array<{
          role: string
          content: string
          experimental_attachments?: Array<{
            name: string
            contentType: string
            url: string
          }>
        }>
      } = {
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

      return { data: nutritionData, error: null }
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    analyzeMeal,
    isLoading,
  }
}