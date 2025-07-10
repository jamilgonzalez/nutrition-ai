import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock child components - these need to be at the top level
vi.mock('../molecules/MobileNutritionOverview', () => ({
  default: vi.fn(
    ({ caloriesConsumed, caloriesGoal, caloriesRemaining }: any) => (
      <div data-testid="nutrition-overview">
        <span data-testid="calories-consumed">{caloriesConsumed}</span>
        <span data-testid="calories-goal">{caloriesGoal}</span>
        <span data-testid="calories-remaining">{caloriesRemaining}</span>
      </div>
    )
  ),
}))

vi.mock('../molecules/MobileMacroGrid', () => ({
  default: vi.fn(({ macros }: any) => (
    <div data-testid="macro-grid">
      <span data-testid="protein-current">{macros.protein.current}</span>
      <span data-testid="carbs-current">{macros.carbs.current}</span>
      <span data-testid="fat-current">{macros.fat.current}</span>
    </div>
  )),
}))

vi.mock('../molecules/MobileMealItem', () => ({
  default: vi.fn(({ item, onDelete }: any) => (
    <div data-testid={`meal-item-${item.id}`}>
      <span>{item.name}</span>
      {onDelete && (
        <button onClick={() => onDelete()} data-testid={`delete-${item.id}`}>
          Delete
        </button>
      )}
    </div>
  )),
}))

vi.mock('../organisms/DeleteConfirmDialog', () => ({
  default: vi.fn(({ isOpen, onConfirm, onCancel }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="delete-confirm-dialog">
        <button onClick={onConfirm} data-testid="confirm-delete">
          Delete
        </button>
        <button onClick={onCancel} data-testid="cancel-delete">
          Cancel
        </button>
      </div>
    )
  }),
}))

import MobileNutritionTracker from '../MobileNutritionTracker'
import { MobileNutritionData } from '@/utils/mealTransformation'

describe('MobileNutritionTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockMobileNutritionData: MobileNutritionData = {
    caloriesConsumed: 1500,
    caloriesGoal: 2000,
    caloriesRemaining: 500,
    macros: {
      protein: { current: 80, goal: 120, unit: 'g' },
      carbs: { current: 150, goal: 250, unit: 'g' },
      fat: { current: 40, goal: 70, unit: 'g' },
    },
    meals: [
      {
        id: 1,
        type: 'Breakfast',
        emoji: '🍳',
        count: 2,
        items: [
          {
            id: '1',
            name: 'Eggs',
            time: '08:00',
            calories: 200,
            protein: 12,
            carbs: 2,
            fat: 14,
            fullMeal: {} as any,
          },
          {
            id: '2',
            name: 'Toast',
            time: '08:00',
            calories: 150,
            protein: 4,
            carbs: 30,
            fat: 2,
            fullMeal: {} as any,
          },
        ],
      },
      {
        id: 2,
        type: 'Lunch',
        emoji: '🍔',
        count: 1,
        items: [
          {
            id: '3',
            name: 'Sandwich',
            time: '12:30',
            calories: 400,
            protein: 20,
            carbs: 40,
            fat: 15,
            fullMeal: {} as any,
          },
        ],
      },
    ],
  }

  const mockEmptyNutritionData: MobileNutritionData = {
    caloriesConsumed: 0,
    caloriesGoal: 2000,
    caloriesRemaining: 2000,
    macros: {
      protein: { current: 0, goal: 120, unit: 'g' },
      carbs: { current: 0, goal: 250, unit: 'g' },
      fat: { current: 0, goal: 70, unit: 'g' },
    },
    meals: [],
  }

  describe('successful data rendering', () => {
    it('renders nutrition overview with correct data', () => {
      render(<MobileNutritionTracker data={mockMobileNutritionData} />)

      expect(screen.getByTestId('nutrition-overview')).toBeInTheDocument()
      expect(screen.getByTestId('calories-consumed')).toHaveTextContent('1500')
      expect(screen.getByTestId('calories-goal')).toHaveTextContent('2000')
      expect(screen.getByTestId('calories-remaining')).toHaveTextContent('500')
    })

    it('renders macro grid with correct data', () => {
      render(<MobileNutritionTracker data={mockMobileNutritionData} />)

      expect(screen.getByTestId('macro-grid')).toBeInTheDocument()
      expect(screen.getByTestId('protein-current')).toHaveTextContent('80')
      expect(screen.getByTestId('carbs-current')).toHaveTextContent('150')
      expect(screen.getByTestId('fat-current')).toHaveTextContent('40')
    })

    it('renders meals section with correct total count', () => {
      render(<MobileNutritionTracker data={mockMobileNutritionData} />)

      expect(
        screen.getByRole('heading', { name: /today's meals/i })
      ).toBeInTheDocument()
      expect(screen.getByText('3 items')).toBeInTheDocument()
    })

    it('renders meal groups with correct structure', () => {
      render(<MobileNutritionTracker data={mockMobileNutritionData} />)

      // Check meal group headers
      expect(screen.getByText('Breakfast (2)')).toBeInTheDocument()
      expect(screen.getByText('Lunch (1)')).toBeInTheDocument()

      // Check emojis have proper accessibility
      const breakfastEmoji = screen.getByRole('img', { name: 'Breakfast' })
      const lunchEmoji = screen.getByRole('img', { name: 'Lunch' })
      expect(breakfastEmoji).toHaveTextContent('🍳')
      expect(lunchEmoji).toHaveTextContent('🍔')
    })

    it('renders individual meal items', () => {
      render(<MobileNutritionTracker data={mockMobileNutritionData} />)

      expect(screen.getByTestId('meal-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('meal-item-2')).toBeInTheDocument()
      expect(screen.getByTestId('meal-item-3')).toBeInTheDocument()
    })
  })

  describe('meal deletion functionality', () => {
    it('calls onDeleteMeal when delete button is clicked and confirmed', async () => {
      const user = userEvent.setup()
      const mockOnDeleteMeal = vi.fn()

      render(
        <MobileNutritionTracker
          data={mockMobileNutritionData}
          onDeleteMeal={mockOnDeleteMeal}
        />
      )

      const deleteButton = screen.getByTestId('delete-1')
      await user.click(deleteButton)

      // Confirm dialog should appear
      expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument()

      // Click confirm
      const confirmButton = screen.getByTestId('confirm-delete')
      await user.click(confirmButton)

      expect(mockOnDeleteMeal).toHaveBeenCalledWith('1')
    })

    it('does not call onDeleteMeal when delete is cancelled', async () => {
      const user = userEvent.setup()
      const mockOnDeleteMeal = vi.fn()

      render(
        <MobileNutritionTracker
          data={mockMobileNutritionData}
          onDeleteMeal={mockOnDeleteMeal}
        />
      )

      const deleteButton = screen.getByTestId('delete-1')
      await user.click(deleteButton)

      // Confirm dialog should appear
      expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument()

      // Click cancel
      const cancelButton = screen.getByTestId('cancel-delete')
      await user.click(cancelButton)

      expect(mockOnDeleteMeal).not.toHaveBeenCalled()
    })

    it('does not render delete buttons when onDeleteMeal is not provided', () => {
      render(<MobileNutritionTracker data={mockMobileNutritionData} />)

      expect(screen.queryByTestId('delete-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('delete-2')).not.toBeInTheDocument()
      expect(screen.queryByTestId('delete-3')).not.toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows loading skeleton when isLoading is true', () => {
      render(
        <MobileNutritionTracker
          data={mockMobileNutritionData}
          isLoading={true}
        />
      )

      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(screen.getByText('Loading meals...')).toBeInTheDocument()
    })

    it('shows loading skeleton with proper accessibility', () => {
      render(
        <MobileNutritionTracker
          data={mockMobileNutritionData}
          isLoading={true}
        />
      )

      const loadingElement = screen.getByRole('status')
      expect(loadingElement).toHaveAttribute('aria-live', 'polite')
    })

    it('does not show empty state when loading', () => {
      render(
        <MobileNutritionTracker
          data={mockEmptyNutritionData}
          isLoading={true}
        />
      )

      expect(screen.queryByText(/no meals today/i)).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error message when error is provided', () => {
      const errorMessage = 'Network connection failed'

      render(
        <MobileNutritionTracker
          data={mockMobileNutritionData}
          error={errorMessage}
        />
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(
        screen.getByText('Failed to load nutrition data')
      ).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('shows error with proper accessibility attributes', () => {
      render(
        <MobileNutritionTracker
          data={mockMobileNutritionData}
          error="Network error"
        />
      )

      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveAttribute('aria-live', 'polite')
    })

    it('does not render main content when error is present', () => {
      render(
        <MobileNutritionTracker
          data={mockMobileNutritionData}
          error="Network error"
        />
      )

      expect(screen.queryByTestId('nutrition-overview')).not.toBeInTheDocument()
      expect(screen.queryByTestId('macro-grid')).not.toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: /today's meals/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state when no meals are present and not loading', () => {
      render(
        <MobileNutritionTracker
          data={mockEmptyNutritionData}
          isLoading={false}
        />
      )

      expect(screen.getByText('No meals today')).toBeInTheDocument()
      expect(
        screen.getByText('Add your first meal using the chat below')
      ).toBeInTheDocument()
      expect(screen.getByText('🍽️')).toBeInTheDocument()
    })

    it('shows meal count as 0 items in empty state', () => {
      render(
        <MobileNutritionTracker
          data={mockEmptyNutritionData}
          isLoading={false}
        />
      )

      expect(screen.getByText('0 items')).toBeInTheDocument()
    })
  })

  describe('derived state behavior', () => {
    it('calculates total meal items correctly', () => {
      // Test with different meal counts
      const dataWithVariedCounts: MobileNutritionData = {
        ...mockMobileNutritionData,
        meals: [
          {
            id: 1,
            type: 'Breakfast',
            emoji: '🍳',
            count: 3,
            items: [
              {
                id: '1',
                name: 'Eggs',
                time: '08:00',
                calories: 200,
                protein: 12,
                carbs: 2,
                fat: 14,
                fullMeal: {} as any,
              },
              {
                id: '2',
                name: 'Toast',
                time: '08:00',
                calories: 150,
                protein: 4,
                carbs: 30,
                fat: 2,
                fullMeal: {} as any,
              },
              {
                id: '3',
                name: 'Bacon',
                time: '08:00',
                calories: 100,
                protein: 8,
                carbs: 0,
                fat: 8,
                fullMeal: {} as any,
              },
            ],
          },
          {
            id: 2,
            type: 'Snack',
            emoji: '🥨',
            count: 1,
            items: [
              {
                id: '4',
                name: 'Apple',
                time: '10:00',
                calories: 80,
                protein: 0,
                carbs: 20,
                fat: 0,
                fullMeal: {} as any,
              },
            ],
          },
        ],
      }

      render(<MobileNutritionTracker data={dataWithVariedCounts} />)

      expect(screen.getByText('4 items')).toBeInTheDocument()
    })

    it('handles empty meal groups correctly', () => {
      const dataWithEmptyGroups: MobileNutritionData = {
        ...mockMobileNutritionData,
        meals: [
          {
            id: 1,
            type: 'Breakfast',
            emoji: '🍳',
            count: 0,
            items: [],
          },
        ],
      }

      render(<MobileNutritionTracker data={dataWithEmptyGroups} />)

      expect(screen.getByText('0 items')).toBeInTheDocument()
      expect(screen.getByText('No meals today')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has proper semantic structure', () => {
      render(<MobileNutritionTracker data={mockMobileNutritionData} />)

      expect(
        screen.getByRole('heading', { name: /today's meals/i })
      ).toBeInTheDocument()
      expect(screen.getAllByRole('img').length).toBeGreaterThan(0)
    })

    it('uses proper ARIA attributes for emojis', () => {
      render(<MobileNutritionTracker data={mockMobileNutritionData} />)

      const breakfastEmoji = screen.getByRole('img', { name: 'Breakfast' })
      const lunchEmoji = screen.getByRole('img', { name: 'Lunch' })

      expect(breakfastEmoji).toHaveAttribute('aria-label', 'Breakfast')
      expect(lunchEmoji).toHaveAttribute('aria-label', 'Lunch')
    })
  })
})
