import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { InputToolbar } from '../InputToolbar'

// Mock the MealHistoryButton component
vi.mock('../../molecules/MealHistoryButton', () => ({
  MealHistoryButton: ({ onMealAdded, user, isOpen, onOpenChange }: { 
    onMealAdded: (meal: any) => void; 
    user?: any;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <button
      onClick={() => onMealAdded({ id: 'test-meal', name: 'Test Meal' })}
      data-testid="meal-history-button"
    >
      History
    </button>
  )
}))

describe('InputToolbar', () => {
  const mockProps = {
    onCameraClick: vi.fn(),
    onImageClick: vi.fn(),
    onVoiceToggle: vi.fn(),
    onMealFromHistoryAdded: vi.fn(),
    disabled: false,
    speechSupported: true,
    isRecording: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders all toolbar buttons', () => {
      render(<InputToolbar {...mockProps} />)
      
      expect(screen.getByTestId('meal-history-button')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /take photo with camera/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /upload image from gallery/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /open meal history/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start voice recording/i })).toBeInTheDocument()
    })

    it('renders camera, image, and history buttons on the left side', () => {
      render(<InputToolbar {...mockProps} />)
      
      const leftSection = screen.getByRole('button', { name: /take photo with camera/i }).parentElement
      expect(leftSection).toHaveClass('gap-2')
      expect(screen.getByRole('button', { name: /open meal history/i })).toBeInTheDocument()
      expect(screen.getByTestId('meal-history-button')).toBeInTheDocument()
    })

    it('renders voice button on the right when speech is supported', () => {
      render(<InputToolbar {...mockProps} speechSupported={true} />)
      
      expect(screen.getByRole('button', { name: /start voice recording/i })).toBeInTheDocument()
    })

    it('does not render voice button when speech is not supported', () => {
      render(<InputToolbar {...mockProps} speechSupported={false} />)
      
      expect(screen.queryByRole('button', { name: /voice recording/i })).not.toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    it('calls onCameraClick when camera button is clicked', async () => {
      const user = userEvent.setup()
      render(<InputToolbar {...mockProps} />)
      
      await user.click(screen.getByRole('button', { name: /take photo with camera/i }))
      
      expect(mockProps.onCameraClick).toHaveBeenCalledTimes(1)
    })

    it('calls onImageClick when image button is clicked', async () => {
      const user = userEvent.setup()
      render(<InputToolbar {...mockProps} />)
      
      await user.click(screen.getByRole('button', { name: /upload image from gallery/i }))
      
      expect(mockProps.onImageClick).toHaveBeenCalledTimes(1)
    })

    it('calls onVoiceToggle when microphone button is clicked', async () => {
      const user = userEvent.setup()
      render(<InputToolbar {...mockProps} />)
      
      await user.click(screen.getByRole('button', { name: /start voice recording/i }))
      
      expect(mockProps.onVoiceToggle).toHaveBeenCalledTimes(1)
    })

    it('calls onMealFromHistoryAdded when meal history button is used', async () => {
      const user = userEvent.setup()
      render(<InputToolbar {...mockProps} />)
      
      await user.click(screen.getByTestId('meal-history-button'))
      
      expect(mockProps.onMealFromHistoryAdded).toHaveBeenCalledWith({
        id: 'test-meal',
        name: 'Test Meal'
      })
    })
  })

  describe('Button States', () => {
    it('disables camera, image, and history buttons when disabled prop is true', () => {
      render(<InputToolbar {...mockProps} disabled={true} />)
      
      expect(screen.getByRole('button', { name: /take photo with camera/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /upload image from gallery/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /open meal history/i })).toBeDisabled()
    })

    it('shows microphone off icon when recording', () => {
      render(<InputToolbar {...mockProps} isRecording={true} />)
      
      const micButton = screen.getByRole('button', { name: /stop voice recording/i })
      expect(micButton).toHaveClass('bg-red-100', 'text-red-600')
    })

    it('shows regular microphone icon when not recording', () => {
      render(<InputToolbar {...mockProps} isRecording={false} />)
      
      const micButton = screen.getByRole('button', { name: /start voice recording/i })
      expect(micButton).not.toHaveClass('bg-red-100', 'text-red-600')
    })

    it('disables voice button when disabled prop is true', () => {
      render(<InputToolbar {...mockProps} disabled={true} />)
      
      expect(screen.getByRole('button', { name: /start voice recording/i })).toBeDisabled()
    })
  })

  describe('Layout and Accessibility', () => {
    it('maintains proper layout structure with flexbox', () => {
      render(<InputToolbar {...mockProps} />)
      
      const container = screen.getByRole('button', { name: /take photo with camera/i }).closest('div')?.parentElement
      expect(container).toHaveClass('flex', 'items-center', 'justify-between')
    })

    it('groups related buttons together', () => {
      render(<InputToolbar {...mockProps} />)
      
      const leftGroup = screen.getByRole('button', { name: /take photo with camera/i }).parentElement
      expect(leftGroup).toHaveClass('flex', 'items-center', 'gap-2')
      
      // Verify camera, image, history toolbar button, and meal history button are in the same group
      expect(leftGroup).toContainElement(screen.getByRole('button', { name: /take photo with camera/i }))
      expect(leftGroup).toContainElement(screen.getByRole('button', { name: /upload image from gallery/i }))
      expect(leftGroup).toContainElement(screen.getByRole('button', { name: /open meal history/i }))
      expect(leftGroup).toContainElement(screen.getByTestId('meal-history-button'))
    })

    it('provides proper focus management', async () => {
      const user = userEvent.setup()
      render(<InputToolbar {...mockProps} />)
      
      // Test tab navigation
      await user.tab()
      expect(screen.getByRole('button', { name: /take photo with camera/i })).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /upload image from gallery/i })).toHaveFocus()
      
      await user.tab()
      expect(screen.getByRole('button', { name: /open meal history/i })).toHaveFocus()
      
      await user.tab()
      expect(screen.getByTestId('meal-history-button')).toHaveFocus()
    })
  })

  describe('Integration with MealHistoryButton', () => {
    it('passes onMealAdded callback to MealHistoryButton correctly', () => {
      render(<InputToolbar {...mockProps} />)
      
      expect(screen.getByTestId('meal-history-button')).toBeInTheDocument()
    })

    it('integrates meal history button with existing toolbar layout', () => {
      render(<InputToolbar {...mockProps} />)
      
      // Verify the meal history button is positioned with other action buttons
      const leftGroup = screen.getByRole('button', { name: /camera/i }).parentElement
      expect(leftGroup?.children).toHaveLength(4) // camera, image, history toolbar button, meal history button
    })
  })
})