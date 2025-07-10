import { render, screen } from '@testing-library/react'
import CaloriesOverview from '../CaloriesOverview'
import { describe, it, expect } from 'vitest'

/**
 * CaloriesOverview Component Tests
 * 
 * This component displays daily calorie progress with remaining calories,
 * progress bar visualization, and breakdown of consumed vs. remaining calories.
 */
describe('CaloriesOverview', () => {
  const defaultProps = {
    consumed: 1200,
    remaining: 800,
    dailyGoal: 2000,
  }

  describe('Basic Functionality', () => {
    it('renders remaining calories prominently', () => {
      render(<CaloriesOverview {...defaultProps} />)

      const remainingCaloriesElements = screen.getAllByText('800')
      const prominentDisplay = remainingCaloriesElements.find(el => 
        el.className.includes('text-3xl')
      )
      expect(prominentDisplay).toBeInTheDocument()
      expect(prominentDisplay).toHaveClass('text-3xl', 'font-bold', 'text-green-600')
    })

    it('displays goal information correctly', () => {
      render(<CaloriesOverview {...defaultProps} />)

      expect(screen.getByText('Calories remaining of 2000 goal')).toBeInTheDocument()
    })

    it('shows consumed and remaining breakdown', () => {
      render(<CaloriesOverview {...defaultProps} />)

      expect(screen.getByText('1200')).toBeInTheDocument()
      expect(screen.getAllByText('800')).toHaveLength(2) // Main display + breakdown
      expect(screen.getByText(/consumed/)).toBeInTheDocument()
      expect(screen.getAllByText(/remaining/)).toHaveLength(2) // Goal text + breakdown
    })
  })

  describe('Progress Bar Visualization', () => {
    it('renders progress bar with correct percentage', () => {
      render(<CaloriesOverview {...defaultProps} />)

      const progressBars = screen.getAllByRole('generic')
      const progressContainer = progressBars.find(el => 
        el.className.includes('h-3') && el.className.includes('bg-secondary')
      )
      const progressBar = progressContainer?.querySelector('.h-full')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveStyle({ width: '60%' }) // 1200/2000 = 60%
    })

    it('handles 100% progress correctly', () => {
      render(
        <CaloriesOverview 
          consumed={2000}
          remaining={0}
          dailyGoal={2000}
        />
      )

      const progressBars = screen.getAllByRole('generic')
      const progressContainer = progressBars.find(el => 
        el.className.includes('h-3') && el.className.includes('bg-secondary')
      )
      const progressBar = progressContainer?.querySelector('.h-full')
      expect(progressBar).toHaveStyle({ width: '100%' })
    })

    it('handles zero progress correctly', () => {
      render(
        <CaloriesOverview 
          consumed={0}
          remaining={2000}
          dailyGoal={2000}
        />
      )

      const progressBars = screen.getAllByRole('generic')
      const progressContainer = progressBars.find(el => 
        el.className.includes('h-3') && el.className.includes('bg-secondary')
      )
      const progressBar = progressContainer?.querySelector('.h-full')
      expect(progressBar).toHaveStyle({ width: '0%' })
    })

    it('handles over-consumption scenarios', () => {
      render(
        <CaloriesOverview 
          consumed={2500}
          remaining={-500}
          dailyGoal={2000}
        />
      )

      const progressBars = screen.getAllByRole('generic')
      const progressContainer = progressBars.find(el => 
        el.className.includes('h-3') && el.className.includes('bg-secondary')
      )
      const progressBar = progressContainer?.querySelector('.h-full')
      expect(progressBar).toHaveStyle({ width: '125%' }) // 2500/2000 = 125%
      
      const negativeRemainingElements = screen.getAllByText('-500')
      expect(negativeRemainingElements.length).toBeGreaterThan(0)
    })
  })

  describe('Visual Design and Styling', () => {
    it('applies correct styling classes for layout', () => {
      const { container } = render(<CaloriesOverview {...defaultProps} />)

      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass('text-center', 'space-y-2')
    })

    it('applies progress bar styling correctly', () => {
      render(<CaloriesOverview {...defaultProps} />)

      const progressBars = screen.getAllByRole('generic')
      const progressContainer = progressBars.find(el => 
        el.className.includes('h-3') && el.className.includes('bg-secondary')
      )
      expect(progressContainer).toHaveClass('bg-secondary', 'rounded-full', 'overflow-hidden')

      const progressBar = progressContainer?.querySelector('.h-full')
      expect(progressBar).toHaveClass('transition-all', 'duration-700', 'ease-out')
      expect(progressBar).toHaveStyle({ backgroundColor: '#000000' })
    })

    it('applies text styling for different elements', () => {
      render(<CaloriesOverview {...defaultProps} />)

      const goalText = screen.getByText('Calories remaining of 2000 goal')
      expect(goalText).toHaveClass('text-sm', 'text-muted-foreground')

      const breakdownContainer = screen.getByText(/consumed/).closest('.text-xs')
      expect(breakdownContainer).toHaveClass('text-xs', 'text-muted-foreground')
    })
  })

  describe('Animation and Transitions', () => {
    it('applies transition classes for smooth animations', () => {
      render(<CaloriesOverview {...defaultProps} />)

      const remainingCaloriesElements = screen.getAllByText('800')
      const prominentDisplay = remainingCaloriesElements.find(el => 
        el.className.includes('transition-all') && el.className.includes('duration-500')
      )
      expect(prominentDisplay).toHaveClass('transition-all', 'duration-500', 'ease-out')

      const progressBars = screen.getAllByRole('generic')
      const progressContainer = progressBars.find(el => 
        el.className.includes('h-3') && el.className.includes('bg-secondary')
      )
      const progressBar = progressContainer?.querySelector('.h-full')
      expect(progressBar).toHaveClass('transition-all', 'duration-700', 'ease-out')
    })

    it('applies transitions to consumed and remaining values', () => {
      render(<CaloriesOverview {...defaultProps} />)

      const consumedSpan = screen.getByText('1200')
      const remainingSpans = screen.getAllByText('800')
      const breakdownRemainingSpan = remainingSpans.find(el => 
        el.className.includes('transition-all') && el.className.includes('duration-500')
      )
      
      expect(consumedSpan).toHaveClass('transition-all', 'duration-500')
      expect(breakdownRemainingSpan).toHaveClass('transition-all', 'duration-500')
    })
  })

  describe('Data Handling', () => {
    it('handles different numeric formats correctly', () => {
      render(
        <CaloriesOverview 
          consumed={1234.56}
          remaining={765.44}
          dailyGoal={2000}
        />
      )

      expect(screen.getByText('1234.56')).toBeInTheDocument()
      expect(screen.getAllByText('765.44')).toHaveLength(2) // Main display + breakdown
    })

    it('handles zero values appropriately', () => {
      render(
        <CaloriesOverview 
          consumed={0}
          remaining={2000}
          dailyGoal={2000}
        />
      )

      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getAllByText('2000')).toHaveLength(2) // Main display + breakdown
    })

    it('handles large numbers correctly', () => {
      render(
        <CaloriesOverview 
          consumed={5000}
          remaining={-2000}
          dailyGoal={3000}
        />
      )

      expect(screen.getByText('5000')).toBeInTheDocument()
      expect(screen.getAllByText('-2000')).toHaveLength(2) // Main display + breakdown
      expect(screen.getByText('Calories remaining of 3000 goal')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides clear semantic structure', () => {
      const { container } = render(<CaloriesOverview {...defaultProps} />)

      // Main content should be accessible
      expect(container.firstChild).toBeInTheDocument()
    })

    it('maintains readable text hierarchy', () => {
      render(<CaloriesOverview {...defaultProps} />)

      // Large remaining calories should be most prominent
      const remainingCaloriesElements = screen.getAllByText('800')
      const prominentDisplay = remainingCaloriesElements.find(el => 
        el.className.includes('text-3xl')
      )
      expect(prominentDisplay).toHaveClass('text-3xl', 'font-bold')

      // Goal text should be secondary
      const goalText = screen.getByText('Calories remaining of 2000 goal')
      expect(goalText).toHaveClass('text-sm')

      // Breakdown should be smallest
      const breakdownContainer = screen.getByText(/consumed/).closest('.text-xs')
      expect(breakdownContainer).toHaveClass('text-xs')
    })

    it('uses appropriate color contrast for text', () => {
      render(<CaloriesOverview {...defaultProps} />)

      const remainingCaloriesElements = screen.getAllByText('800')
      const prominentDisplay = remainingCaloriesElements.find(el => 
        el.className.includes('text-green-600')
      )
      expect(prominentDisplay).toHaveClass('text-green-600')

      const mutedText = screen.getByText('Calories remaining of 2000 goal')
      expect(mutedText).toHaveClass('text-muted-foreground')
    })
  })

  describe('User Experience', () => {
    it('provides clear visual progress indication', () => {
      render(<CaloriesOverview {...defaultProps} />)

      // Progress bar should be visually distinct
      const progressBars = screen.getAllByRole('generic')
      const progressContainer = progressBars.find(el => 
        el.className.includes('h-3') && el.className.includes('bg-secondary')
      )
      expect(progressContainer).toHaveClass('bg-secondary', 'rounded-full')

      const progressBar = progressContainer?.querySelector('.h-full')
      expect(progressBar).toHaveStyle({ backgroundColor: '#000000' })
    })

    it('shows meaningful numerical context', () => {
      render(<CaloriesOverview {...defaultProps} />)

      // All key numbers should be visible
      expect(screen.getAllByText('800')).toHaveLength(2) // remaining (primary + breakdown)
      expect(screen.getByText(/Calories remaining of.*2000.*goal/)).toBeInTheDocument() // goal in context
      expect(screen.getByText('1200')).toBeInTheDocument() // consumed
    })

    it('provides comprehensive calorie breakdown', () => {
      render(<CaloriesOverview {...defaultProps} />)

      const breakdownSection = screen.getByText(/consumed/).parentElement
      expect(breakdownSection?.textContent).toContain('1200 consumed')
      expect(breakdownSection?.textContent).toContain('800 remaining')
    })
  })
})