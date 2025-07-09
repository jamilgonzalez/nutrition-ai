import { render, screen } from '@testing-library/react'
import { LoadingMessage } from '../LoadingMessage'

describe('LoadingMessage', () => {
  const defaultProps = {
    primary: 'Primary message',
    secondary: 'Secondary message'
  }

  it('renders primary message', () => {
    render(<LoadingMessage {...defaultProps} />)

    expect(screen.getByText('Primary message')).toBeInTheDocument()
  })

  it('renders secondary message', () => {
    render(<LoadingMessage {...defaultProps} />)

    expect(screen.getByText('Secondary message')).toBeInTheDocument()
  })

  it('applies correct styling to primary message', () => {
    render(<LoadingMessage {...defaultProps} />)

    const primaryMessage = screen.getByText('Primary message')
    expect(primaryMessage).toHaveClass('text-base', 'font-medium', 'text-gray-900', 'animate-fade-in')
  })

  it('applies correct styling to secondary message', () => {
    render(<LoadingMessage {...defaultProps} />)

    const secondaryMessage = screen.getByText('Secondary message')
    expect(secondaryMessage).toHaveClass('text-sm', 'text-gray-500', 'animate-fade-in')
  })

  it('applies animation delay to secondary message', () => {
    render(<LoadingMessage {...defaultProps} />)

    const secondaryMessage = screen.getByText('Secondary message')
    expect(secondaryMessage).toHaveStyle('animation-delay: 0.2s')
  })

  it('applies custom className', () => {
    const customClass = 'custom-message-class'
    render(<LoadingMessage {...defaultProps} className={customClass} />)

    const container = screen.getByTestId('loading-message-container') || 
                    document.querySelector(`.${customClass}`)
    expect(container).toBeInTheDocument()
  })

  it('handles empty messages gracefully', () => {
    render(<LoadingMessage primary="" secondary="" />)

    // Should render empty divs without crashing
    const container = screen.getByTestId('loading-message-container') || 
                    document.querySelector('div')
    expect(container).toBeInTheDocument()
  })

  it('handles long messages without breaking layout', () => {
    const longPrimary = 'This is a very long primary message that should wrap properly without breaking the layout'
    const longSecondary = 'This is a very long secondary message that should also wrap properly'

    render(<LoadingMessage primary={longPrimary} secondary={longSecondary} />)

    expect(screen.getByText(longPrimary)).toBeInTheDocument()
    expect(screen.getByText(longSecondary)).toBeInTheDocument()
  })

  it('maintains proper hierarchy between primary and secondary messages', () => {
    render(<LoadingMessage {...defaultProps} />)

    const primaryMessage = screen.getByText('Primary message')
    const secondaryMessage = screen.getByText('Secondary message')

    // Primary should be larger and more prominent
    expect(primaryMessage).toHaveClass('text-base', 'font-medium')
    expect(secondaryMessage).toHaveClass('text-sm')
  })

  it('has proper color contrast', () => {
    render(<LoadingMessage {...defaultProps} />)

    const primaryMessage = screen.getByText('Primary message')
    const secondaryMessage = screen.getByText('Secondary message')

    // Primary should be darker (more prominent)
    expect(primaryMessage).toHaveClass('text-gray-900')
    expect(secondaryMessage).toHaveClass('text-gray-500')
  })
})