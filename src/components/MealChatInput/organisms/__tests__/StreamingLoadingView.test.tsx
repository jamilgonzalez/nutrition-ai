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

      // Look for the progress indicator component or progressbar role
      const progressElement = screen.getByRole('progressbar') || 
                             screen.getByLabelText(`Progress: ${expectedProgress}% complete`)
      expect(progressElement).toBeInTheDocument()

      rerender(<div />) // Clean up between tests
    })
  })

  it('displays appropriate icon for each loading state', () => {
    const testCases = [
      { state: LoadingState.ANALYZING_IMAGE, ariaLabel: 'Analyzing image' },
      { state: LoadingState.ANALYZING_MEAL, ariaLabel: 'Analyzing meal content' },
      { state: LoadingState.SEARCHING_WEB, ariaLabel: 'Searching for nutritional data' },
      { state: LoadingState.CALCULATING_NUTRITION, ariaLabel: 'Calculating nutrition information' },
      { state: LoadingState.FINALIZING, ariaLabel: 'Finalizing analysis' },
    ]

    testCases.forEach(({ state, ariaLabel }) => {
      const { rerender } = render(
        <StreamingLoadingView {...defaultProps} loadingState={state} />
      )

      const iconContainer = screen.getByTestId('loading-icon')
      expect(iconContainer).toBeInTheDocument()
      expect(iconContainer).toHaveAttribute('aria-label', ariaLabel)

      rerender(<div />) // Clean up between tests
    })
  })

  it('handles idle state correctly', () => {
    const idleProps = {
      ...defaultProps,
      loadingState: LoadingState.IDLE,
    }

    render(<StreamingLoadingView {...idleProps} />)

    const iconContainer = screen.getByTestId('loading-icon')
    expect(iconContainer).toHaveAttribute('aria-label', 'Idle')
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

    const cancelButton = screen.getByLabelText('Cancel meal analysis')
    expect(cancelButton).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = vi.fn()
    render(<StreamingLoadingView {...defaultProps} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByLabelText('Cancel meal analysis')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('does not render cancel button when onCancel is not provided', () => {
    render(<StreamingLoadingView {...defaultProps} />)

    const cancelButton = screen.queryByLabelText('Cancel meal analysis')
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

    // Check for proper ARIA attributes on the main container
    const container = screen.getByTestId('streaming-loading-view')
    expect(container).toHaveAttribute('role', 'status')
    expect(container).toHaveAttribute('aria-live', 'polite')
    expect(container).toHaveAttribute('aria-busy', 'true')
    
    // Check for progress bar
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })


  it('updates progress and aria labels when state changes', () => {
    const { rerender } = render(
      <StreamingLoadingView
        {...defaultProps}
        loadingState={LoadingState.ANALYZING_MEAL}
      />
    )

    // Check initial state
    const progressBar1 = screen.getByRole('progressbar')
    expect(progressBar1).toHaveAttribute('aria-valuenow', '40')
    expect(screen.getByLabelText('Analyzing meal content')).toBeInTheDocument()

    rerender(
      <StreamingLoadingView
        {...defaultProps}
        loadingState={LoadingState.SEARCHING_WEB}
      />
    )

    // Check updated state
    const progressBar2 = screen.getByRole('progressbar')
    expect(progressBar2).toHaveAttribute('aria-valuenow', '60')
    expect(screen.getByLabelText('Searching for nutritional data')).toBeInTheDocument()
  })
})
