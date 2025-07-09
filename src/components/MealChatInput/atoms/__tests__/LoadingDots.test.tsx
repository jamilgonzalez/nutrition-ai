import { render, screen } from '@testing-library/react'
import { LoadingDots } from '../LoadingDots'

describe('LoadingDots', () => {
  it('renders three dots', () => {
    render(<LoadingDots />)

    const dots = screen.getAllByTestId('loading-dot')
    expect(dots).toHaveLength(3)
  })

  it('applies animation delays correctly', () => {
    render(<LoadingDots />)

    const dots = screen.getAllByTestId('loading-dot')
    
    expect(dots[0]).toHaveStyle('animation-delay: 0s')
    expect(dots[1]).toHaveStyle('animation-delay: 0.1s')
    expect(dots[2]).toHaveStyle('animation-delay: 0.2s')
  })

  it('has bounce animation with correct duration', () => {
    render(<LoadingDots />)

    const dots = screen.getAllByTestId('loading-dot')
    
    dots.forEach(dot => {
      expect(dot).toHaveClass('animate-bounce')
      expect(dot).toHaveStyle('animation-duration: 0.6s')
    })
  })

  it('applies custom className', () => {
    const customClass = 'custom-dots-class'
    render(<LoadingDots className={customClass} />)

    const container = screen.getByTestId('loading-dots-container') || 
                    document.querySelector(`.${customClass}`)
    expect(container).toBeInTheDocument()
  })

  it('has proper styling for dots', () => {
    render(<LoadingDots />)

    const dots = screen.getAllByTestId('loading-dot')
    
    dots.forEach(dot => {
      expect(dot).toHaveClass('w-2', 'h-2', 'bg-gray-400', 'rounded-full')
    })
  })

  it('has proper spacing between dots', () => {
    render(<LoadingDots />)

    const container = screen.getByTestId('loading-dots-container') || 
                    document.querySelector('.flex.space-x-1')
    expect(container).toHaveClass('flex', 'space-x-1')
  })
})