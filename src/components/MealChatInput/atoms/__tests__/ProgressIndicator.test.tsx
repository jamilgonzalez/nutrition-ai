import { render, screen } from '@testing-library/react'
import { ProgressIndicator } from '../ProgressIndicator'

describe('ProgressIndicator', () => {
  it('renders progress bar with correct width', () => {
    render(<ProgressIndicator progress={50} />)

    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveStyle('width: 50%')
  })

  it('handles 0% progress', () => {
    render(<ProgressIndicator progress={0} />)

    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveStyle('width: 0%')
  })

  it('handles 100% progress', () => {
    render(<ProgressIndicator progress={100} />)

    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveStyle('width: 100%')
  })

  it('clamps progress values above 100%', () => {
    render(<ProgressIndicator progress={150} />)

    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveStyle('width: 100%')
  })

  it('clamps progress values below 0%', () => {
    render(<ProgressIndicator progress={-10} />)

    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveStyle('width: 0%')
  })

  it('has proper styling for progress bar', () => {
    render(<ProgressIndicator progress={50} />)

    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveClass(
      'h-full',
      'bg-gradient-to-r',
      'from-blue-500',
      'to-purple-600',
      'rounded-full',
      'transition-all',
      'duration-500',
      'ease-out'
    )
  })

  it('has proper styling for progress container', () => {
    render(<ProgressIndicator progress={50} />)

    const container = screen.getByTestId('progress-container') || 
                    document.querySelector('.w-full.bg-gray-200')
    expect(container).toHaveClass(
      'w-full',
      'bg-gray-200',
      'rounded-full',
      'h-2',
      'overflow-hidden'
    )
  })

  it('applies custom className', () => {
    const customClass = 'custom-progress-class'
    render(<ProgressIndicator progress={50} className={customClass} />)

    const container = screen.getByTestId('progress-container') || 
                    document.querySelector(`.${customClass}`)
    expect(container).toBeInTheDocument()
  })

  it('has smooth transition animation', () => {
    const { rerender } = render(<ProgressIndicator progress={25} />)

    let progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveStyle('width: 25%')
    expect(progressBar).toHaveClass('transition-all', 'duration-500', 'ease-out')

    rerender(<ProgressIndicator progress={75} />)

    progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveStyle('width: 75%')
  })

  it('handles decimal progress values', () => {
    render(<ProgressIndicator progress={33.33} />)

    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveStyle('width: 33.33%')
  })

  it('maintains gradient styling regardless of progress value', () => {
    const progressValues = [0, 25, 50, 75, 100]

    progressValues.forEach(progress => {
      const { rerender } = render(<ProgressIndicator progress={progress} />)

      const progressBar = screen.getByRole('progressbar', { hidden: true })
      expect(progressBar).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-purple-600')

      rerender(<div />) // Clean up between tests
    })
  })

  it('has proper accessibility attributes', () => {
    render(<ProgressIndicator progress={50} />)

    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toBeInTheDocument()
  })

  it('handles rapid progress changes smoothly', () => {
    const { rerender } = render(<ProgressIndicator progress={0} />)

    // Simulate rapid progress updates
    const progressValues = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

    progressValues.forEach(progress => {
      rerender(<ProgressIndicator progress={progress} />)
      
      const progressBar = screen.getByRole('progressbar', { hidden: true })
      expect(progressBar).toHaveStyle(`width: ${progress}%`)
      expect(progressBar).toHaveClass('transition-all', 'duration-500')
    })
  })
})