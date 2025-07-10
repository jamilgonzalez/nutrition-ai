import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Home from '../page'
import { useNutritionData } from '@/hooks/useNutritionData'

// Mock the hooks and components
vi.mock('@/hooks/useNutritionData')
vi.mock('@/components/NutritionTracker', () => ({
  NutritionTracker: function MockNutritionTracker({
    data,
    onDeleteMeal,
    isLoading,
    error,
  }: any) {
    return (
      <div data-testid="mobile-nutrition-tracker">
        <div data-testid="nutrition-data">{JSON.stringify(data)}</div>
        <div data-testid="loading-state">
          {isLoading ? 'loading' : 'not-loading'}
        </div>
        <div data-testid="error-state">{error || 'no-error'}</div>
        {onDeleteMeal && (
          <button
            onClick={() => onDeleteMeal('test-id')}
            data-testid="delete-meal-btn"
          >
            Delete Meal
          </button>
        )}
      </div>
    )
  },
}))

vi.mock('@/components/MealChatInput', () => ({
  default: function MockMealChatInput({ onMealSaved }: any) {
    return (
      <div data-testid="meal-chat-input">
        <button onClick={onMealSaved} data-testid="save-meal-btn">
          Save Meal
        </button>
      </div>
    )
  },
}))

const mockUseNutritionData = vi.mocked(useNutritionData)

describe('Home Page', () => {
  const mockNutritionData = {
    caloriesConsumed: 1200,
    caloriesGoal: 2000,
    caloriesRemaining: 800,
    macros: {
      protein: { current: 60, goal: 120, unit: 'g' },
      carbs: { current: 100, goal: 250, unit: 'g' },
      fat: { current: 30, goal: 70, unit: 'g' },
    },
    meals: [],
  }

  const mockLoadNutritionData = vi.fn()
  const mockHandleDeleteMeal = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('successful data loading', () => {
    beforeEach(() => {
      mockUseNutritionData.mockReturnValue({
        mobileNutritionData: mockNutritionData,
        loadNutritionData: mockLoadNutritionData,
        handleDeleteMeal: mockHandleDeleteMeal,
        isLoading: false,
        error: null,
      })
    })

    it('renders both NutritionTracker and MealChatInput components', () => {
      render(<Home />)

      expect(screen.getByTestId('mobile-nutrition-tracker')).toBeInTheDocument()
      expect(screen.getByTestId('meal-chat-input')).toBeInTheDocument()
    })

    it('passes correct props to NutritionTracker', () => {
      render(<Home />)

      expect(screen.getByTestId('nutrition-data')).toHaveTextContent(
        JSON.stringify(mockNutritionData)
      )
      expect(screen.getByTestId('loading-state')).toHaveTextContent(
        'not-loading'
      )
      expect(screen.getByTestId('error-state')).toHaveTextContent('no-error')
    })

    it('passes correct props to MealChatInput', () => {
      render(<Home />)

      const saveButton = screen.getByTestId('save-meal-btn')
      expect(saveButton).toBeInTheDocument()

      // Click should call loadNutritionData
      saveButton.click()
      expect(mockLoadNutritionData).toHaveBeenCalledTimes(1)
    })

    it('handles meal deletion through NutritionTracker', () => {
      render(<Home />)

      const deleteButton = screen.getByTestId('delete-meal-btn')
      deleteButton.click()

      expect(mockHandleDeleteMeal).toHaveBeenCalledWith('test-id')
    })
  })

  describe('loading state', () => {
    beforeEach(() => {
      mockUseNutritionData.mockReturnValue({
        mobileNutritionData: mockNutritionData,
        loadNutritionData: mockLoadNutritionData,
        handleDeleteMeal: mockHandleDeleteMeal,
        isLoading: true,
        error: null,
      })
    })

    it('passes loading state to NutritionTracker', () => {
      render(<Home />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
      expect(screen.getByTestId('error-state')).toHaveTextContent('no-error')
    })
  })

  describe('error state', () => {
    const errorMessage = 'Failed to load nutrition data'

    beforeEach(() => {
      mockUseNutritionData.mockReturnValue({
        mobileNutritionData: mockNutritionData,
        loadNutritionData: mockLoadNutritionData,
        handleDeleteMeal: mockHandleDeleteMeal,
        isLoading: false,
        error: errorMessage,
      })
    })

    it('passes error state to NutritionTracker', () => {
      render(<Home />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent(
        'not-loading'
      )
      expect(screen.getByTestId('error-state')).toHaveTextContent(errorMessage)
    })

    it('still renders MealChatInput component during error state', () => {
      render(<Home />)

      expect(screen.getByTestId('meal-chat-input')).toBeInTheDocument()
    })
  })

  describe('component layout', () => {
    beforeEach(() => {
      mockUseNutritionData.mockReturnValue({
        mobileNutritionData: mockNutritionData,
        loadNutritionData: mockLoadNutritionData,
        handleDeleteMeal: mockHandleDeleteMeal,
        isLoading: false,
        error: null,
      })
    })

    it('has proper flexbox layout structure', () => {
      render(<Home />)

      const container = screen.getByTestId(
        'mobile-nutrition-tracker'
      ).parentElement
      expect(container).toHaveClass('flex', 'flex-col', 'min-h-screen')
    })

    it('renders components in correct order', () => {
      render(<Home />)

      const container = screen.getByTestId(
        'mobile-nutrition-tracker'
      ).parentElement
      const children = container?.children

      expect(children?.[0]).toBe(screen.getByTestId('mobile-nutrition-tracker'))
      expect(children?.[1]).toBe(screen.getByTestId('meal-chat-input'))
    })
  })

  describe('hook integration', () => {
    it('calls useNutritionData hook once', () => {
      mockUseNutritionData.mockReturnValue({
        mobileNutritionData: mockNutritionData,
        loadNutritionData: mockLoadNutritionData,
        handleDeleteMeal: mockHandleDeleteMeal,
        isLoading: false,
        error: null,
      })

      render(<Home />)

      expect(mockUseNutritionData).toHaveBeenCalledTimes(1)
    })

    it('properly destructures all required values from hook', () => {
      mockUseNutritionData.mockReturnValue({
        mobileNutritionData: mockNutritionData,
        loadNutritionData: mockLoadNutritionData,
        handleDeleteMeal: mockHandleDeleteMeal,
        isLoading: false,
        error: null,
      })

      render(<Home />)

      // Verify all hook values are being used
      expect(screen.getByTestId('nutrition-data')).toBeInTheDocument()
      expect(screen.getByTestId('loading-state')).toBeInTheDocument()
      expect(screen.getByTestId('error-state')).toBeInTheDocument()
      expect(screen.getByTestId('delete-meal-btn')).toBeInTheDocument()
      expect(screen.getByTestId('save-meal-btn')).toBeInTheDocument()
    })
  })

  describe('data flow', () => {
    beforeEach(() => {
      mockUseNutritionData.mockReturnValue({
        mobileNutritionData: mockNutritionData,
        loadNutritionData: mockLoadNutritionData,
        handleDeleteMeal: mockHandleDeleteMeal,
        isLoading: false,
        error: null,
      })
    })

    it('connects MealChatInput onMealSaved to hook loadNutritionData', () => {
      render(<Home />)

      const saveButton = screen.getByTestId('save-meal-btn')

      // Initial state
      expect(mockLoadNutritionData).not.toHaveBeenCalled()

      // Trigger save
      saveButton.click()

      // Should call loadNutritionData
      expect(mockLoadNutritionData).toHaveBeenCalledTimes(1)
    })

    it('connects NutritionTracker onDeleteMeal to hook handleDeleteMeal', () => {
      render(<Home />)

      const deleteButton = screen.getByTestId('delete-meal-btn')

      // Initial state
      expect(mockHandleDeleteMeal).not.toHaveBeenCalled()

      // Trigger delete
      deleteButton.click()

      // Should call handleDeleteMeal with meal ID
      expect(mockHandleDeleteMeal).toHaveBeenCalledWith('test-id')
    })
  })

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseNutritionData.mockReturnValue({
        mobileNutritionData: mockNutritionData,
        loadNutritionData: mockLoadNutritionData,
        handleDeleteMeal: mockHandleDeleteMeal,
        isLoading: false,
        error: null,
      })
    })

    it('has proper semantic structure for main application layout', () => {
      render(<Home />)

      const container = screen.getByTestId(
        'mobile-nutrition-tracker'
      ).parentElement
      expect(container).toHaveClass('min-h-screen')

      // Should have proper flex layout for mobile experience
      expect(container).toHaveClass('flex', 'flex-col')
    })
  })
})
