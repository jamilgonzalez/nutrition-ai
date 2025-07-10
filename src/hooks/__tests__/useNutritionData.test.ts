import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useNutritionData } from '../useNutritionData'
import { getTodaysMeals, getTodaysNutritionSummary, deleteMeal } from '@/lib/mealStorage'
import { transformMealsToMobileFormat, createMobileNutritionData } from '@/utils/mealTransformation'
import { useUserNutritionGoals } from '@/utils/userNutrition'

// Mock dependencies
vi.mock('@/lib/mealStorage')
vi.mock('@/utils/mealTransformation')
vi.mock('@/utils/userNutrition')

const mockGetTodaysMeals = vi.mocked(getTodaysMeals)
const mockGetTodaysNutritionSummary = vi.mocked(getTodaysNutritionSummary)
const mockDeleteMeal = vi.mocked(deleteMeal)
const mockTransformMealsToMobileFormat = vi.mocked(transformMealsToMobileFormat)
const mockCreateMobileNutritionData = vi.mocked(createMobileNutritionData)
const mockUseUserNutritionGoals = vi.mocked(useUserNutritionGoals)

describe('useNutritionData', () => {
  const mockMeals = [
    {
      id: '1',
      name: 'Test Meal',
      timestamp: new Date(),
      nutritionData: { calories: 100, protein: 10, carbs: 20, fat: 5 }
    }
  ]

  const mockSummary = { calories: 100, protein: 10, carbs: 20, fat: 5 }
  const mockUserGoals = { calories: 2000, protein: 120, carbs: 250, fat: 70 }
  const mockMobileFormatMeals = [{ id: '1', type: 'Breakfast', count: 1, emoji: '🍳', items: [] }]
  const mockMobileNutritionData = {
    caloriesConsumed: 100,
    caloriesGoal: 2000,
    caloriesRemaining: 1900,
    macros: {
      protein: { current: 10, goal: 120, unit: 'g' },
      carbs: { current: 20, goal: 250, unit: 'g' },
      fat: { current: 5, goal: 70, unit: 'g' }
    },
    meals: mockMobileFormatMeals
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default successful mocks
    mockGetTodaysMeals.mockReturnValue(mockMeals)
    mockGetTodaysNutritionSummary.mockReturnValue(mockSummary)
    mockTransformMealsToMobileFormat.mockReturnValue(mockMobileFormatMeals)
    mockCreateMobileNutritionData.mockReturnValue(mockMobileNutritionData)
    mockUseUserNutritionGoals.mockReturnValue({
      loadUserGoals: vi.fn().mockResolvedValue(mockUserGoals)
    })
  })

  describe('successful data loading', () => {
    it('loads nutrition data successfully on mount', async () => {
      const { result } = renderHook(() => useNutritionData())

      // Should start with loading state
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(null)

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have loaded data successfully
      expect(result.current.mobileNutritionData).toEqual(mockMobileNutritionData)
      expect(result.current.error).toBe(null)
    })

    it('returns proper function references', async () => {
      const { result } = renderHook(() => useNutritionData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(typeof result.current.loadNutritionData).toBe('function')
      expect(typeof result.current.handleDeleteMeal).toBe('function')
    })
  })

  describe('error handling', () => {
    it('handles error when getTodaysMeals throws', async () => {
      const error = new Error('Storage error')
      mockGetTodaysMeals.mockImplementation(() => {
        throw error
      })

      const { result } = renderHook(() => useNutritionData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Storage error')
      expect(result.current.mobileNutritionData).toEqual({
        caloriesConsumed: 0,
        caloriesGoal: 2000,
        caloriesRemaining: 2000,
        macros: {
          protein: { current: 0, goal: 120, unit: 'g' },
          carbs: { current: 0, goal: 250, unit: 'g' },
          fat: { current: 0, goal: 70, unit: 'g' }
        },
        meals: []
      })
    })

    it('handles error when loadUserGoals fails', async () => {
      mockUseUserNutritionGoals.mockReturnValue({
        loadUserGoals: vi.fn().mockRejectedValue(new Error('Goals loading failed'))
      })

      const { result } = renderHook(() => useNutritionData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Goals loading failed')
    })
  })

  describe('meal deletion', () => {
    it('deletes meal successfully and reloads data', async () => {
      mockDeleteMeal.mockReturnValue(true)
      
      const { result } = renderHook(() => useNutritionData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Clear previous calls
      vi.clearAllMocks()
      mockGetTodaysMeals.mockReturnValue([])
      mockGetTodaysNutritionSummary.mockReturnValue({ calories: 0, protein: 0, carbs: 0, fat: 0 })
      mockTransformMealsToMobileFormat.mockReturnValue([])
      mockCreateMobileNutritionData.mockReturnValue({
        ...mockMobileNutritionData,
        caloriesConsumed: 0,
        meals: []
      })

      act(() => {
        const success = result.current.handleDeleteMeal('1')
        expect(success).toBe(true)
      })

      expect(mockDeleteMeal).toHaveBeenCalledWith('1')
      
      await waitFor(() => {
        expect(result.current.mobileNutritionData.meals).toEqual([])
      })
    })

    it('handles failed meal deletion', async () => {
      mockDeleteMeal.mockReturnValue(false)
      
      const { result } = renderHook(() => useNutritionData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        const success = result.current.handleDeleteMeal('1')
        expect(success).toBe(false)
      })

      expect(mockDeleteMeal).toHaveBeenCalledWith('1')
    })
  })

  describe('loading states', () => {
    it('shows loading state during data refresh', async () => {
      const { result } = renderHook(() => useNutritionData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Simulate slow loading
      let resolvePromise: (value: any) => void
      const loadUserGoalsMock = vi.fn().mockImplementation(() => 
        new Promise(resolve => {
          resolvePromise = resolve
        })
      )
      
      mockUseUserNutritionGoals.mockReturnValue({
        loadUserGoals: loadUserGoalsMock
      })

      act(() => {
        result.current.loadNutritionData()
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(null)

      // Resolve the promise
      if (resolvePromise) {
        act(() => {
          resolvePromise(mockUserGoals)
        })
      }

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('clears error when loading new data', async () => {
      // Start with error state
      mockGetTodaysMeals.mockImplementation(() => {
        throw new Error('Initial error')
      })

      const { result } = renderHook(() => useNutritionData())

      await waitFor(() => {
        expect(result.current.error).toBe('Initial error')
      })

      // Fix the mock and reload
      mockGetTodaysMeals.mockReturnValue(mockMeals)

      act(() => {
        result.current.loadNutritionData()
      })

      // Error should be cleared during loading
      expect(result.current.error).toBe(null)
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBe(null)
      })
    })
  })

  describe('derived state behavior', () => {
    it('properly memoizes mobile format meals', async () => {
      const { result, rerender } = renderHook(() => useNutritionData())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const firstMobileData = result.current.mobileNutritionData

      // Rerender without changing underlying data
      rerender()

      // Should return same reference due to memoization
      expect(result.current.mobileNutritionData).toBe(firstMobileData)
    })
  })
})