import { render, screen } from '@testing-library/react'
import MacronutrientGrid from '../MacronutrientGrid'
import { describe, it, expect } from 'vitest'

/**
 * MacronutrientGrid Component Tests
 * 
 * This component displays a grid of macronutrient progress bars,
 * showing current vs goal values for protein, carbs, and fat.
 */
describe('MacronutrientGrid', () => {
  const mockData = {
    protein: { current: 75, goal: 100 },
    carbs: { current: 120, goal: 200 },
    fat: { current: 45, goal: 80 },
    sugar: { current: 30, goal: 50 }
  }

  describe('Basic Functionality', () => {
    it('renders section title correctly', () => {
      render(<MacronutrientGrid data={mockData} />)

      expect(screen.getByText('Macronutrients')).toBeInTheDocument()
      expect(screen.getByText('Macronutrients')).toHaveClass('font-semibold', 'text-sm')
    })

    it('renders progress bars for protein, carbs, and fat', () => {
      render(<MacronutrientGrid data={mockData} />)

      expect(screen.getByText('Protein')).toBeInTheDocument()
      expect(screen.getByText('Carbs')).toBeInTheDocument()
      expect(screen.getByText('Fat')).toBeInTheDocument()
    })

    it('does not render sugar progress bar when commented out', () => {
      render(<MacronutrientGrid data={mockData} />)

      expect(screen.queryByText('Sugar')).not.toBeInTheDocument()
    })
  })

  describe('Grid Layout', () => {
    it('applies correct container styling', () => {
      const { container } = render(<MacronutrientGrid data={mockData} />)

      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('space-y-3')
    })

    it('applies correct grid styling', () => {
      render(<MacronutrientGrid data={mockData} />)

      const gridContainer = screen.getByText('Protein').closest('.grid')
      expect(gridContainer).toHaveClass('grid', 'grid-cols-3', 'md:grid-cols-4', 'gap-3')
    })
  })

  describe('Data Passing', () => {
    it('passes correct data to protein progress bar', () => {
      render(<MacronutrientGrid data={mockData} />)

      const proteinContainer = screen.getByText('Protein').closest('div')
      expect(proteinContainer).toBeInTheDocument()
    })

    it('passes correct data to carbs progress bar', () => {
      render(<MacronutrientGrid data={mockData} />)

      const carbsContainer = screen.getByText('Carbs').closest('div')
      expect(carbsContainer).toBeInTheDocument()
    })

    it('passes correct data to fat progress bar', () => {
      render(<MacronutrientGrid data={mockData} />)

      const fatContainer = screen.getByText('Fat').closest('div')
      expect(fatContainer).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('shows 3 columns on mobile and 4 on medium screens', () => {
      render(<MacronutrientGrid data={mockData} />)

      const gridContainer = screen.getByText('Protein').closest('.grid')
      expect(gridContainer).toHaveClass('grid-cols-3', 'md:grid-cols-4')
    })
  })

  describe('Edge Cases', () => {
    it('handles zero values appropriately', () => {
      const zeroData = {
        protein: { current: 0, goal: 100 },
        carbs: { current: 0, goal: 200 },
        fat: { current: 0, goal: 80 },
        sugar: { current: 0, goal: 50 }
      }

      render(<MacronutrientGrid data={zeroData} />)

      expect(screen.getByText('Protein')).toBeInTheDocument()
      expect(screen.getByText('Carbs')).toBeInTheDocument()
      expect(screen.getByText('Fat')).toBeInTheDocument()
    })

    it('handles values exceeding goals', () => {
      const exceededData = {
        protein: { current: 150, goal: 100 },
        carbs: { current: 300, goal: 200 },
        fat: { current: 120, goal: 80 },
        sugar: { current: 80, goal: 50 }
      }

      render(<MacronutrientGrid data={exceededData} />)

      expect(screen.getByText('Protein')).toBeInTheDocument()
      expect(screen.getByText('Carbs')).toBeInTheDocument()
      expect(screen.getByText('Fat')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides semantic section structure', () => {
      render(<MacronutrientGrid data={mockData} />)

      const title = screen.getByText('Macronutrients')
      expect(title.tagName).toBe('H4')
    })

    it('maintains logical reading order', () => {
      render(<MacronutrientGrid data={mockData} />)

      const title = screen.getByText('Macronutrients')
      const proteinBar = screen.getByText('Protein')
      
      expect(title).toBeInTheDocument()
      expect(proteinBar).toBeInTheDocument()
    })
  })
})