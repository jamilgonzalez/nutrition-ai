import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MobileNutritionTracker from './MobileNutritionTracker'
import { MobileNutritionData } from '@/utils/mealTransformation'

// Mock the child components
vi.mock('../molecules/MobileHeader', () => ({
  default: () => <div data-testid="mobile-header">Nutrition Tracker</div>,
}))

vi.mock('../molecules/MobileNutritionOverview', () => ({
  default: ({ caloriesConsumed, caloriesGoal }: { caloriesConsumed: number; caloriesGoal: number }) => (
    <div data-testid="nutrition-overview">
      <span>{caloriesConsumed}/{caloriesGoal} calories</span>
    </div>
  ),
}))

vi.mock('../molecules/MobileMacroGrid', () => ({
  default: ({ macros }: { macros: any }) => (
    <div data-testid="macro-grid">
      <span>Protein: {macros.protein.current}g</span>
      <span>Carbs: {macros.carbs.current}g</span>
      <span>Fat: {macros.fat.current}g</span>
    </div>
  ),
}))

vi.mock('../molecules/MobileMealItem', () => ({
  default: ({ item, onDelete }: { item: any; onDelete: () => void }) => (
    <div data-testid={`meal-item-${item.id}`}>
      <span>{item.name}</span>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
}))

describe('MobileNutritionTracker', () => {
  const mockOnDeleteMeal = vi.fn()
  
  const mockData: MobileNutritionData = {
    caloriesConsumed: 1200,
    caloriesGoal: 2000,
    caloriesRemaining: 800,
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
            name: 'Eggs Benedict',
            time: '08:00',
            calories: 400,
            protein: 20,
            carbs: 30,
            fat: 15,
            fullMeal: {} as any,
          },
          {
            id: '2',
            name: 'Orange Juice',
            time: '08:15',
            calories: 150,
            protein: 2,
            carbs: 35,
            fat: 0,
            fullMeal: {} as any,
          },
        ],
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nutrition tracker with all sections', () => {
    render(
      <MobileNutritionTracker
        caloriesConsumed={mockData.caloriesConsumed}
        caloriesGoal={mockData.caloriesGoal}
        caloriesRemaining={mockData.caloriesRemaining}
        macros={mockData.macros}
        meals={mockData.meals}
        onDeleteMeal={mockOnDeleteMeal}
      />
    )

    expect(screen.getByTestId('mobile-header')).toBeInTheDocument()
    expect(screen.getByTestId('nutrition-overview')).toBeInTheDocument()
    expect(screen.getByTestId('macro-grid')).toBeInTheDocument()
    expect(screen.getByText('1200/2000 calories')).toBeInTheDocument()
  })

  it('renders meal groups and items', () => {
    render(
      <MobileNutritionTracker
        caloriesConsumed={mockData.caloriesConsumed}
        caloriesGoal={mockData.caloriesGoal}
        caloriesRemaining={mockData.caloriesRemaining}
        macros={mockData.macros}
        meals={mockData.meals}
        onDeleteMeal={mockOnDeleteMeal}
      />
    )

    expect(screen.getByText('🍳 Breakfast')).toBeInTheDocument()
    expect(screen.getByText('2 items')).toBeInTheDocument()
    expect(screen.getByTestId('meal-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('meal-item-2')).toBeInTheDocument()
  })

  it('handles empty meals array', () => {
    render(
      <MobileNutritionTracker
        caloriesConsumed={0}
        caloriesGoal={2000}
        caloriesRemaining={2000}
        macros={mockData.macros}
        meals={[]}
        onDeleteMeal={mockOnDeleteMeal}
      />
    )

    expect(screen.getByText('No meals recorded yet')).toBeInTheDocument()
  })

  it('calls onDeleteMeal when delete button is clicked', () => {
    render(
      <MobileNutritionTracker
        caloriesConsumed={mockData.caloriesConsumed}
        caloriesGoal={mockData.caloriesGoal}
        caloriesRemaining={mockData.caloriesRemaining}
        macros={mockData.macros}
        meals={mockData.meals}
        onDeleteMeal={mockOnDeleteMeal}
      />
    )

    const deleteButton = screen.getAllByText('Delete')[0]
    fireEvent.click(deleteButton)
    
    expect(mockOnDeleteMeal).toHaveBeenCalledWith('1')
  })

  it('has proper styling classes', () => {
    const { container } = render(
      <MobileNutritionTracker
        caloriesConsumed={mockData.caloriesConsumed}
        caloriesGoal={mockData.caloriesGoal}
        caloriesRemaining={mockData.caloriesRemaining}
        macros={mockData.macros}
        meals={mockData.meals}
        onDeleteMeal={mockOnDeleteMeal}
      />
    )

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('flex', 'flex-col', 'flex-1', 'bg-slate-50', 'p-4', 'space-y-4')
  })
})