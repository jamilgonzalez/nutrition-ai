import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RecordedMealsSection from './RecordedMealsSection'
import { RecordedMeal } from '@/lib/mealStorage'

// Mock the child components
vi.mock('../molecules/MealsHeader', () => ({
  default: ({ mealCount }: { mealCount: number }) => (
    <div data-testid="meals-header">
      <h4>Today's Meals</h4>
      <span>{mealCount} recorded</span>
    </div>
  ),
}))

vi.mock('./MealItem', () => ({
  default: ({
    meal,
    onEdit,
    onDelete,
  }: {
    meal: RecordedMeal
    onEdit: (id: string) => void
    onDelete: (id: string) => void
  }) => (
    <div data-testid={`meal-item-${meal.id}`}>
      <span>{meal.name}</span>
      <button onClick={() => onEdit(meal.id)}>Edit</button>
      <button onClick={() => onDelete(meal.id)}>Delete</button>
    </div>
  ),
}))

describe('RecordedMealsSection', () => {
  const mockOnEditMeal = vi.fn()
  const mockOnDeleteMeal = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when no meals are provided', () => {
    const { container } = render(
      <RecordedMealsSection
        meals={[]}
        onEditMeal={mockOnEditMeal}
        onDeleteMeal={mockOnDeleteMeal}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders meals header and meal items when meals are provided', () => {
    const mockMeals: RecordedMeal[] = [
      {
        id: '1',
        name: 'Breakfast Oatmeal',
        timestamp: new Date('2023-10-15T08:00:00Z'),
        notes: 'Delicious oatmeal with fruits',
        nutritionData: {
          calories: 350,
          protein: 12,
          carbs: 65,
          fat: 8,
        },
      },
      {
        id: '2',
        name: 'Lunch Salad',
        timestamp: new Date('2023-10-15T12:30:00Z'),
        notes: 'Fresh green salad',
        nutritionData: {
          calories: 280,
          protein: 15,
          carbs: 20,
          fat: 12,
        },
      },
    ]

    render(
      <RecordedMealsSection
        meals={mockMeals}
        onEditMeal={mockOnEditMeal}
        onDeleteMeal={mockOnDeleteMeal}
      />
    )

    // Check that meals header is rendered
    expect(screen.getByTestId('meals-header')).toBeInTheDocument()
    expect(screen.getByText("Today's Meals")).toBeInTheDocument()
    expect(screen.getByText('2 recorded')).toBeInTheDocument()

    // Check that meal items are rendered
    expect(screen.getByTestId('meal-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('meal-item-2')).toBeInTheDocument()
    expect(screen.getByText('Breakfast Oatmeal')).toBeInTheDocument()
    expect(screen.getByText('Lunch Salad')).toBeInTheDocument()
  })

  it('renders single meal correctly', () => {
    const mockMeal: RecordedMeal[] = [
      {
        id: '1',
        name: 'Single Meal',
        timestamp: new Date('2023-10-15T08:00:00Z'),
        notes: 'Just one meal',
        nutritionData: {
          calories: 400,
          protein: 20,
          carbs: 45,
          fat: 15,
        },
      },
    ]

    render(
      <RecordedMealsSection
        meals={mockMeal}
        onEditMeal={mockOnEditMeal}
        onDeleteMeal={mockOnDeleteMeal}
      />
    )

    expect(screen.getByText('1 recorded')).toBeInTheDocument()
    expect(screen.getByText('Single Meal')).toBeInTheDocument()
  })

  it('renders meals without nutrition data', () => {
    const mockMeal: RecordedMeal[] = [
      {
        id: '1',
        name: 'Meal Without Nutrition',
        timestamp: new Date('2023-10-15T08:00:00Z'),
        notes: 'No nutrition data',
      },
    ]

    render(
      <RecordedMealsSection
        meals={mockMeal}
        onEditMeal={mockOnEditMeal}
        onDeleteMeal={mockOnDeleteMeal}
      />
    )

    expect(screen.getByText('Meal Without Nutrition')).toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    const mockMeal: RecordedMeal[] = [
      {
        id: '1',
        name: 'Test Meal',
        timestamp: new Date(),
        notes: 'Test notes',
      },
    ]

    const { container } = render(
      <RecordedMealsSection
        meals={mockMeal}
        onEditMeal={mockOnEditMeal}
        onDeleteMeal={mockOnDeleteMeal}
      />
    )

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('pt-4', 'border-t')

    const mealsContainer = mainDiv.querySelector('.space-y-2')
    expect(mealsContainer).toBeInTheDocument()
  })
})
