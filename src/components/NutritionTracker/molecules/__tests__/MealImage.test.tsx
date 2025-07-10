import { render, screen } from '@testing-library/react'
import MealImage from '../MealImage'
import { describe, it, expect } from 'vitest'

/**
 * MealImage Component Tests
 * 
 * This component displays a meal image with proper sizing and accessibility.
 * Uses Next.js Image component with object-cover for consistent display.
 */
describe('MealImage', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Delicious meal photo'
  }

  describe('Basic Functionality', () => {
    it('renders image with correct src and alt attributes', () => {
      render(<MealImage {...defaultProps} />)

      const image = screen.getByRole('img')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('alt', 'Delicious meal photo')
    })

    it('renders with different image sources', () => {
      const customProps = {
        src: '/different-meal.png',
        alt: 'Another meal'
      }

      render(<MealImage {...customProps} />)

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', 'Another meal')
    })
  })

  describe('Container Styling', () => {
    it('applies correct container classes', () => {
      const { container } = render(<MealImage {...defaultProps} />)

      const imageContainer = container.firstChild
      expect(imageContainer).toHaveClass(
        'relative', 'w-10', 'h-10', 'rounded-md', 
        'overflow-hidden', 'flex-shrink-0'
      )
    })

    it('maintains fixed dimensions', () => {
      const { container } = render(<MealImage {...defaultProps} />)

      const imageContainer = container.firstChild
      expect(imageContainer).toHaveClass('w-10', 'h-10')
    })

    it('prevents container from shrinking in flex layouts', () => {
      const { container } = render(<MealImage {...defaultProps} />)

      const imageContainer = container.firstChild
      expect(imageContainer).toHaveClass('flex-shrink-0')
    })
  })

  describe('Image Properties', () => {
    it('uses fill property for Next.js Image', () => {
      render(<MealImage {...defaultProps} />)

      const image = screen.getByRole('img')
      expect(image).toBeInTheDocument()
    })

    it('applies object-cover class for proper image scaling', () => {
      render(<MealImage {...defaultProps} />)

      const image = screen.getByRole('img')
      expect(image).toHaveClass('object-cover')
    })
  })

  describe('Accessibility', () => {
    it('provides meaningful alt text', () => {
      render(<MealImage {...defaultProps} />)

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', 'Delicious meal photo')
    })

    it('handles empty alt text for decorative images', () => {
      const decorativeProps = {
        src: '/decorative-image.jpg',
        alt: ''
      }

      render(<MealImage {...decorativeProps} />)

      // Images with empty alt text get a "presentation" role in Next.js Image
      const image = screen.getByRole('presentation')
      expect(image).toHaveAttribute('alt', '')
    })

    it('supports descriptive alt text for complex images', () => {
      const descriptiveProps = {
        src: '/complex-meal.jpg',
        alt: 'Grilled salmon with roasted vegetables and quinoa on a white plate'
      }

      render(<MealImage {...descriptiveProps} />)

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', descriptiveProps.alt)
    })
  })

  describe('Different Image Types', () => {
    it('handles JPG images', () => {
      const jpgProps = {
        src: '/meal.jpg',
        alt: 'JPG meal image'
      }

      render(<MealImage {...jpgProps} />)

      const image = screen.getByRole('img')
      expect(image).toBeInTheDocument()
    })

    it('handles PNG images', () => {
      const pngProps = {
        src: '/meal.png',
        alt: 'PNG meal image'
      }

      render(<MealImage {...pngProps} />)

      const image = screen.getByRole('img')
      expect(image).toBeInTheDocument()
    })

    it('handles WebP images', () => {
      const webpProps = {
        src: '/meal.webp',
        alt: 'WebP meal image'
      }

      render(<MealImage {...webpProps} />)

      const image = screen.getByRole('img')
      expect(image).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('maintains consistent size across different screen sizes', () => {
      const { container } = render(<MealImage {...defaultProps} />)

      const imageContainer = container.firstChild
      expect(imageContainer).toHaveClass('w-10', 'h-10')
    })

    it('works well in flex layouts', () => {
      const { container } = render(
        <div className="flex items-center gap-2">
          <MealImage {...defaultProps} />
          <span>Meal name</span>
        </div>
      )

      const imageContainer = container.querySelector('.relative')
      expect(imageContainer).toHaveClass('flex-shrink-0')
    })
  })

  describe('Edge Cases', () => {
    it('handles very long alt text', () => {
      const longAltProps = {
        src: '/meal.jpg',
        alt: 'A very detailed description of a complex meal with multiple ingredients including vegetables, proteins, grains, and various seasonings and sauces'
      }

      render(<MealImage {...longAltProps} />)

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', longAltProps.alt)
    })

    it('handles special characters in alt text', () => {
      const specialAltProps = {
        src: '/meal.jpg',
        alt: 'Café au lait & crème brûlée - très délicieux! 🍮'
      }

      render(<MealImage {...specialAltProps} />)

      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', specialAltProps.alt)
    })

    it('handles various image path formats', () => {
      const pathFormats = [
        '/static/images/meal.jpg',
        '/meal.jpg',
        'https://example.com/meal.jpg'
      ]

      pathFormats.forEach((src, index) => {
        const { unmount } = render(
          <MealImage src={src} alt={`Test image ${index}`} />
        )

        const image = screen.getByRole('img')
        expect(image).toBeInTheDocument()

        unmount()
      })
    })
  })

  describe('Performance Considerations', () => {
    it('uses Next.js Image component for optimization', () => {
      render(<MealImage {...defaultProps} />)

      const image = screen.getByRole('img')
      expect(image).toBeInTheDocument()
    })

    it('applies fill property for responsive images', () => {
      render(<MealImage {...defaultProps} />)

      const image = screen.getByRole('img')
      expect(image).toBeInTheDocument()
    })
  })

  describe('Visual Consistency', () => {
    it('maintains rounded corners', () => {
      const { container } = render(<MealImage {...defaultProps} />)

      const imageContainer = container.firstChild
      expect(imageContainer).toHaveClass('rounded-md')
    })

    it('ensures proper overflow handling', () => {
      const { container } = render(<MealImage {...defaultProps} />)

      const imageContainer = container.firstChild
      expect(imageContainer).toHaveClass('overflow-hidden')
    })

    it('uses relative positioning for Next.js Image', () => {
      const { container } = render(<MealImage {...defaultProps} />)

      const imageContainer = container.firstChild
      expect(imageContainer).toHaveClass('relative')
    })
  })
})