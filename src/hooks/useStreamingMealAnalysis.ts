import { useState, useCallback } from 'react'
import { useImageUpload } from '@/hooks/useImageUpload'
import { nutritionSchema } from '@/app/api/upload/types'
import { z } from 'zod'

export type NutritionData = z.infer<typeof nutritionSchema>

export enum LoadingState {
  IDLE = 'idle',
  ANALYZING_IMAGE = 'analyzing_image',
  ANALYZING_MEAL = 'analyzing_meal', 
  SEARCHING_WEB = 'searching_web',
  CALCULATING_NUTRITION = 'calculating_nutrition',
  FINALIZING = 'finalizing'
}

export interface LoadingMessage {
  primary: string
  secondary: string
}

export const LOADING_MESSAGES: Record<LoadingState, LoadingMessage> = {
  [LoadingState.IDLE]: {
    primary: '',
    secondary: ''
  },
  [LoadingState.ANALYZING_IMAGE]: {
    primary: "Analyzing your meal image...",
    secondary: "Identifying ingredients and portions"
  },
  [LoadingState.ANALYZING_MEAL]: {
    primary: "Understanding your meal...",
    secondary: "Processing ingredients and context"
  },
  [LoadingState.SEARCHING_WEB]: {
    primary: "Searching the web for details...",
    secondary: "Finding accurate nutrition information"
  },
  [LoadingState.CALCULATING_NUTRITION]: {
    primary: "Calculating nutrition facts...",
    secondary: "Analyzing macros and micronutrients"
  },
  [LoadingState.FINALIZING]: {
    primary: "Finalizing your meal data...",
    secondary: "Almost ready to save!"
  }
}

export interface MealAnalysisRequest {
  message?: string
  image?: File
}

export interface MealAnalysisResponse {
  data: NutritionData | null
  error: string | null
}

export interface StreamingMealAnalysisHook {
  analyzeMeal: (request: MealAnalysisRequest) => Promise<MealAnalysisResponse>
  loadingState: LoadingState
  currentMessage: LoadingMessage
  isLoading: boolean
  cancelAnalysis: () => void
}

export function useStreamingMealAnalysis(): StreamingMealAnalysisHook {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE)
  const [isCancelled, setIsCancelled] = useState(false)
  const { convertToBase64 } = useImageUpload()

  const isLoading = loadingState !== LoadingState.IDLE
  const currentMessage = LOADING_MESSAGES[loadingState]

  const transitionToState = useCallback(async (state: LoadingState, duration: number): Promise<void> => {
    if (isCancelled) return
    
    setLoadingState(state)
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!isCancelled) {
          resolve()
        }
      }, duration)
    })
  }, [isCancelled])

  const simulateLoadingStates = useCallback(async (hasImage: boolean): Promise<void> => {
    if (isCancelled) return

    if (hasImage) {
      await transitionToState(LoadingState.ANALYZING_IMAGE, 800)
    }
    
    await transitionToState(LoadingState.ANALYZING_MEAL, 1200)
    await transitionToState(LoadingState.SEARCHING_WEB, 2000)
    await transitionToState(LoadingState.CALCULATING_NUTRITION, 1000)
    await transitionToState(LoadingState.FINALIZING, 600)
  }, [transitionToState, isCancelled])

  const analyzeMeal = useCallback(async ({ message, image }: MealAnalysisRequest): Promise<MealAnalysisResponse> => {
    if (!message && !image) {
      return { data: null, error: 'Message or image is required' }
    }

    // Reset cancellation state
    setIsCancelled(false)

    try {
      // Start the simulated loading states
      const simulationPromise = simulateLoadingStates(!!image)
      
      // Prepare the API request
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

      // Make the API call
      const apiPromise = fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      // Wait for both simulation and API call to complete
      const [, response] = await Promise.all([simulationPromise, apiPromise])

      if (isCancelled) {
        return { data: null, error: 'Analysis was cancelled' }
      }

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
      if (!isCancelled) {
        setLoadingState(LoadingState.IDLE)
      }
    }
  }, [simulateLoadingStates, convertToBase64, isCancelled])

  const cancelAnalysis = useCallback(() => {
    setIsCancelled(true)
    setLoadingState(LoadingState.IDLE)
  }, [])

  return {
    analyzeMeal,
    loadingState,
    currentMessage,
    isLoading,
    cancelAnalysis,
  }
}