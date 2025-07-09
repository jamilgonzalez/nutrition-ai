import { render, screen } from '@testing-library/react'
import { LoadingIndicators } from '../LoadingIndicators'
import { describe, it, expect } from 'vitest'

describe('LoadingIndicators', () => {
  it('renders nothing when neither isLoading nor showSaveSuccess is true', () => {
    const { container } = render(<LoadingIndicators />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when both props are false', () => {
    const { container } = render(
      <LoadingIndicators isLoading={false} showSaveSuccess={false} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders loading state when isLoading is true', () => {
    render(<LoadingIndicators isLoading={true} />)

    expect(screen.getByText('Saving nutrition data...')).toBeInTheDocument()

    const loader =
      screen.getByTestId('loader-icon') ||
      document.querySelector('.animate-spin')
    expect(loader).toBeInTheDocument()
  })

  it('renders success state when showSaveSuccess is true and isLoading is false', () => {
    render(<LoadingIndicators isLoading={false} showSaveSuccess={true} />)

    expect(screen.getByText('Meal saved successfully!')).toBeInTheDocument()

    const successIcon =
      screen.getByTestId('success-icon') ||
      document.querySelector('.text-green-600')
    expect(successIcon).toBeInTheDocument()
  })

  it('prioritizes loading state when both isLoading and showSaveSuccess are true', () => {
    render(<LoadingIndicators isLoading={true} showSaveSuccess={true} />)

    expect(screen.getByText('Saving nutrition data...')).toBeInTheDocument()
    expect(
      screen.queryByText('Meal saved successfully!')
    ).not.toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    render(<LoadingIndicators isLoading={true} />)

    const container = screen
      .getByText('Saving nutrition data...')
      .closest('div')
    expect(container).toHaveClass(
      'mb-3',
      'flex',
      'items-center',
      'justify-center',
      'gap-2',
      'text-sm'
    )
  })
})
