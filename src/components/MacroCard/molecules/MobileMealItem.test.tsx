import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MobileMealItem from './MobileMealItem'
import { RecordedMeal } from '@/lib/mealStorage'

// Mock URL validation utils
vi.mock('@/utils/urlValidation', () => ({
  openExternalUrl: vi.fn(() => true),
  getSafeFaviconUrl: vi.fn((url: string) => `https://www.google.com/s2/favicons?domain=example.com&sz=16`),
}))

describe('MobileMealItem', () => {
  const mockOnDelete = vi.fn()
  
  const mockMealItem = {
    id: '1',
    name: 'Grilled Chicken Salad',
    time: '12:30',
    calories: 350,
    protein: 30,
    carbs: 20,
    fat: 15,
    fullMeal: {
      id: '1',
      name: 'Grilled Chicken Salad',
      timestamp: new Date('2023-10-15T12:30:00Z'),
      notes: 'Healthy lunch option',
      nutritionData: {
        calories: 350,
        protein: 30,
        carbs: 20,
        fat: 15,
      },
      fullNutritionData: {
        mealName: 'Grilled Chicken Salad',
        totalCalories: 350,
        macros: {
          protein: 30,
          carbohydrates: 20,
          fat: 15,
          fiber: 5,
          sugar: 8,
        },
        micronutrients: {
          sodium: 450,
          potassium: 600,
          vitaminC: 25,
        },
        ingredients: ['chicken breast', 'mixed greens', 'cherry tomatoes'],
        healthScore: 8,
        recommendations: ['Great source of lean protein!', 'Consider adding more healthy fats'],
        portionSize: '1 large bowl',
        mealType: 'lunch',
        sources: [
          {
            title: 'USDA Nutrition Database',
            domain: 'usda.gov',
            url: 'https://fdc.nal.usda.gov',
            relevance: 'high',
          },
        ],
      },
    } as RecordedMeal,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders meal item with basic information', () => {
    render(<MobileMealItem item={mockMealItem} onDelete={mockOnDelete} />)

    expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
    expect(screen.getByText('12:30')).toBeInTheDocument()
    expect(screen.getByText('350 cal')).toBeInTheDocument()
    expect(screen.getByText('30p')).toBeInTheDocument()
    expect(screen.getByText('20c')).toBeInTheDocument()
    expect(screen.getByText('15f')).toBeInTheDocument()
  })

  it('renders expand button when full meal data is available', () => {
    render(<MobileMealItem item={mockMealItem} onDelete={mockOnDelete} />)

    const expandButton = screen.getByRole('button', { name: /expand/i })
    expect(expandButton).toBeInTheDocument()
  })

  it('renders delete button when onDelete is provided', () => {
    render(<MobileMealItem item={mockMealItem} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    expect(deleteButton).toBeInTheDocument()
  })

  it('does not render delete button when onDelete is not provided', () => {
    render(<MobileMealItem item={mockMealItem} />)

    const deleteButton = screen.queryByRole('button', { name: /delete/i })
    expect(deleteButton).not.toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<MobileMealItem item={mockMealItem} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledTimes(1)
  })

  it('expands to show detailed information', () => {
    render(<MobileMealItem item={mockMealItem} onDelete={mockOnDelete} />)

    const expandButton = screen.getByRole('button', { name: /expand/i })
    fireEvent.click(expandButton)

    expect(screen.getByText('Health Score: 8/10')).toBeInTheDocument()
    expect(screen.getByText('lunch')).toBeInTheDocument()
    expect(screen.getByText('1 large bowl')).toBeInTheDocument()
    expect(screen.getByText('chicken breast')).toBeInTheDocument()
    expect(screen.getByText('Fiber:')).toBeInTheDocument()
    expect(screen.getByText('5g')).toBeInTheDocument()
  })

  it('renders recommendations when expanded', () => {
    render(<MobileMealItem item={mockMealItem} onDelete={mockOnDelete} />)

    const expandButton = screen.getByRole('button', { name: /expand/i })
    fireEvent.click(expandButton)

    expect(screen.getByText('Great source of lean protein!')).toBeInTheDocument()
    expect(screen.getByText('Consider adding more healthy fats')).toBeInTheDocument()
  })

  it('renders sources when expanded', () => {
    render(<MobileMealItem item={mockMealItem} onDelete={mockOnDelete} />)

    const expandButton = screen.getByRole('button', { name: /expand/i })
    fireEvent.click(expandButton)

    expect(screen.getByText('USDA Nutrition Database')).toBeInTheDocument()
  })

  it('handles meal item without full data', () => {
    const simpleItem = {
      ...mockMealItem,
      fullMeal: undefined,
    }

    render(<MobileMealItem item={simpleItem} onDelete={mockOnDelete} />)

    expect(screen.getByText('Grilled Chicken Salad')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /expand/i })).not.toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    const { container } = render(<MobileMealItem item={mockMealItem} onDelete={mockOnDelete} />)

    const card = container.querySelector('.bg-white.border-slate-200.shadow-sm')
    expect(card).toBeInTheDocument()
  })
})