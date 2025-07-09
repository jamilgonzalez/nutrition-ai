import { render, screen } from '@testing-library/react'
import { VoiceTranscript } from '../VoiceTranscript'
import { describe, it, expect } from 'vitest'

describe('VoiceTranscript', () => {
  it('renders nothing when transcript is empty', () => {
    const { container } = render(<VoiceTranscript transcript="" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when transcript is not provided', () => {
    const { container } = render(<VoiceTranscript transcript="" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders transcript text when provided', () => {
    const testTranscript = 'This is a test transcript'
    render(<VoiceTranscript transcript={testTranscript} />)

    expect(screen.getByText(testTranscript)).toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    const testTranscript = 'This is a test transcript'
    render(<VoiceTranscript transcript={testTranscript} />)

    const container = screen.getByText(testTranscript).closest('div')
    expect(container).toHaveClass('mb-4', 'p-3', 'bg-gray-50', 'rounded-lg')

    const textElement = screen.getByText(testTranscript)
    expect(textElement).toHaveClass('text-sm', 'text-gray-700')
  })

  it('handles long transcript text', () => {
    const longTranscript =
      'This is a very long transcript that should still be rendered properly without any issues in the component'
    render(<VoiceTranscript transcript={longTranscript} />)

    expect(screen.getByText(longTranscript)).toBeInTheDocument()
  })
})
