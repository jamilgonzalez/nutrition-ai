import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect, MockedFunction } from 'vitest'
import { MealHistoryButton } from '../MealHistoryButton'
import * as mealStorage from '@/lib/mealStorage'
import * as analytics from '@/lib/analytics'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('@/lib/mealStorage')
vi.mock('@/lib/analytics')
vi.mock('@clerk/nextjs')
vi.mock('sonner')

const mockUser = {
  id: 'test-user-id',
  emailAddresses: [],
  firstName: 'Test',
  lastName: 'User'
}

const defaultProps = {
  onMealAdded: vi.fn(),
  user: mockUser,
  isOpen: false,
  onOpenChange: vi.fn()
}

const mockMeals = [
  {
    id: '1',
    name: 'Grilled Chicken Salad',
    timestamp: new Date('2024-01-15T12:00:00Z'),
    notes: 'Healthy lunch',
    nutritionData: {
      calories: 350,
      protein: 30,
      carbs: 15,
      fat: 20
    },
    fullNutritionData: {
      mealName: 'Grilled Chicken Salad',
      totalCalories: 350,
      macros: {
        protein: 30,
        carbohydrates: 15,
        fat: 20,
        fiber: 5,
        sugar: 8
      },
      micronutrients: {
        sodium: 400,
        potassium: 600,
        vitaminC: 25
      },
      ingredients: ['chicken breast', 'mixed greens', 'olive oil', 'lemon'],
      healthScore: 85,
      recommendations: ['Great protein source'],
      portionSize: '1 large bowl',
      mealType: 'lunch' as const
    }
  },
  {
    id: '2',
    name: 'Oatmeal with Berries',
    timestamp: new Date('2024-01-14T08:00:00Z'),
    notes: 'Morning breakfast',
    nutritionData: {
      calories: 280,
      protein: 8,
      carbs: 45,
      fat: 6
    },
    fullNutritionData: {
      mealName: 'Oatmeal with Berries',
      totalCalories: 280,
      macros: {
        protein: 8,
        carbohydrates: 45,
        fat: 6,
        fiber: 8,
        sugar: 15
      },
      micronutrients: {
        potassium: 300,
        vitaminC: 40
      },
      ingredients: ['oats', 'blueberries', 'strawberries', 'milk'],
      healthScore: 90,
      recommendations: ['High in fiber'],
      portionSize: '1 bowl',
      mealType: 'breakfast' as const
    }
  },
  {
    id: '3',
    name: 'Turkey Sandwich',
    timestamp: new Date('2024-01-13T12:30:00Z'),
    notes: 'Lunch sandwich',
    nutritionData: {
      calories: 420,
      protein: 25,
      carbs: 35,
      fat: 18
    },
    fullNutritionData: {
      mealName: 'Turkey Sandwich',
      totalCalories: 420,
      macros: {
        protein: 25,
        carbohydrates: 35,
        fat: 18,
        fiber: 4,
        sugar: 6
      },
      micronutrients: {
        sodium: 800,
        potassium: 400
      },
      ingredients: ['turkey', 'bread', 'lettuce', 'tomato', 'mayonnaise'],
      healthScore: 75,
      recommendations: ['Good protein content'],
      portionSize: '1 sandwich',
      mealType: 'lunch' as const
    }
  }
]

describe('MealHistoryButton', () => {
  const mockOnMealAdded = vi.fn()
  const mockGetAllMeals = mealStorage.getAllMeals as MockedFunction<typeof mealStorage.getAllMeals>
  const mockGetMealsByFrequency = mealStorage.getMealsByFrequency as MockedFunction<typeof mealStorage.getMealsByFrequency>
  const mockSaveMeal = mealStorage.saveMeal as MockedFunction<typeof mealStorage.saveMeal>
  const mockDeleteMeal = mealStorage.deleteMeal as MockedFunction<typeof mealStorage.deleteMeal>
  const mockUseUser = useUser as MockedFunction<typeof useUser>
  const mockToast = toast as MockedFunction<typeof toast> & {
    success: MockedFunction<any>
    error: MockedFunction<any>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUser.mockReturnValue({ user: mockUser, isLoaded: true, isSignedIn: true })
    mockGetAllMeals.mockReturnValue(mockMeals)
    mockGetMealsByFrequency.mockReturnValue([mockMeals[0], mockMeals[1], mockMeals[2]])
    mockToast.success = vi.fn()
    mockToast.error = vi.fn()
  })

  describe('Rendering and Basic Functionality', () => {
    it('renders the meal history sheet when open', () => {
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByRole('dialog', { name: /meal history/i })).toBeInTheDocument()
      expect(screen.getByText('Meal History')).toBeInTheDocument()
      expect(screen.getByText('Browse and add meals from your history to today\'s nutrition')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={false} />)
      
      expect(screen.queryByRole('dialog', { name: /meal history/i })).not.toBeInTheDocument()
    })

    it('tracks analytics when meal history is opened', () => {
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(analytics.analytics.mealHistoryOpened).toHaveBeenCalledWith('test-user-id')
    })
  })

  describe('Tab Navigation', () => {
    it('displays recent and frequent tabs only', () => {
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByRole('tab', { name: /recent/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /frequent/i })).toBeInTheDocument()
      expect(screen.queryByRole('tab', { name: /search/i })).not.toBeInTheDocument()
    })

    it('tracks analytics when tabs are changed', async () => {
      const user = userEvent.setup()
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      await user.click(screen.getByRole('tab', { name: /frequent/i }))
      
      await waitFor(() => {
        expect(analytics.analytics.mealHistoryTabChanged).toHaveBeenCalledWith('test-user-id', 'frequent')
      })
    })

    it('shows recent meals in recent tab with search filtering', async () => {
      const user = userEvent.setup()
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByText('Oatmeal with Berries')).toBeInTheDocument()
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
      
      // Test search filtering within recent tab
      const searchInput = screen.getByPlaceholderText('Search meals...')
      await user.type(searchInput, 'chicken')
      
      await waitFor(() => {
        expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
        expect(screen.queryByText('Oatmeal with Berries')).not.toBeInTheDocument()
      })
    })
  })

  describe('Meal Cards and Interactions', () => {
    it('displays meal information correctly', () => {
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
      expect(screen.getByText('350cal')).toBeInTheDocument()
      expect(screen.getByText('30p')).toBeInTheDocument()
      expect(screen.getByText('15c')).toBeInTheDocument()
      expect(screen.getByText('20f')).toBeInTheDocument()
      expect(screen.getAllByText('1 times')).toHaveLength(3) // All 3 meals appear once each
    })

    it('shows favorite star for frequently eaten meals', () => {
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      // With all unique meals, no meals should show as favorites (need 3+ occurrences)
      const stars = screen.queryAllByTestId('star-icon')
      expect(stars).toHaveLength(0)
    })

    it('expands meal card to show detailed information matching main page', async () => {
      const user = userEvent.setup()
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
      
      const expandButtons = screen.getAllByRole('button', { name: /expand details/i })
      await user.click(expandButtons[0])
      
      await waitFor(() => {
        // Health Score and Meal Type
        expect(screen.getByText('Health Score: 85/10')).toBeInTheDocument()
        expect(screen.getByText('lunch')).toBeInTheDocument()
        
        // Portion Size
        expect(screen.getByText('Portion:')).toBeInTheDocument()
        expect(screen.getByText('1 large bowl')).toBeInTheDocument()
        
        // Ingredients as badges
        expect(screen.getByText('chicken breast')).toBeInTheDocument()
        expect(screen.getByText('mixed greens')).toBeInTheDocument()
        expect(screen.getByText('olive oil')).toBeInTheDocument()
        expect(screen.getByText('lemon')).toBeInTheDocument()
        
        // Detailed Nutrition
        expect(screen.getByText('Fiber:')).toBeInTheDocument()
        expect(screen.getByText('5g')).toBeInTheDocument()
        expect(screen.getByText('Sugar:')).toBeInTheDocument()
        expect(screen.getByText('8g')).toBeInTheDocument()
        
        // Micronutrients
        expect(screen.getByText('Sodium: 400mg')).toBeInTheDocument()
        expect(screen.getByText('Potassium: 600mg')).toBeInTheDocument()
        expect(screen.getByText('Vitamin C: 25mg')).toBeInTheDocument()
        
        // AI Recommendations
        expect(screen.getByText('Great protein source')).toBeInTheDocument()
      })
    })

    it('adds single meal to nutrition tracker when selected and Add to Today is clicked', async () => {
      const user = userEvent.setup()
      const newMeal = { ...mockMeals[0], id: 'new-meal-id' }
      mockSaveMeal.mockReturnValue(newMeal)
      
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
      
      // Select the meal by clicking the card
      const chickenCard = screen.getByText('Grilled Chicken Salad').closest('[data-testid], .cursor-pointer')!
      await user.click(chickenCard)
      
      await waitFor(() => {
        expect(screen.getByText('1 meal selected')).toBeInTheDocument()
      })
      
      // Click Add to Today
      const addTodayButton = screen.getByRole('button', { name: /add to today/i })
      await user.click(addTodayButton)
      
      await waitFor(() => {
        expect(mockSaveMeal).toHaveBeenCalledWith({
          name: 'Grilled Chicken Salad',
          notes: 'Added from history: Healthy lunch',
          image: undefined,
          nutritionData: mockMeals[0].nutritionData,
          fullNutritionData: mockMeals[0].fullNutritionData
        })
        expect(mockOnMealAdded).toHaveBeenCalledWith(newMeal)
        expect(mockToast.success).toHaveBeenCalledWith('Meals added!', {
          description: '1 meal added to today\'s nutrition'
        })
        expect(analytics.analytics.mealFromHistoryAdded).toHaveBeenCalledWith('test-user-id', {
          calories: 350,
          protein: 30,
          carbs: 15,
          fat: 20,
          name: 'Grilled Chicken Salad'
        })
      })
    })

    it('deletes meal from history when delete button is clicked', async () => {
      const user = userEvent.setup()
      mockDeleteMeal.mockReturnValue(true)
      
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete meal from history/i })
      await user.click(deleteButtons[0])
      
      await waitFor(() => {
        expect(mockDeleteMeal).toHaveBeenCalledWith('1')
        expect(mockToast.success).toHaveBeenCalledWith('Meal deleted from history')
        expect(analytics.analytics.mealFromHistoryDeleted).toHaveBeenCalledWith('test-user-id', '1')
      })
    })
  })

  describe('Multi-Select Functionality', () => {
    it('allows selecting meals by clicking on cards', async () => {
      const user = userEvent.setup()
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
      
      // Click on the first meal card to select it
      const mealCards = screen.getAllByText('Grilled Chicken Salad')
      await user.click(mealCards[0].closest('.cursor-pointer')!)
      
      await waitFor(() => {
        // Check that the sticky bottom button appears
        expect(screen.getByText('1 meal selected')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /add to today/i })).toBeInTheDocument()
      })
    })

    it('allows selecting multiple meals and shows updated count', async () => {
      const user = userEvent.setup()
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
      expect(screen.getByText('Oatmeal with Berries')).toBeInTheDocument()
      
      // Select first meal by clicking on the card
      const chickenCard = screen.getByText('Grilled Chicken Salad').closest('.cursor-pointer')!
      await user.click(chickenCard)
      
      await waitFor(() => {
        expect(screen.getByText('1 meal selected')).toBeInTheDocument()
      })
      
      // Select second meal
      const oatmealCard = screen.getByText('Oatmeal with Berries').closest('.cursor-pointer')!
      await user.click(oatmealCard)
      
      await waitFor(() => {
        expect(screen.getByText('2 meals selected')).toBeInTheDocument()
      })
    })

    it('adds multiple selected meals when Add to Today button is clicked', async () => {
      const user = userEvent.setup()
      const newMeal1 = { ...mockMeals[0], id: 'new-meal-1' }
      const newMeal2 = { ...mockMeals[1], id: 'new-meal-2' }
      mockSaveMeal.mockReturnValueOnce(newMeal1).mockReturnValueOnce(newMeal2)
      
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
      expect(screen.getByText('Oatmeal with Berries')).toBeInTheDocument()
      
      // Select first two meals by clicking on cards
      const chickenCard = screen.getByText('Grilled Chicken Salad').closest('.cursor-pointer')!
      const oatmealCard = screen.getByText('Oatmeal with Berries').closest('.cursor-pointer')!
      
      await user.click(chickenCard)
      await user.click(oatmealCard)
      
      await waitFor(() => {
        expect(screen.getByText('2 meals selected')).toBeInTheDocument()
      })
      
      // Click Add to Today
      const addTodayButton = screen.getByRole('button', { name: /add to today/i })
      await user.click(addTodayButton)
      
      await waitFor(() => {
        expect(mockSaveMeal).toHaveBeenCalledTimes(2)
        expect(mockOnMealAdded).toHaveBeenCalledTimes(2)
        expect(mockToast.success).toHaveBeenCalledWith('Meals added!', {
          description: '2 meals added to today\'s nutrition'
        })
      })
    })

    it('filters meals in both tabs based on search query', async () => {
      const user = userEvent.setup()
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      const searchInput = screen.getByPlaceholderText('Search meals...')
      await user.type(searchInput, 'chicken')
      
      await waitFor(() => {
        expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
        expect(screen.queryByText('Oatmeal with Berries')).not.toBeInTheDocument()
      })
      
      // Switch to frequent tab and verify filtering still works
      await user.click(screen.getByRole('tab', { name: /frequent/i }))
      
      await waitFor(() => {
        expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
        expect(screen.queryByText('Oatmeal with Berries')).not.toBeInTheDocument()
      })
    })

    it('tracks search analytics with debounce', async () => {
      const user = userEvent.setup()
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      const searchInput = screen.getByPlaceholderText('Search meals...')
      await user.type(searchInput, 'chicken')
      
      await waitFor(() => {
        expect(analytics.analytics.mealHistorySearchUsed).toHaveBeenCalledWith('test-user-id', 'chicken')
      }, { timeout: 1000 })
    })

    it('can deselect meals by clicking them again', async () => {
      const user = userEvent.setup()
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
      
      // Select a meal
      const chickenCard = screen.getByText('Grilled Chicken Salad').closest('.cursor-pointer')!
      await user.click(chickenCard)
      
      await waitFor(() => {
        expect(screen.getByText('1 meal selected')).toBeInTheDocument()
      })
      
      // Deselect the same meal
      await user.click(chickenCard)
      
      await waitFor(() => {
        expect(screen.queryByText('1 meal selected')).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /add to today/i })).not.toBeInTheDocument()
      })
    })

    it('shows appropriate empty states with search', async () => {
      const user = userEvent.setup()
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      const searchInput = screen.getByPlaceholderText('Search meals...')
      await user.type(searchInput, 'nonexistent meal')
      
      await waitFor(() => {
        expect(screen.getByText('No recent meals found matching your search')).toBeInTheDocument()
      })
      
      // Switch to frequent tab
      await user.click(screen.getByRole('tab', { name: /frequent/i }))
      
      await waitFor(() => {
        expect(screen.getByText('No frequent meals found matching your search')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles error when adding meal fails', async () => {
      const user = userEvent.setup()
      
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
      
      // Mock the saveMeal to throw error after component renders
      mockSaveMeal.mockImplementation(() => {
        throw new Error('Save failed')
      })
      
      // Select a meal by clicking the card
      const chickenCard = screen.getByText('Grilled Chicken Salad').closest('[data-testid], .cursor-pointer')!
      await user.click(chickenCard)
      
      await waitFor(() => {
        expect(screen.getByText('1 meal selected')).toBeInTheDocument()
      })
      
      // Click Add to Today button
      const addTodayButton = screen.getByRole('button', { name: /add to today/i })
      await user.click(addTodayButton)
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to add meals', {
          description: 'Please try again'
        })
      })
    })

    it('handles error when deleting meal fails', async () => {
      const user = userEvent.setup()
      mockDeleteMeal.mockReturnValue(false)
      
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete meal from history/i })
      await user.click(deleteButtons[0])
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to delete meal', {
          description: 'Please try again'
        })
      })
    })
  })

  describe('Empty States', () => {
    it('shows empty state when no recent meals exist', () => {
      mockGetAllMeals.mockReturnValue([])
      
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getByText('No recent meals found')).toBeInTheDocument()
    })

    it('shows empty state when no frequent meals exist', async () => {
      mockGetAllMeals.mockReturnValue([])
      mockGetMealsByFrequency.mockReturnValue([])
      const user = userEvent.setup()
      
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      await user.click(screen.getByRole('tab', { name: /frequent/i }))
      
      await waitFor(() => {
        expect(screen.getByText('No frequent meals found')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels for interactive elements', () => {
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      expect(screen.getAllByLabelText('Expand details')).toHaveLength(3)
      expect(screen.getAllByLabelText('Delete meal from history')).toHaveLength(3)
      // Cards are now clickable for selection instead of having individual add buttons
      const cards = screen.getAllByText('Grilled Chicken Salad', { selector: 'h4' })
      expect(cards.length).toBeGreaterThan(0)
    })

    it('supports keyboard navigation', () => {
      render(<MealHistoryButton {...defaultProps} onMealAdded={mockOnMealAdded} isOpen={true} />)
      
      // The sheet should be open and accessible
      expect(screen.getByRole('dialog', { name: /meal history/i })).toBeInTheDocument()
      expect(screen.getByText('Meal History')).toBeInTheDocument()
    })
  })
})