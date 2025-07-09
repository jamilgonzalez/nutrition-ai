import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import MealActions from '../MealActions'
import { describe, it, expect, vi } from 'vitest'

/**
 * MealActions Component Tests
 * 
 * This component displays action buttons and timestamp for meal items,
 * including edit (commented out) and delete functionality.
 */
describe('MealActions', () => {
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const testTimestamp = new Date('2024-01-15T14:30:00Z')
  const user = userEvent.setup()

  beforeEach(() => {
    mockOnEdit.mockClear()
    mockOnDelete.mockClear()
  })

  describe('Basic Functionality', () => {
    it('renders formatted timestamp correctly', () => {
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={testTimestamp}
        />
      )

      // The time should be formatted in 12-hour format with AM/PM
      const timeElement = screen.getByText(/\d{1,2}:\d{2}\s?(AM|PM)/i)
      expect(timeElement).toBeInTheDocument()
      expect(timeElement).toHaveClass('text-xs', 'text-gray-500')
    })

    it('renders delete button', () => {
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={testTimestamp}
        />
      )

      const deleteButton = screen.getByRole('button')
      expect(deleteButton).toBeInTheDocument()
    })

    it('does not render edit button when commented out', () => {
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={testTimestamp}
        />
      )

      // Should only have one button (delete), not two (edit + delete)
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(1)
    })
  })

  describe('Button Interactions', () => {
    it('calls onDelete when delete button is clicked', async () => {
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={testTimestamp}
        />
      )

      const deleteButton = screen.getByRole('button')
      await user.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledTimes(1)
      expect(mockOnEdit).not.toHaveBeenCalled()
    })
  })

  describe('Time Formatting', () => {
    it('formats morning time correctly', () => {
      const morningTime = new Date('2024-01-15T09:15:00Z')
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={morningTime}
        />
      )

      const timeElement = screen.getByText(/\d{1,2}:\d{2}/i)
      expect(timeElement).toBeInTheDocument()
    })

    it('formats afternoon time correctly', () => {
      const afternoonTime = new Date('2024-01-15T15:45:00Z')
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={afternoonTime}
        />
      )

      const timeElement = screen.getByText(/\d{1,2}:\d{2}/i)
      expect(timeElement).toBeInTheDocument()
    })

    it('formats midnight correctly', () => {
      const midnightTime = new Date('2024-01-15T00:00:00Z')
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={midnightTime}
        />
      )

      const timeElement = screen.getByText(/\d{1,2}:\d{2}/i)
      expect(timeElement).toBeInTheDocument()
    })

    it('formats noon correctly', () => {
      const noonTime = new Date('2024-01-15T12:00:00Z')
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={noonTime}
        />
      )

      const timeElement = screen.getByText(/\d{1,2}:\d{2}/i)
      expect(timeElement).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('applies correct container styling', () => {
      const { container } = render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={testTimestamp}
        />
      )

      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('flex', 'items-center', 'gap-2')
    })

    it('applies correct timestamp styling', () => {
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={testTimestamp}
        />
      )

      const timeElement = screen.getByText(/\d{1,2}:\d{2}/i)
      expect(timeElement).toHaveClass('text-xs', 'text-gray-500')
    })
  })

  describe('Accessibility', () => {
    it('provides accessible button for delete action', () => {
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={testTimestamp}
        />
      )

      const deleteButton = screen.getByRole('button')
      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton.tagName).toBe('BUTTON')
    })

    it('maintains keyboard accessibility', async () => {
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={testTimestamp}
        />
      )

      const deleteButton = screen.getByRole('button')
      
      deleteButton.focus()
      expect(document.activeElement).toBe(deleteButton)

      await user.keyboard('{Enter}')
      expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge Cases', () => {
    it('handles various timestamp formats', () => {
      const timestamps = [
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-12-31T23:59:59Z'),
        new Date('2024-06-15T12:30:45Z')
      ]

      timestamps.forEach((timestamp, index) => {
        const { unmount } = render(
          <MealActions 
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            timestamp={timestamp}
          />
        )

        const timeElement = screen.getByText(/\d{1,2}:\d{2}/i)
        expect(timeElement).toBeInTheDocument()

        unmount()
      })
    })

    it('handles rapid button clicks appropriately', async () => {
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={testTimestamp}
        />
      )

      const deleteButton = screen.getByRole('button')
      
      await user.click(deleteButton)
      await user.click(deleteButton)
      await user.click(deleteButton)

      expect(mockOnDelete).toHaveBeenCalledTimes(3)
    })
  })

  describe('Component Integration', () => {
    it('works correctly with different timestamp objects', () => {
      const stringTimestamp = '2024-01-15T14:30:00Z'
      render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={new Date(stringTimestamp)}
        />
      )

      const timeElement = screen.getByText(/\d{1,2}:\d{2}/i)
      expect(timeElement).toBeInTheDocument()
    })

    it('maintains consistent behavior across re-renders', async () => {
      const { rerender } = render(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={testTimestamp}
        />
      )

      const deleteButton = screen.getByRole('button')
      await user.click(deleteButton)
      expect(mockOnDelete).toHaveBeenCalledTimes(1)

      // Re-render with same props
      rerender(
        <MealActions 
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          timestamp={testTimestamp}
        />
      )

      const newDeleteButton = screen.getByRole('button')
      await user.click(newDeleteButton)
      expect(mockOnDelete).toHaveBeenCalledTimes(2)
    })
  })
})