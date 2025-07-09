import { render, screen } from '@testing-library/react'
import MacroProgressBar from '../MacroProgressBar'
import { describe, it, expect, vi } from 'vitest'

// Mock the color helpers to have predictable behavior in tests
vi.mock('../../utils/colorHelpers', () => ({
  calculatePercentage: vi.fn((current: number, goal: number) => 
    Math.min((current / goal) * 100, 100)
  ),
  getGradientColor: vi.fn((percentage: number) => {
    const clampedPercentage = Math.min(percentage, 100)
    const hue = (1 - clampedPercentage / 100) * 240
    return `hsl(${hue}, 70%, 50%)`
  })
}))

/**
 * MacroProgressBar Component Tests
 * 
 * This component displays nutrition progress as a visual bar with current/goal values.
 * It shows the macro name, current vs goal values, and a progress bar with color coding.
 */
describe('MacroProgressBar', () => {
  const defaultProps = {
    current: 50,
    goal: 100,
    name: 'Protein'
  }

  describe('Content Display', () => {
    it('displays macro name prominently', () => {
      render(<MacroProgressBar {...defaultProps} />)

      const macroName = screen.getByText('Protein')
      expect(macroName).toBeInTheDocument()
      expect(macroName).toHaveClass('font-medium')
    })

    it('shows current and goal values with proper formatting', () => {
      render(<MacroProgressBar {...defaultProps} />)

      // Should display "50/100g" format
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('g', { exact: false })).toBeInTheDocument()
    })

    it('displays values in a readable format with separator', () => {
      render(<MacroProgressBar {...defaultProps} />)

      // Check that the slash separator is present
      const container = screen.getByText('50').closest('div')
      expect(container).toHaveTextContent('50/100g')
    })
  })

  describe('Progress Visualization', () => {
    it('renders a progress bar with correct structure', () => {
      const { container } = render(<MacroProgressBar {...defaultProps} />)

      // Find the progress bar by looking for the background element
      const progressBar = container.querySelector('.h-2')
      
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveClass('rounded-full', 'overflow-hidden')
      
      // Verify the progress fill is also present
      const progressFill = container.querySelector('.h-full')
      expect(progressFill).toBeInTheDocument()
    })

    it('displays progress fill based on current vs goal ratio', () => {
      render(<MacroProgressBar {...defaultProps} />)

      // The progress fill should be 50% width (50/100 * 100)
      const progressFill = document.querySelector('.h-full')
      expect(progressFill).toHaveStyle('width: 50%')
    })

    it('caps progress at 100% when current exceeds goal', () => {
      render(<MacroProgressBar current={150} goal={100} name="Protein" />)

      const progressFill = document.querySelector('.h-full')
      expect(progressFill).toHaveStyle('width: 100%')
    })

    it('shows zero progress when current is zero', () => {
      render(<MacroProgressBar current={0} goal={100} name="Protein" />)

      const progressFill = document.querySelector('.h-full')
      expect(progressFill).toHaveStyle('width: 0%')
    })
  })

  describe('Visual Transitions', () => {
    it('applies smooth transition classes to progress elements', () => {
      render(<MacroProgressBar {...defaultProps} />)

      // Check text transitions
      const currentValue = screen.getByText('50')
      const goalValue = screen.getByText('100')
      
      expect(currentValue.closest('div')).toHaveClass('transition-all', 'duration-500')
      expect(currentValue).toHaveClass('transition-all', 'duration-500')
      expect(goalValue).toHaveClass('transition-all', 'duration-300')

      // Check progress bar transition
      const progressFill = document.querySelector('.h-full')
      expect(progressFill).toHaveClass('transition-all', 'duration-700', 'ease-out')
    })
  })

  describe('Different Macro Types', () => {
    it('handles different macro names correctly', () => {
      const macros = ['Protein', 'Carbs', 'Fat', 'Fiber']
      
      macros.forEach(macro => {
        const { rerender } = render(
          <MacroProgressBar current={30} goal={100} name={macro} />
        )
        
        expect(screen.getByText(macro)).toBeInTheDocument()
        
        // Clean up for next iteration
        rerender(<div />)
      })
    })

    it('displays different value ranges appropriately', () => {
      const testCases = [
        { current: 0, goal: 50, name: 'Fiber' },
        { current: 25, goal: 300, name: 'Carbs' },
        { current: 80, goal: 120, name: 'Protein' }
      ]

      testCases.forEach(({ current, goal, name }) => {
        const { rerender } = render(
          <MacroProgressBar current={current} goal={goal} name={name} />
        )

        expect(screen.getByText(current.toString())).toBeInTheDocument()
        expect(screen.getByText(goal.toString())).toBeInTheDocument()

        // Clean up for next iteration
        rerender(<div />)
      })
    })
  })

  describe('Accessibility', () => {
    it('provides text content that screen readers can interpret', () => {
      render(<MacroProgressBar {...defaultProps} />)

      // The macro name should be clearly labeled
      const macroName = screen.getByText('Protein')
      expect(macroName).toBeInTheDocument()

      // Values should be readable as "50 out of 100 grams"
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('maintains proper text hierarchy with appropriate font weights', () => {
      render(<MacroProgressBar {...defaultProps} />)

      const macroName = screen.getByText('Protein')
      const valueText = screen.getByText('50').closest('div')

      expect(macroName).toHaveClass('font-medium')
      expect(valueText).toHaveClass('text-muted-foreground')
    })
  })

  describe('Edge Cases', () => {
    it('handles zero goal gracefully', () => {
      render(<MacroProgressBar current={0} goal={0} name="Test" />)

      expect(screen.getByText('Test')).toBeInTheDocument()
      // Since there are two "0" values (current and goal), use getAllByText
      const zeroValues = screen.getAllByText('0')
      expect(zeroValues).toHaveLength(2)
    })

    it('handles very large numbers appropriately', () => {
      render(<MacroProgressBar current={1500} goal={2000} name="Calories" />)

      expect(screen.getByText('1500')).toBeInTheDocument()
      expect(screen.getByText('2000')).toBeInTheDocument()
    })

    it('handles decimal values correctly', () => {
      render(<MacroProgressBar current={25.5} goal={50.0} name="Fat" />)

      expect(screen.getByText('25.5')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
    })
  })

  describe('Performance Considerations', () => {
    it('renders efficiently with minimal DOM structure', () => {
      const { container } = render(<MacroProgressBar {...defaultProps} />)

      // Should have clean, minimal DOM structure
      const rootElement = container.firstChild
      expect(rootElement).toHaveClass('space-y-1')
      
      // Should not have unnecessary wrapper elements
      const children = container.querySelectorAll('div')
      expect(children.length).toBeLessThan(10) // Reasonable upper bound
    })
  })
})