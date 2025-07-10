import { render, screen } from '@testing-library/react'
import MealNutrition from '../MealNutrition'
import { describe, it, expect } from 'vitest'

/**
 * MealNutrition Component Tests
 * 
 * This component displays nutrition badges for a meal's macronutrients.
 * Shows calories, protein, carbs, and fat with appropriate styling.
 */
describe('MealNutrition', () => {
  const mockMeal = {
    id: '1',
    name: 'Test Meal',
    description: 'A test meal',
    timestamp: new Date(),
    imagePath: '/test.jpg',
    nutritionData: {
      calories: 450,
      protein: 25,
      carbs: 35,
      fat: 18
    }
  }

  describe('Basic Functionality', () => {
    it('renders nutrition badges when nutrition data is present', () => {
      render(<MealNutrition meal={mockMeal} />)

      expect(screen.getByText('450cal')).toBeInTheDocument()
      expect(screen.getByText('25p')).toBeInTheDocument()
      expect(screen.getByText('35c')).toBeInTheDocument()
      expect(screen.getByText('18f')).toBeInTheDocument()
    })

    it('renders "No nutrition data" message when nutrition data is missing', () => {
      const mealWithoutNutrition = {
        ...mockMeal,
        nutritionData: null
      }

      render(<MealNutrition meal={mealWithoutNutrition} />)

      expect(screen.getByText('No nutrition data')).toBeInTheDocument()
      expect(screen.queryByText(/cal/)).not.toBeInTheDocument()
    })

    it('renders "No nutrition data" message when nutrition data is undefined', () => {
      const mealWithoutNutrition = {
        ...mockMeal,
        nutritionData: undefined
      }

      render(<MealNutrition meal={mealWithoutNutrition} />)

      expect(screen.getByText('No nutrition data')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('applies correct container styling', () => {
      const { container } = render(<MealNutrition meal={mockMeal} />)

      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('flex', 'items-center', 'gap-1', 'text-xs')
    })

    it('applies correct styling to no data message', () => {
      const mealWithoutNutrition = {
        ...mockMeal,
        nutritionData: null
      }

      render(<MealNutrition meal={mealWithoutNutrition} />)

      const noDataMessage = screen.getByText('No nutrition data')
      expect(noDataMessage.tagName).toBe('P')
      expect(noDataMessage).toHaveClass('text-xs', 'text-gray-500')
    })
  })

  describe('Nutrition Badge Rendering', () => {
    it('renders calories badge with correct value', () => {
      render(<MealNutrition meal={mockMeal} />)

      const caloriesBadge = screen.getByText('450cal')
      expect(caloriesBadge).toBeInTheDocument()
    })

    it('renders protein badge with correct value', () => {
      render(<MealNutrition meal={mockMeal} />)

      const proteinBadge = screen.getByText('25p')
      expect(proteinBadge).toBeInTheDocument()
    })

    it('renders carbs badge with correct value', () => {
      render(<MealNutrition meal={mockMeal} />)

      const carbsBadge = screen.getByText('35c')
      expect(carbsBadge).toBeInTheDocument()
    })

    it('renders fat badge with correct value', () => {
      render(<MealNutrition meal={mockMeal} />)

      const fatBadge = screen.getByText('18f')
      expect(fatBadge).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles zero nutrition values', () => {
      const zeroNutritionMeal = {
        ...mockMeal,
        nutritionData: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
      }

      render(<MealNutrition meal={zeroNutritionMeal} />)

      expect(screen.getByText('0cal')).toBeInTheDocument()
      expect(screen.getByText('0p')).toBeInTheDocument()
      expect(screen.getByText('0c')).toBeInTheDocument()
      expect(screen.getByText('0f')).toBeInTheDocument()
    })

    it('handles decimal nutrition values', () => {
      const decimalNutritionMeal = {
        ...mockMeal,
        nutritionData: {
          calories: 450.5,
          protein: 25.3,
          carbs: 35.7,
          fat: 18.9
        }
      }

      render(<MealNutrition meal={decimalNutritionMeal} />)

      expect(screen.getByText('450.5cal')).toBeInTheDocument()
      expect(screen.getByText('25.3p')).toBeInTheDocument()
      expect(screen.getByText('35.7c')).toBeInTheDocument()
      expect(screen.getByText('18.9f')).toBeInTheDocument()
    })

    it('handles large nutrition values', () => {
      const largeNutritionMeal = {
        ...mockMeal,
        nutritionData: {
          calories: 1500,
          protein: 100,
          carbs: 200,
          fat: 75
        }
      }

      render(<MealNutrition meal={largeNutritionMeal} />)

      expect(screen.getByText('1500cal')).toBeInTheDocument()
      expect(screen.getByText('100p')).toBeInTheDocument()
      expect(screen.getByText('200c')).toBeInTheDocument()
      expect(screen.getByText('75f')).toBeInTheDocument()
    })

    it('handles meal with partial nutrition data', () => {
      const partialNutritionMeal = {
        ...mockMeal,
        nutritionData: {
          calories: 300,
          protein: 20,
          carbs: undefined,
          fat: null
        }
      }

      render(<MealNutrition meal={partialNutritionMeal} />)

      expect(screen.getByText('300cal')).toBeInTheDocument()
      expect(screen.getByText('20p')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides semantic structure for nutrition data', () => {
      render(<MealNutrition meal={mockMeal} />)

      const nutritionBadges = screen.getAllByText(/\d+(cal|p|c|f)/)
      expect(nutritionBadges).toHaveLength(4)
    })

    it('provides meaningful message when no data is available', () => {
      const mealWithoutNutrition = {
        ...mockMeal,
        nutritionData: null
      }

      render(<MealNutrition meal={mealWithoutNutrition} />)

      const message = screen.getByText('No nutrition data')
      expect(message).toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('works with different meal structures', () => {
      const customMeal = {
        id: 'custom-1',
        name: 'Custom Meal',
        nutritionData: {
          calories: 600,
          protein: 30,
          carbs: 45,
          fat: 25
        }
      }

      render(<MealNutrition meal={customMeal} />)

      expect(screen.getByText('600cal')).toBeInTheDocument()
      expect(screen.getByText('30p')).toBeInTheDocument()
      expect(screen.getByText('45c')).toBeInTheDocument()
      expect(screen.getByText('25f')).toBeInTheDocument()
    })

    it('maintains consistent spacing between badges', () => {
      const { container } = render(<MealNutrition meal={mockMeal} />)

      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('gap-1')
    })

    it('maintains appropriate text size', () => {
      const { container } = render(<MealNutrition meal={mockMeal} />)

      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('text-xs')
    })
  })

  describe('Data Validation', () => {
    it('handles meal object without nutrition property', () => {
      const mealWithoutProperty = {
        id: '1',
        name: 'Test Meal'
        // No nutritionData property
      }

      render(<MealNutrition meal={mealWithoutProperty} />)

      expect(screen.getByText('No nutrition data')).toBeInTheDocument()
    })

    it('handles empty nutrition data object', () => {
      const mealWithEmptyNutrition = {
        ...mockMeal,
        nutritionData: {}
      }

      render(<MealNutrition meal={mealWithEmptyNutrition} />)

      // Should still render badges, but with undefined values showing as just suffixes
      expect(screen.getByText('cal')).toBeInTheDocument()
      expect(screen.getByText('p')).toBeInTheDocument()
      expect(screen.getByText('c')).toBeInTheDocument()
      expect(screen.getByText('f')).toBeInTheDocument()
    })
  })
})