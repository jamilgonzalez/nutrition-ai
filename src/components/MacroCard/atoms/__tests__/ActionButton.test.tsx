import { render, screen, fireEvent } from '@testing-library/react'
import { Edit, Trash2 } from 'lucide-react'
import ActionButton from '../ActionButton'
import { describe, it, expect, vi } from 'vitest'

/**
 * ActionButton Component Tests
 * 
 * This component provides interactive action buttons for meal items.
 * It supports two variants: 'edit' and 'delete', each with distinct styling.
 */
describe('ActionButton', () => {
  const mockOnClick = vi.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  describe('Basic Functionality', () => {
    it('renders button with provided icon', () => {
      render(<ActionButton icon={Edit} onClick={mockOnClick} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      
      // The Edit icon should be rendered within the button
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('calls onClick handler when button is clicked', () => {
      render(<ActionButton icon={Edit} onClick={mockOnClick} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Variant Styling', () => {
    it('applies default edit styling when no variant is specified', () => {
      render(<ActionButton icon={Edit} onClick={mockOnClick} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:text-gray-600')
    })

    it('applies edit styling when variant is explicitly set to edit', () => {
      render(<ActionButton icon={Edit} onClick={mockOnClick} variant="edit" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:text-gray-600')
    })

    it('applies delete styling when variant is set to delete', () => {
      render(<ActionButton icon={Trash2} onClick={mockOnClick} variant="delete" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:text-red-600')
    })
  })

  describe('Accessibility', () => {
    it('renders as accessible button element', () => {
      render(<ActionButton icon={Edit} onClick={mockOnClick} />)

      const button = screen.getByRole('button')
      expect(button.tagName).toBe('BUTTON')
    })

    it('is keyboard accessible', () => {
      render(<ActionButton icon={Edit} onClick={mockOnClick} />)

      const button = screen.getByRole('button')
      
      // Test that the button is focusable and has the correct structure
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
      expect(button.tabIndex).not.toBe(-1)
      
      // Test that it's keyboard navigable
      button.focus()
      expect(document.activeElement).toBe(button)
    })
  })

  describe('Visual Consistency', () => {
    it('maintains consistent button size and styling', () => {
      render(<ActionButton icon={Edit} onClick={mockOnClick} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-6', 'w-6', 'p-0', 'text-gray-400')
    })

    it('applies ghost variant styling for minimal visual impact', () => {
      render(<ActionButton icon={Edit} onClick={mockOnClick} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-gray-400')
    })
  })

  describe('Icon Integration', () => {
    it('renders different icons correctly', () => {
      const { rerender } = render(<ActionButton icon={Edit} onClick={mockOnClick} />)
      
      let button = screen.getByRole('button')
      let svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()

      // Re-render with different icon
      rerender(<ActionButton icon={Trash2} onClick={mockOnClick} />)
      
      button = screen.getByRole('button')
      svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('applies correct icon sizing', () => {
      render(<ActionButton icon={Edit} onClick={mockOnClick} />)

      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toHaveClass('w-3', 'h-3')
    })
  })

  describe('User Experience', () => {
    it('provides immediate visual feedback on interaction', () => {
      render(<ActionButton icon={Edit} onClick={mockOnClick} />)

      const button = screen.getByRole('button')
      // Button should have hover states defined
      expect(button).toHaveClass('hover:text-gray-600')
    })

    it('maintains consistent behavior across different variants', () => {
      const { rerender } = render(
        <ActionButton icon={Edit} onClick={mockOnClick} variant="edit" />
      )

      let button = screen.getByRole('button')
      fireEvent.click(button)
      expect(mockOnClick).toHaveBeenCalledTimes(1)

      mockOnClick.mockClear()

      rerender(
        <ActionButton icon={Trash2} onClick={mockOnClick} variant="delete" />
      )

      button = screen.getByRole('button')
      fireEvent.click(button)
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })
})