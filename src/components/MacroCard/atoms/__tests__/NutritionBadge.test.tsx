import { render, screen } from '@testing-library/react'
import NutritionBadge from '../NutritionBadge'
import { describe, it, expect } from 'vitest'

/**
 * NutritionBadge Component Tests
 * 
 * This component displays nutrition values as color-coded badges.
 * Each nutrition type (calories, protein, carbs, fat) has distinct styling and suffixes.
 */
describe('NutritionBadge', () => {
  describe('Content Display', () => {
    it('displays the numeric value clearly', () => {
      render(<NutritionBadge type="calories" value={250} />)

      const badge = screen.getByText('250cal')
      expect(badge).toBeInTheDocument()
    })

    it('includes appropriate suffix for each nutrition type', () => {
      const testCases = [
        { type: 'calories' as const, value: 250, expectedSuffix: 'cal' },
        { type: 'protein' as const, value: 25, expectedSuffix: 'p' },
        { type: 'carbs' as const, value: 45, expectedSuffix: 'c' },
        { type: 'fat' as const, value: 15, expectedSuffix: 'f' }
      ]

      testCases.forEach(({ type, value, expectedSuffix }) => {
        render(<NutritionBadge type={type} value={value} />)
        
        const badge = screen.getByText(`${value}${expectedSuffix}`)
        expect(badge).toBeInTheDocument()
      })
    })

    it('handles zero values appropriately', () => {
      render(<NutritionBadge type="protein" value={0} />)

      const badge = screen.getByText('0p')
      expect(badge).toBeInTheDocument()
    })

    it('handles decimal values correctly', () => {
      render(<NutritionBadge type="fat" value={12.5} />)

      const badge = screen.getByText('12.5f')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Visual Styling by Type', () => {
    it('applies calories-specific styling', () => {
      render(<NutritionBadge type="calories" value={250} />)

      const badge = screen.getByText('250cal')
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-700')
    })

    it('applies protein-specific styling', () => {
      render(<NutritionBadge type="protein" value={25} />)

      const badge = screen.getByText('25p')
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-700')
    })

    it('applies carbs-specific styling', () => {
      render(<NutritionBadge type="carbs" value={45} />)

      const badge = screen.getByText('45c')
      expect(badge).toHaveClass('bg-green-100', 'text-green-700')
    })

    it('applies fat-specific styling', () => {
      render(<NutritionBadge type="fat" value={15} />)

      const badge = screen.getByText('15f')
      expect(badge).toHaveClass('bg-purple-100', 'text-purple-700')
    })
  })

  describe('Badge Appearance', () => {
    it('applies consistent badge styling across all types', () => {
      render(<NutritionBadge type="calories" value={250} />)

      const badge = screen.getByText('250cal')
      expect(badge).toHaveClass(
        'px-2',
        'py-0.5',
        'rounded-full',
        'font-medium',
        'text-xs'
      )
    })

    it('maintains visual consistency across different nutrition types', () => {
      const types = ['calories', 'protein', 'carbs', 'fat'] as const
      
      types.forEach(type => {
        const { rerender } = render(<NutritionBadge type={type} value={100} />)
        
        const badge = screen.getByText(new RegExp(`100[a-z]`))
        expect(badge).toHaveClass('rounded-full', 'font-medium', 'text-xs')
        
        rerender(<div />)
      })
    })
  })

  describe('Custom Styling', () => {
    it('accepts and applies custom className', () => {
      render(
        <NutritionBadge 
          type="calories" 
          value={250} 
          className="custom-badge-class" 
        />
      )

      const badge = screen.getByText('250cal')
      expect(badge).toHaveClass('custom-badge-class')
    })

    it('merges custom className with default styling', () => {
      render(
        <NutritionBadge 
          type="protein" 
          value={25} 
          className="custom-spacing" 
        />
      )

      const badge = screen.getByText('25p')
      expect(badge).toHaveClass('custom-spacing')
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-700')
    })

    it('handles undefined className gracefully', () => {
      render(<NutritionBadge type="carbs" value={45} className={undefined} />)

      const badge = screen.getByText('45c')
      expect(badge).toHaveClass('bg-green-100', 'text-green-700')
    })
  })

  describe('Accessibility', () => {
    it('provides meaningful text content for screen readers', () => {
      render(<NutritionBadge type="calories" value={250} />)

      const badge = screen.getByText('250cal')
      expect(badge).toBeInTheDocument()
      
      // Screen readers can understand "250cal" as "250 calories"
      expect(badge.textContent).toBe('250cal')
    })

    it('uses semantic span element for proper text semantics', () => {
      render(<NutritionBadge type="protein" value={25} />)

      const badge = screen.getByText('25p')
      expect(badge.tagName).toBe('SPAN')
    })

    it('maintains readable text with sufficient contrast', () => {
      // Test that we're using appropriate color combinations
      render(<NutritionBadge type="calories" value={250} />)
      
      const badge = screen.getByText('250cal')
      // Orange text on orange background with good contrast
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-700')
    })
  })

  describe('Edge Cases', () => {
    it('handles very large numbers appropriately', () => {
      render(<NutritionBadge type="calories" value={9999} />)

      const badge = screen.getByText('9999cal')
      expect(badge).toBeInTheDocument()
    })

    it('handles very small decimal values', () => {
      render(<NutritionBadge type="fat" value={0.1} />)

      const badge = screen.getByText('0.1f')
      expect(badge).toBeInTheDocument()
    })

    it('handles negative values gracefully', () => {
      render(<NutritionBadge type="protein" value={-5} />)

      const badge = screen.getByText('-5p')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Color Coding System', () => {
    it('uses distinct colors for each nutrition type for easy identification', () => {
      const colorTests = [
        { type: 'calories' as const, expectedBg: 'bg-orange-100', expectedText: 'text-orange-700' },
        { type: 'protein' as const, expectedBg: 'bg-blue-100', expectedText: 'text-blue-700' },
        { type: 'carbs' as const, expectedBg: 'bg-green-100', expectedText: 'text-green-700' },
        { type: 'fat' as const, expectedBg: 'bg-purple-100', expectedText: 'text-purple-700' }
      ]

      colorTests.forEach(({ type, expectedBg, expectedText }) => {
        const { rerender } = render(<NutritionBadge type={type} value={100} />)
        
        const badge = screen.getByText(new RegExp(`100[a-z]`))
        expect(badge).toHaveClass(expectedBg, expectedText)
        
        rerender(<div />)
      })
    })

    it('provides visual distinction between different nutrition types', () => {
      const { container } = render(
        <div>
          <NutritionBadge type="calories" value={250} />
          <NutritionBadge type="protein" value={25} />
          <NutritionBadge type="carbs" value={45} />
          <NutritionBadge type="fat" value={15} />
        </div>
      )

      const badges = container.querySelectorAll('span')
      expect(badges).toHaveLength(4)
      
      // Each badge should have different styling
      const classes = Array.from(badges).map(badge => badge.className)
      const uniqueClasses = new Set(classes)
      expect(uniqueClasses.size).toBe(4) // All should be different
    })
  })

  describe('User Experience', () => {
    it('provides compact display suitable for small spaces', () => {
      render(<NutritionBadge type="calories" value={250} />)

      const badge = screen.getByText('250cal')
      expect(badge).toHaveClass('text-xs', 'px-2', 'py-0.5')
    })

    it('uses intuitive abbreviations that users can understand', () => {
      const abbreviations = [
        { type: 'calories' as const, value: 250, suffix: 'cal' },
        { type: 'protein' as const, value: 25, suffix: 'p' },
        { type: 'carbs' as const, value: 45, suffix: 'c' },
        { type: 'fat' as const, value: 15, suffix: 'f' }
      ]

      abbreviations.forEach(({ type, value, suffix }) => {
        render(<NutritionBadge type={type} value={value} />)
        
        const badge = screen.getByText(`${value}${suffix}`)
        expect(badge).toBeInTheDocument()
      })
    })
  })
})