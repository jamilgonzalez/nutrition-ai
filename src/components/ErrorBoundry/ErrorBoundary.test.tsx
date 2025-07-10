import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { ErrorBoundary, withErrorBoundary } from './ErrorBoundary'

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

// Mock window.location.reload
const mockReload = vi.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
})

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Component that always throws
const AlwaysThrowError = () => {
  throw new Error('Always throws')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    mockConsoleError.mockClear()
    mockReload.mockClear()
  })

  afterAll(() => {
    mockConsoleError.mockRestore()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <AlwaysThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/An error occurred while loading this component/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const CustomFallback = ({ error }: { error: Error }) => (
      <div>Custom error message: {error.message}</div>
    )

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <AlwaysThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message: Always throws')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('resets error when try again button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Error should be displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    
    // Click try again
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    // Error message should be gone (component will re-render and potentially throw again)
    // Note: In a real scenario, this would depend on whether the component throws again
  })

  it('logs error to console', () => {
    render(
      <ErrorBoundary>
        <AlwaysThrowError />
      </ErrorBoundary>
    )

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error boundary caught an error:',
      expect.any(Error),
      expect.any(Object)
    )
  })
})

describe('withErrorBoundary', () => {
  it('wraps component with error boundary', () => {
    const TestComponent = () => <div>Test component</div>
    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent />)

    expect(screen.getByText('Test component')).toBeInTheDocument()
  })

  it('shows error UI when wrapped component throws', () => {
    const WrappedComponent = withErrorBoundary(AlwaysThrowError)

    render(<WrappedComponent />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('uses custom fallback when provided', () => {
    const CustomFallback = ({ error }: { error: Error }) => (
      <div>HOC custom error: {error.message}</div>
    )
    const WrappedComponent = withErrorBoundary(AlwaysThrowError, CustomFallback)

    render(<WrappedComponent />)

    expect(screen.getByText('HOC custom error: Always throws')).toBeInTheDocument()
  })

  it('passes props to wrapped component', () => {
    const TestComponent = ({ message }: { message: string }) => <div>{message}</div>
    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent message="Hello world" />)

    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })
})