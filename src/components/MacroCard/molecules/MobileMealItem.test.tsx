import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MobileMealItem from './MobileMealItem'

const mockMealItem = {
  id: '1',
  name: 'Chicken Salad',
  time: '12:30',
  calories: 400,
  protein: 35,
  carbs: 20,
  fat: 15,
  fullMeal: {
    id: '1',
    name: 'Chicken Salad',
    timestamp: '2023-01-01T12:30:00Z',
    nutritionData: {
      calories: 400,
      protein: 35,
      carbs: 20,
      fat: 15,
    },
    fullNutritionData: {
      mealName: 'Chicken Salad',
      totalCalories: 400,
      macros: {
        protein: 35,
        carbs: 20,
        fat: 15,
        fiber: 5,
        sugar: 8,
      },
      mealType: 'lunch',
      healthScore: 8,
      portionSize: '1 large bowl',
      ingredients: ['chicken', 'lettuce', 'tomatoes', 'cucumber'],
      recommendations: [
        'Good protein source',
        { text: 'Add more vegetables', type: 'warning' },
      ],
      sources: [
        {
          title: 'Nutrition Database',
          url: 'https://example.com/nutrition',
          domain: 'example.com',
        },
      ],
    },
  },
}

describe('MobileMealItem', () => {
  it('renders basic meal information correctly', () => {
    render(<MobileMealItem item={mockMealItem} />)

    expect(screen.getByText('Chicken Salad')).toBeInTheDocument()
    expect(screen.getByText('12:30')).toBeInTheDocument()
    expect(screen.getByText('400 cal')).toBeInTheDocument()
    expect(screen.getByText('35p')).toBeInTheDocument()
    expect(screen.getByText('20c')).toBeInTheDocument()
    expect(screen.getByText('15f')).toBeInTheDocument()
  })

  it('shows expand button when full meal data is available', () => {
    render(<MobileMealItem item={mockMealItem} />)

    const expandButton = screen.getByRole('button', { name: /expand/i })
    expect(expandButton).toBeInTheDocument()
  })

  it('does not show expand button when full meal data is not available', () => {
    const itemWithoutFullData = { ...mockMealItem, fullMeal: undefined }
    render(<MobileMealItem item={itemWithoutFullData} />)

    const expandButton = screen.queryByRole('button', { name: /expand/i })
    expect(expandButton).not.toBeInTheDocument()
  })

  it('expands to show detailed information when expand button is clicked', () => {
    render(<MobileMealItem item={mockMealItem} />)

    // Initially, detailed info should not be visible
    expect(screen.queryByText('Health Score: 8/10')).not.toBeInTheDocument()
    expect(screen.queryByText('1 large bowl')).not.toBeInTheDocument()

    // Click expand button
    fireEvent.click(screen.getByRole('button', { name: /expand/i }))

    // Now detailed info should be visible
    expect(screen.getByText('Health Score: 8/10')).toBeInTheDocument()
    expect(screen.getByText('1 large bowl')).toBeInTheDocument()
  })

  it('renders ingredients when expanded', () => {
    render(<MobileMealItem item={mockMealItem} />)

    fireEvent.click(screen.getByRole('button', { name: /expand/i }))

    expect(screen.getByText('chicken')).toBeInTheDocument()
    expect(screen.getByText('lettuce')).toBeInTheDocument()
    expect(screen.getByText('tomatoes')).toBeInTheDocument()
    expect(screen.getByText('cucumber')).toBeInTheDocument()
  })

  it('renders detailed macros when expanded', () => {
    render(<MobileMealItem item={mockMealItem} />)

    fireEvent.click(screen.getByRole('button', { name: /expand/i }))

    expect(screen.getByText('Fiber:')).toBeInTheDocument()
    expect(screen.getByText('5g')).toBeInTheDocument()
    expect(screen.getByText('Sugar:')).toBeInTheDocument()
    expect(screen.getByText('8g')).toBeInTheDocument()
  })

  it('renders recommendations when expanded', () => {
    render(<MobileMealItem item={mockMealItem} />)

    fireEvent.click(screen.getByRole('button', { name: /expand/i }))

    expect(screen.getByText('Good protein source')).toBeInTheDocument()
    expect(screen.getByText('Add more vegetables')).toBeInTheDocument()
  })

  it('renders data sources when expanded', () => {
    render(<MobileMealItem item={mockMealItem} />)

    fireEvent.click(screen.getByRole('button', { name: /expand/i }))

    expect(screen.getByText('Nutrition Database')).toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = vi.fn()
    render(<MobileMealItem item={mockMealItem} onDelete={mockOnDelete} />)

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(mockOnDelete).toHaveBeenCalledTimes(1)
  })

  it('does not show delete button when onDelete is not provided', () => {
    render(<MobileMealItem item={mockMealItem} />)

    const deleteButton = screen.queryByRole('button', { name: /delete/i })
    expect(deleteButton).not.toBeInTheDocument()
  })

  it('handles malformed URLs in data sources gracefully', () => {
    const itemWithBadUrl = {
      ...mockMealItem,
      fullMeal: {
        ...mockMealItem.fullMeal!,
        fullNutritionData: {
          ...mockMealItem.fullMeal!.fullNutritionData!,
          sources: [
            {
              title: 'Invalid Source',
              url: 'not-a-valid-url',
              domain: 'invalid.com',
            },
          ],
        },
      },
    }

    render(<MobileMealItem item={itemWithBadUrl} />)

    fireEvent.click(screen.getByRole('button', { name: /expand/i }))

    // Should still render the source, but clicking it should not crash
    expect(screen.getByText('Invalid Source')).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const minimalItem = {
      ...mockMealItem,
      fullMeal: {
        ...mockMealItem.fullMeal!,
        fullNutritionData: {
          mealName: 'Simple Meal',
          totalCalories: 200,
          macros: {
            protein: 10,
            carbs: 30,
            fat: 5,
          },
          mealType: 'snack',
          healthScore: 6,
          // Missing optional fields
        },
      },
    }

    render(<MobileMealItem item={minimalItem} />)

    fireEvent.click(screen.getByRole('button', { name: /expand/i }))

    // Should render without crashing
    expect(screen.getByText('Health Score: 6/10')).toBeInTheDocument()
  })
})