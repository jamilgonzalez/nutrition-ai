import { renderHook } from '@testing-library/react'
import {
  useStreamingMealAnalysis,
  LoadingState,
  LOADING_MESSAGES,
} from '../useStreamingMealAnalysis'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock the useImageUpload hook
vi.mock('../useImageUpload', () => ({
  useImageUpload: () => ({
    convertToBase64: vi
      .fn()
      .mockResolvedValue('data:image/jpeg;base64,mock-base64'),
  }),
}))

// Mock fetch
global.fetch = vi.fn()

describe('useStreamingMealAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useStreamingMealAnalysis())

    expect(result.current.loadingState).toBe(LoadingState.IDLE)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.currentMessage).toBe(
      LOADING_MESSAGES[LoadingState.IDLE]
    )
  })

  it('should return error for empty input', async () => {
    const { result } = renderHook(() => useStreamingMealAnalysis())

    const response = await result.current.analyzeMeal({})

    expect(response.error).toBe('Message or image is required')
    expect(response.data).toBeNull()
    expect(result.current.loadingState).toBe(LoadingState.IDLE)
  })

  it('should provide correct loading messages for each state', () => {
    // Test each loading state has a message
    Object.values(LoadingState).forEach((state) => {
      expect(LOADING_MESSAGES[state]).toBeDefined()
      if (state !== LoadingState.IDLE) {
        expect(LOADING_MESSAGES[state].primary).toBeTruthy()
        expect(LOADING_MESSAGES[state].secondary).toBeTruthy()
      }
    })
  })

  it('should handle cancellation', () => {
    const { result } = renderHook(() => useStreamingMealAnalysis())

    expect(result.current.cancelAnalysis).toBeDefined()
    expect(typeof result.current.cancelAnalysis).toBe('function')

    // Cancel should not throw
    expect(() => result.current.cancelAnalysis()).not.toThrow()
  })

  it('should handle successful API response', async () => {
    const mockNutritionData = {
      mealName: 'Test Meal',
      totalCalories: 500,
      macros: {
        protein: 20,
        carbohydrates: 60,
        fat: 15,
      },
    }

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockNutritionData),
    }
    ;(fetch as any).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useStreamingMealAnalysis())

    const response = await result.current.analyzeMeal({ message: 'Test meal' })

    expect(response.data).toEqual(mockNutritionData)
    expect(response.error).toBeNull()
  })

  it('should handle API errors', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
    }
    ;(fetch as any).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useStreamingMealAnalysis())

    const response = await result.current.analyzeMeal({ message: 'Test meal' })

    expect(response.error).toBe('Failed to get structured nutrition analysis')
    expect(response.data).toBeNull()
  })

  it('should handle network errors', async () => {
    ;(fetch as any).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useStreamingMealAnalysis())

    const response = await result.current.analyzeMeal({ message: 'Test meal' })

    expect(response.error).toBe('Network error')
    expect(response.data).toBeNull()
  })
})
