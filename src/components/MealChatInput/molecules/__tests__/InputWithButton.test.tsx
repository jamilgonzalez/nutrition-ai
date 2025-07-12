import { render, screen, fireEvent } from '@testing-library/react'
import { InputWithButton } from '../InputWithButton'
import { describe, it, beforeEach, expect, vi } from 'vitest'

// Mock HTMLFormElement.prototype.requestSubmit for JSDOM
Object.defineProperty(HTMLFormElement.prototype, 'requestSubmit', {
  value: function(this: HTMLFormElement) {
    this.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  },
  writable: true,
  configurable: true,
})

describe('InputWithButton', () => {
  const mockOnChange = vi.fn()
  const mockOnSubmit = vi.fn()
  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    placeholder: 'Enter your message...',
    onSubmit: mockOnSubmit,
    hasContent: false,
  }

  beforeEach(() => {
    mockOnChange.mockClear()
    mockOnSubmit.mockClear()
  })

  it('renders input with correct placeholder', () => {
    render(<InputWithButton {...defaultProps} />)

    const input = screen.getByPlaceholderText('Enter your message...')
    expect(input).toBeInTheDocument()
  })

  it('displays current value in input', () => {
    render(<InputWithButton {...defaultProps} value="test message" />)

    const input = screen.getByDisplayValue('test message')
    expect(input).toBeInTheDocument()
  })

  it('calls onChange when input value changes', () => {
    render(<InputWithButton {...defaultProps} />)

    const input = screen.getByPlaceholderText('Enter your message...')
    fireEvent.change(input, { target: { value: 'new text' } })

    expect(mockOnChange).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit when form is submitted', () => {
    render(<InputWithButton {...defaultProps} hasContent={true} />)

    const form = screen.getByRole('button').closest('form')
    fireEvent.submit(form!)

    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit when submit button is clicked', () => {
    render(<InputWithButton {...defaultProps} hasContent={true} />)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalledTimes(1)
  })

  it('disables submit button when hasContent is false', () => {
    render(<InputWithButton {...defaultProps} hasContent={false} />)

    const submitButton = screen.getByRole('button')
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when hasContent is true', () => {
    render(<InputWithButton {...defaultProps} hasContent={true} />)

    const submitButton = screen.getByRole('button')
    expect(submitButton).not.toBeDisabled()
  })

  it('disables both input and button when disabled prop is true', () => {
    render(
      <InputWithButton {...defaultProps} disabled={true} hasContent={true} />
    )

    const input = screen.getByPlaceholderText('Enter your message...')
    const submitButton = screen.getByRole('button')

    expect(input).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })
})
