import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { ImagePreview } from '../molecules/ImagePreview'
import { VoiceTranscript } from '../molecules/VoiceTranscript'
import { useEffect, useRef } from 'react'

interface ExpandedViewProps {
  previewUrl?: string | null
  transcript?: string
  onClose: () => void
  onImageRemove: () => void
  'aria-label'?: string
  'data-testid'?: string
}

export function ExpandedView({
  previewUrl,
  transcript,
  onClose,
  onImageRemove,
  'aria-label': ariaLabel,
  'data-testid': testId,
}: ExpandedViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    // Handle keyboard navigation without stealing focus from input

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Determine content for better accessibility
  const hasContent = previewUrl || transcript
  const contentDescription = []
  if (previewUrl) contentDescription.push('image preview')
  if (transcript) contentDescription.push('voice transcript')
  
  const defaultAriaLabel = hasContent 
    ? `Expanded view with ${contentDescription.join(' and ')}`
    : 'Expanded view'

  return (
    <section
      ref={containerRef}
      className="mb-4"
      role="region"
      aria-label={ariaLabel || defaultAriaLabel}
      data-testid={testId}
    >
      <header className="flex justify-end mb-2">
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close expanded view"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </Button>
      </header>

      {hasContent && (
        <div className="space-y-3">
          {previewUrl && (
            <div role="img" aria-label="Image preview">
              <ImagePreview previewUrl={previewUrl} onRemove={onImageRemove} />
            </div>
          )}

          {transcript && (
            <div role="region" aria-label="Voice transcript">
              <VoiceTranscript transcript={transcript} />
            </div>
          )}
        </div>
      )}

      {!hasContent && (
        <div className="text-center py-4 text-gray-500 text-sm">
          <p>No content to display</p>
        </div>
      )}
    </section>
  )
}