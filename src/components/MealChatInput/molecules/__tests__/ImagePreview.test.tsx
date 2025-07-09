import { render, screen, fireEvent } from '@testing-library/react'
import { ImagePreview } from '../ImagePreview'
import { describe, it, beforeEach, expect, vi } from 'vitest'

describe('ImagePreview', () => {
  const mockOnRemove = vi.fn()
  const mockPreviewUrl = '/test-image.jpg'

  beforeEach(() => {
    mockOnRemove.mockClear()
  })

  it('renders image with correct src and alt text', () => {
    render(<ImagePreview previewUrl={mockPreviewUrl} onRemove={mockOnRemove} />)

    const image = screen.getByAltText('Meal preview')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute(
      'src',
      expect.stringContaining('test-image.jpg')
    )
  })

  it('calls onRemove when remove button is clicked', () => {
    render(<ImagePreview previewUrl={mockPreviewUrl} onRemove={mockOnRemove} />)

    const removeButton = screen.getByRole('button')
    fireEvent.click(removeButton)

    expect(mockOnRemove).toHaveBeenCalledTimes(1)
  })

  it('has proper styling classes', () => {
    render(<ImagePreview previewUrl={mockPreviewUrl} onRemove={mockOnRemove} />)

    const container = screen.getByRole('button').closest('div')
    expect(container).toHaveClass('mb-4', 'relative')

    const image = screen.getByAltText('Meal preview')
    expect(image).toHaveClass(
      'max-w-full',
      'h-32',
      'object-cover',
      'rounded-lg',
      'border'
    )
  })
})
