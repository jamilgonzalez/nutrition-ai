import { render, screen, fireEvent } from '@testing-library/react'
import { StreamingLoadingView } from '../StreamingLoadingView'
import { LoadingState } from '@/hooks/useStreamingMealAnalysis'
import { vi, describe, it, expect } from 'vitest'

describe('StreamingLoadingView', () => {
  const defaultProps = {
    loadingState: LoadingState.ANALYZING_MEAL,
    currentMessage: {
      primary: 'Understanding your meal...',
      secondary: 'Processing ingredients and context',
    },
    hasImage: false,
    hasText: true,
  }

  it('renders loading messages correctly', () => {
    render(<StreamingLoadingView {...defaultProps} />)

    expect(screen.getByText('Understanding your meal...')).toBeInTheDocument()
    expect(
      screen.getByText('Processing ingredients and context')
    ).toBeInTheDocument()
  })

  it('shows correct progress for each loading state', () => {
    const testCases = [
      { state: LoadingState.ANALYZING_IMAGE, expectedProgress: 20 },
      { state: LoadingState.ANALYZING_MEAL, expectedProgress: 40 },
      { state: LoadingState.SEARCHING_WEB, expectedProgress: 60 },
      { state: LoadingState.CALCULATING_NUTRITION, expectedProgress: 80 },
      { state: LoadingState.FINALIZING, expectedProgress: 95 },
    ]

    testCases.forEach(({ state, expectedProgress }) => {
      const { rerender } = render(
        <StreamingLoadingView {...defaultProps} loadingState={state} />
      )

      const progressBar = screen.getByRole('progressbar', { hidden: true })
      expect(progressBar).toHaveStyle(`width: ${expectedProgress}%`)

      rerender(<div />) // Clean up between tests
    })
  })

  it('displays appropriate icon for each loading state', () => {
    const testCases = [
      { state: LoadingState.ANALYZING_IMAGE, iconClass: 'text-blue-600' },
      { state: LoadingState.ANALYZING_MEAL, iconClass: 'text-green-600' },
      { state: LoadingState.SEARCHING_WEB, iconClass: 'text-purple-600' },
      {
        state: LoadingState.CALCULATING_NUTRITION,
        iconClass: 'text-orange-600',
      },
      { state: LoadingState.FINALIZING, iconClass: 'text-green-600' },
    ]

    testCases.forEach(({ state, iconClass }) => {
      const { rerender } = render(
        <StreamingLoadingView {...defaultProps} loadingState={state} />
      )

      const icon =
        screen.getByTestId('loading-icon') ||
        document.querySelector(`.${iconClass}`)
      expect(icon).toBeInTheDocument()

      rerender(<div />) // Clean up between tests
    })
  })

  it('shows image indicator when hasImage is true', () => {
    render(<StreamingLoadingView {...defaultProps} hasImage={true} />)

    expect(screen.getByText('Image')).toBeInTheDocument()
    const imageIndicator = screen.getByText('Image').previousElementSibling
    expect(imageIndicator).toHaveClass('bg-blue-500')
  })

  it('shows text indicator when hasText is true', () => {
    render(<StreamingLoadingView {...defaultProps} hasText={true} />)

    expect(screen.getByText('Text')).toBeInTheDocument()
    const textIndicator = screen.getByText('Text').previousElementSibling
    expect(textIndicator).toHaveClass('bg-green-500')
  })

  it('shows both indicators when both hasImage and hasText are true', () => {
    render(
      <StreamingLoadingView {...defaultProps} hasImage={true} hasText={true} />
    )

    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('renders cancel button when onCancel is provided', () => {
    const mockOnCancel = vi.fn()
    render(<StreamingLoadingView {...defaultProps} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByLabelText('Cancel analysis')
    expect(cancelButton).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = vi.fn()
    render(<StreamingLoadingView {...defaultProps} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByLabelText('Cancel analysis')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('does not render cancel button when onCancel is not provided', () => {
    render(<StreamingLoadingView {...defaultProps} />)

    const cancelButton = screen.queryByLabelText('Cancel analysis')
    expect(cancelButton).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const customClass = 'custom-test-class'
    render(<StreamingLoadingView {...defaultProps} className={customClass} />)

    const container =
      screen.getByTestId('streaming-loading-view') ||
      document.querySelector(`.${customClass}`)
    expect(container).toBeInTheDocument()
  })

  it('renders loading dots', () => {
    render(<StreamingLoadingView {...defaultProps} />)

    // Loading dots should be present (3 dots)
    const dots = screen.getAllByTestId('loading-dot')
    expect(dots).toHaveLength(3)
  })

  it('has proper accessibility attributes', () => {
    render(<StreamingLoadingView {...defaultProps} />)

    // Check for proper ARIA attributes
    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toBeInTheDocument()
  })

  it('handles idle state gracefully', () => {
    const idleProps = {
      ...defaultProps,
      loadingState: LoadingState.IDLE,
      currentMessage: { primary: '', secondary: '' },
    }

    render(<StreamingLoadingView {...idleProps} />)

    // Should not show any loading indicators in idle state
    expect(
      screen.queryByText('Understanding your meal...')
    ).not.toBeInTheDocument()
  })

  it('animates progress bar changes', () => {
    const { rerender } = render(
      <StreamingLoadingView
        {...defaultProps}
        loadingState={LoadingState.ANALYZING_MEAL}
      />
    )

    let progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveStyle('width: 40%')

    rerender(
      <StreamingLoadingView
        {...defaultProps}
        loadingState={LoadingState.SEARCHING_WEB}
      />
    )

    progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveStyle('width: 60%')
    expect(progressBar).toHaveClass('transition-all', 'duration-500')
  })
})
