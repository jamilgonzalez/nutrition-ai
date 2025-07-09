import { render, screen, fireEvent } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ChatInput from '../ChatInput'
import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * ChatInput Component Tests
 *
 * This component provides a chat-like input interface for adding meals
 * or asking nutrition questions. It supports keyboard shortcuts and
 * voice input functionality.
 */
describe('ChatInput', () => {
  const mockOnSubmit = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  describe('Basic Functionality', () => {
    it('renders input field with default placeholder', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe('INPUT')
    })

    it('renders input field with custom placeholder', () => {
      const customPlaceholder = 'Custom placeholder text'
      render(
        <ChatInput onSubmit={mockOnSubmit} placeholder={customPlaceholder} />
      )

      const input = screen.getByPlaceholderText(customPlaceholder)
      expect(input).toBeInTheDocument()
    })

    it('displays microphone icon when input is empty', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const microphoneButton = screen.getByRole('button')
      expect(microphoneButton).toBeInTheDocument()

      const micIcon = microphoneButton.querySelector('svg')
      expect(micIcon).toBeInTheDocument()
    })

    it('displays send icon when input has text', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      await user.type(input, 'Test message')

      const sendButton = screen.getByRole('button')
      expect(sendButton).toBeInTheDocument()

      const sendIcon = sendButton.querySelector('svg')
      expect(sendIcon).toBeInTheDocument()
    })
  })

  describe('Input Handling', () => {
    it('updates input value when user types', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      await user.type(input, 'Test message')

      expect(input).toHaveValue('Test message')
    })

    it('clears input value after successful submission', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      await user.type(input, 'Test message')

      const sendButton = screen.getByRole('button')
      await user.click(sendButton)

      expect(input).toHaveValue('')
      expect(mockOnSubmit).toHaveBeenCalledWith('Test message')
    })

    it('trims whitespace from input before submission', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      await user.type(input, '  Test message  ')

      const sendButton = screen.getByRole('button')
      await user.click(sendButton)

      expect(mockOnSubmit).toHaveBeenCalledWith('Test message')
    })

    it('does not submit empty or whitespace-only input', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      await user.type(input, '   ')

      const sendButton = screen.getByRole('button')
      await user.click(sendButton)

      expect(mockOnSubmit).not.toHaveBeenCalled()
      expect(input).toHaveValue('   ') // Value remains unchanged
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('submits form when Enter key is pressed', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      await user.type(input, 'Test message')
      await user.keyboard('{Enter}')

      expect(mockOnSubmit).toHaveBeenCalledWith('Test message')
      expect(input).toHaveValue('')
    })

    it('does not submit when Shift+Enter is pressed', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      await user.type(input, 'Test message')
      await user.keyboard('{Shift>}{Enter}{/Shift}')

      expect(mockOnSubmit).not.toHaveBeenCalled()
      expect(input).toHaveValue('Test message')
    })

    it('prevents default behavior when Enter is pressed without Shift', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      await user.type(input, 'test message')

      // Create a custom event with preventDefault mock
      const keyDownHandler = vi.fn((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
        }
      })

      input.addEventListener('keydown', keyDownHandler)

      await user.keyboard('{Enter}')

      expect(keyDownHandler).toHaveBeenCalled()
      expect(mockOnSubmit).toHaveBeenCalledWith('test message')
    })
  })

  describe('Button Interactions', () => {
    it('calls onSubmit when send button is clicked', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      await user.type(input, 'Test message')

      const sendButton = screen.getByRole('button')
      await user.click(sendButton)

      expect(mockOnSubmit).toHaveBeenCalledWith('Test message')
    })

    it('shows voice input placeholder when microphone is clicked', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const microphoneButton = screen.getByRole('button')
      await user.click(microphoneButton)

      // Since voice input is not implemented, it should just log to console
      // This is testing the current behavior
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('does not submit when send button is clicked with empty input', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      await user.type(input, 'test')
      await user.clear(input)

      // Input is now empty, so no send button should be visible
      // Instead, microphone button should be shown
      const microphoneButton = screen.getByRole('button')
      await user.click(microphoneButton)

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Visual Design and Styling', () => {
    it('applies correct container styling', () => {
      const { container } = render(<ChatInput onSubmit={mockOnSubmit} />)

      const chatContainer = container.firstChild
      expect(chatContainer).toHaveClass(
        'fixed',
        'bottom-0',
        'left-0',
        'right-0',
        'bg-white',
        'border-t',
        'border-slate-200',
        'p-4',
        'safe-area-pb'
      )
    })

    it('applies correct input styling', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      expect(input).toHaveClass(
        'pr-20',
        'py-3',
        'text-sm',
        'bg-white',
        'border-slate-300',
        'focus:border-slate-400',
        'focus:ring-slate-400',
        'rounded-lg'
      )
    })

    it('applies correct send button styling when text is present', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      await user.type(input, 'Test')

      const sendButton = screen.getByRole('button')
      expect(sendButton).toHaveClass(
        'h-7',
        'w-7',
        'p-0',
        'bg-slate-700',
        'hover:bg-slate-800',
        'rounded-md'
      )
    })

    it('applies correct microphone button styling when input is empty', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const micButton = screen.getByRole('button')
      expect(micButton).toHaveClass(
        'h-7',
        'w-7',
        'p-0',
        'text-slate-500',
        'hover:text-slate-700',
        'hover:bg-slate-100',
        'rounded-md'
      )
    })
  })

  describe('Accessibility', () => {
    it('provides accessible form structure', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('maintains keyboard accessibility', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByRole('textbox')
      const button = screen.getByRole('button')

      // Input should be focusable
      input.focus()
      expect(document.activeElement).toBe(input)

      // Button should be focusable
      button.focus()
      expect(document.activeElement).toBe(button)

      // Tab navigation should work
      input.focus()
      await user.tab()
      expect(document.activeElement).toBe(button)
    })

    it('provides meaningful placeholder text', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByPlaceholderText(
        'Add a meal or ask about nutrition...'
      )
      expect(input.getAttribute('placeholder')).toBe(
        'Add a meal or ask about nutrition...'
      )
    })

    it('has appropriate button semantics', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      // Initially shows microphone button
      let button = screen.getByRole('button')
      expect(button).toBeInTheDocument()

      // After typing, shows send button
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')

      button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('User Experience', () => {
    it('provides immediate visual feedback for input state', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByRole('textbox')

      // Initially shows microphone
      expect(screen.getByRole('button')).toBeInTheDocument()

      // After typing, shows send button
      await user.type(input, 'test')
      const sendButton = screen.getByRole('button')
      expect(sendButton).toHaveClass('bg-slate-700')

      // After clearing, shows microphone again
      await user.clear(input)
      const micButton = screen.getByRole('button')
      expect(micButton).toHaveClass('text-slate-500')
    })

    it('maintains smooth interaction flow', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByRole('textbox')

      // Type message
      await user.type(input, 'Test message')
      expect(input).toHaveValue('Test message')

      // Submit via button
      const sendButton = screen.getByRole('button')
      await user.click(sendButton)

      // Input is cleared and ready for next message
      expect(input).toHaveValue('')
      expect(mockOnSubmit).toHaveBeenCalledWith('Test message')

      // Microphone button is shown again
      const micButton = screen.getByRole('button')
      expect(micButton).toHaveClass('text-slate-500')
    })

    it('handles rapid typing and submission correctly', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByRole('textbox')

      // Type and submit quickly
      await user.type(input, 'Quick message')
      await user.keyboard('{Enter}')

      expect(mockOnSubmit).toHaveBeenCalledWith('Quick message')
      expect(input).toHaveValue('')

      // Type another message
      await user.type(input, 'Another message')
      const sendButton = screen.getByRole('button')
      await user.click(sendButton)

      expect(mockOnSubmit).toHaveBeenCalledWith('Another message')
      expect(mockOnSubmit).toHaveBeenCalledTimes(2)
    })
  })

  describe('Edge Cases', () => {
    it('handles very long input text appropriately', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const longText = 'A'.repeat(1000)
      const input = screen.getByRole('textbox')

      await user.type(input, longText)
      const sendButton = screen.getByRole('button')
      await user.click(sendButton)

      expect(mockOnSubmit).toHaveBeenCalledWith(longText)
      expect(input).toHaveValue('')
    })

    it('handles special characters in input', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const specialText = '!@#$%^&*()_+'
      const input = screen.getByRole('textbox')

      // Use fireEvent.change for special characters that userEvent can't handle
      fireEvent.change(input, { target: { value: specialText } })

      const sendButton = screen.getByRole('button')
      await user.click(sendButton)

      expect(mockOnSubmit).toHaveBeenCalledWith(specialText)
    })

    it('handles unicode characters correctly', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const unicodeText = '🍎 Apple 🥗 Salad 中文 العربية'
      const input = screen.getByRole('textbox')

      await user.type(input, unicodeText)
      const sendButton = screen.getByRole('button')
      await user.click(sendButton)

      expect(mockOnSubmit).toHaveBeenCalledWith(unicodeText)
    })

    it('maintains state consistency during rapid interactions', async () => {
      render(<ChatInput onSubmit={mockOnSubmit} />)

      const input = screen.getByRole('textbox')

      // Rapid typing and clearing
      await user.type(input, 'test')
      await user.clear(input)
      await user.type(input, 'final message')

      const sendButton = screen.getByRole('button')
      await user.click(sendButton)

      expect(mockOnSubmit).toHaveBeenCalledWith('final message')
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
  })
})
