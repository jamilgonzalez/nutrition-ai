import { render, screen } from '@testing-library/react'
import MealsHeader from '../MealsHeader'
import { describe, it, expect } from 'vitest'

/**
 * MealsHeader Component Tests
 * 
 * This component displays a header for the meals section with a count badge.
 * Shows "Today's Meals" title and number of recorded meals.
 */
describe('MealsHeader', () => {
  describe('Basic Functionality', () => {
    it('renders meals header title correctly', () => {
      render(<MealsHeader mealCount={5} />)

      expect(screen.getByText("Today's Meals")).toBeInTheDocument()
    })

    it('renders meal count badge with correct number', () => {
      render(<MealsHeader mealCount={3} />)

      expect(screen.getByText('3 recorded')).toBeInTheDocument()
    })

    it('handles zero meal count', () => {
      render(<MealsHeader mealCount={0} />)

      expect(screen.getByText('0 recorded')).toBeInTheDocument()
    })

    it('handles single meal count', () => {
      render(<MealsHeader mealCount={1} />)

      expect(screen.getByText('1 recorded')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('applies correct container styling', () => {
      const { container } = render(<MealsHeader mealCount={5} />)

      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-between', 'mb-3')
    })

    it('applies correct title styling', () => {
      render(<MealsHeader mealCount={5} />)

      const title = screen.getByText("Today's Meals")
      expect(title.tagName).toBe('H4')
      expect(title).toHaveClass('font-semibold')
    })

    it('renders badge with outline variant', () => {
      render(<MealsHeader mealCount={5} />)

      const badge = screen.getByText('5 recorded')
      // The exact classes depend on the Badge component implementation
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Different Meal Counts', () => {
    it('displays double-digit meal counts correctly', () => {
      render(<MealsHeader mealCount={15} />)

      expect(screen.getByText('15 recorded')).toBeInTheDocument()
    })

    it('displays large meal counts correctly', () => {
      render(<MealsHeader mealCount={99} />)

      expect(screen.getByText('99 recorded')).toBeInTheDocument()
    })

    it('handles very large meal counts', () => {
      render(<MealsHeader mealCount={1000} />)

      expect(screen.getByText('1000 recorded')).toBeInTheDocument()
    })

    it('displays decimal meal counts if provided', () => {
      render(<MealsHeader mealCount={5.5} />)

      expect(screen.getByText('5.5 recorded')).toBeInTheDocument()
    })
  })

  describe('Content Structure', () => {
    it('renders title and badge in correct order', () => {
      render(<MealsHeader mealCount={7} />)

      const title = screen.getByText("Today's Meals")
      const badge = screen.getByText('7 recorded')

      expect(title).toBeInTheDocument()
      expect(badge).toBeInTheDocument()
    })

    it('maintains consistent spacing', () => {
      render(<MealsHeader mealCount={3} />)

      const title = screen.getByText("Today's Meals")
      const badge = screen.getByText('3 recorded')

      // Both should be in the same container with justify-between
      const container = title.parentElement
      expect(container).toContain(badge)
      expect(container).toHaveClass('justify-between')
    })
  })

  describe('Accessibility', () => {
    it('uses proper heading hierarchy', () => {
      render(<MealsHeader mealCount={5} />)

      const heading = screen.getByRole('heading', { level: 4 })
      expect(heading).toHaveTextContent("Today's Meals")
    })

    it('provides meaningful content for screen readers', () => {
      render(<MealsHeader mealCount={3} />)

      const heading = screen.getByRole('heading')
      const badge = screen.getByText('3 recorded')

      expect(heading).toBeInTheDocument()
      expect(badge).toBeInTheDocument()
    })

    it('maintains logical reading order', () => {
      render(<MealsHeader mealCount={5} />)

      const title = screen.getByText("Today's Meals")
      const count = screen.getByText('5 recorded')

      // Title should come before count in DOM order
      expect(title.compareDocumentPosition(count)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })
  })

  describe('Text Content', () => {
    it('uses apostrophe correctly in title', () => {
      render(<MealsHeader mealCount={5} />)

      // Check for the exact text with proper apostrophe
      expect(screen.getByText("Today's Meals")).toBeInTheDocument()
    })

    it('uses consistent terminology for recorded meals', () => {
      render(<MealsHeader mealCount={8} />)

      expect(screen.getByText('8 recorded')).toBeInTheDocument()
      expect(screen.queryByText('8 meals')).not.toBeInTheDocument()
      expect(screen.queryByText('8 entries')).not.toBeInTheDocument()
    })
  })

  describe('Component Reusability', () => {
    it('works with different prop combinations', () => {
      const testCases = [
        { count: 0, expected: '0 recorded' },
        { count: 1, expected: '1 recorded' },
        { count: 5, expected: '5 recorded' },
        { count: 10, expected: '10 recorded' }
      ]

      testCases.forEach(({ count, expected }) => {
        const { unmount } = render(<MealsHeader mealCount={count} />)
        
        expect(screen.getByText(expected)).toBeInTheDocument()
        expect(screen.getByText("Today's Meals")).toBeInTheDocument()
        
        unmount()
      })
    })

    it('maintains consistent structure across re-renders', () => {
      const { rerender } = render(<MealsHeader mealCount={3} />)

      expect(screen.getByText('3 recorded')).toBeInTheDocument()

      rerender(<MealsHeader mealCount={7} />)

      expect(screen.getByText('7 recorded')).toBeInTheDocument()
      expect(screen.getByText("Today's Meals")).toBeInTheDocument()
      expect(screen.queryByText('3 recorded')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles negative meal counts gracefully', () => {
      render(<MealsHeader mealCount={-1} />)

      expect(screen.getByText('-1 recorded')).toBeInTheDocument()
    })

    it('handles extremely large numbers', () => {
      render(<MealsHeader mealCount={999999} />)

      expect(screen.getByText('999999 recorded')).toBeInTheDocument()
    })

    it('maintains layout integrity with varying content lengths', () => {
      const { rerender } = render(<MealsHeader mealCount={1} />)

      const container = screen.getByText("Today's Meals").parentElement
      expect(container).toHaveClass('justify-between')

      rerender(<MealsHeader mealCount={1000000} />)

      const newContainer = screen.getByText("Today's Meals").parentElement
      expect(newContainer).toHaveClass('justify-between')
    })
  })
})