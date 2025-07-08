import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MobileNutritionTracker from './MobileNutritionTracker'

const mockMobileNutritionData = {
  caloriesConsumed: 1200,
  caloriesGoal: 2000,
  caloriesRemaining: 800,
  macros: {
    protein: { current: 80, goal: 150, unit: 'g' },
    carbs: { current: 150, goal: 200, unit: 'g' },
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
          name: 'Oatmeal',
          time: '08:00',
          calories: 300,
          protein: 10,
          carbs: 50,
          fat: 5,
        },
        {
          id: '2',
          name: 'Banana',
          time: '08:15',
          calories: 100,
          protein: 1,
          carbs: 25,
          fat: 0,
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
          name: 'Chicken Salad',
          time: '12:30',
          calories: 400,
          protein: 35,
          carbs: 20,
          fat: 15,
        },
      ],
    },
  ],
}

describe('MobileNutritionTracker', () => {
  it('renders nutrition overview correctly', () => {
    render(
      <MobileNutritionTracker
        {...mockMobileNutritionData}
        onDeleteMeal={vi.fn()}
      />
    )

    expect(screen.getByText('1200')).toBeInTheDocument()
    expect(screen.getByText('2000')).toBeInTheDocument()
    expect(screen.getByText('800')).toBeInTheDocument()
  })

  it('renders macro information correctly', () => {
    render(
      <MobileNutritionTracker
        {...mockMobileNutritionData}
        onDeleteMeal={vi.fn()}
      />
    )

    expect(screen.getByText('80')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
  })

  it('renders meal groups correctly', () => {
    render(
      <MobileNutritionTracker
        {...mockMobileNutritionData}
        onDeleteMeal={vi.fn()}
      />
    )

    expect(screen.getByText('🍳')).toBeInTheDocument()
    expect(screen.getByText('Breakfast')).toBeInTheDocument()
    expect(screen.getByText('2 items')).toBeInTheDocument()
    
    expect(screen.getByText('🍔')).toBeInTheDocument()
    expect(screen.getByText('Lunch')).toBeInTheDocument()
    expect(screen.getByText('1 item')).toBeInTheDocument()
  })

  it('expands meal details when clicked', () => {
    render(
      <MobileNutritionTracker
        {...mockMobileNutritionData}
        onDeleteMeal={vi.fn()}
      />
    )

    // Initially, meal details should not be visible
    expect(screen.queryByText('Oatmeal')).not.toBeInTheDocument()
    
    // Click on breakfast meal group
    fireEvent.click(screen.getByText('Breakfast'))
    
    // Now meal details should be visible
    expect(screen.getByText('Oatmeal')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
  })

  it('calls onDeleteMeal when delete button is clicked', () => {
    const mockOnDeleteMeal = vi.fn()
    render(
      <MobileNutritionTracker
        {...mockMobileNutritionData}
        onDeleteMeal={mockOnDeleteMeal}
      />
    )

    // Expand breakfast meal group
    fireEvent.click(screen.getByText('Breakfast'))
    
    // Find and click delete button for first meal
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])
    
    expect(mockOnDeleteMeal).toHaveBeenCalledWith('1')
  })

  it('handles empty meals array', () => {
    render(
      <MobileNutritionTracker
        caloriesConsumed={0}
        caloriesGoal={2000}
        caloriesRemaining={2000}
        macros={{
          protein: { current: 0, goal: 150, unit: 'g' },
          carbs: { current: 0, goal: 200, unit: 'g' },
          fat: { current: 0, goal: 70, unit: 'g' },
        }}
        meals={[]}
        onDeleteMeal={vi.fn()}
      />
    )

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('2000')).toBeInTheDocument()
  })

  it('handles meal group with single item correctly', () => {
    render(
      <MobileNutritionTracker
        {...mockMobileNutritionData}
        onDeleteMeal={vi.fn()}
      />
    )

    expect(screen.getByText('1 item')).toBeInTheDocument()
  })
})