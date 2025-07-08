import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { ImagePreview } from '../molecules/ImagePreview'
import { VoiceTranscript } from '../molecules/VoiceTranscript'

interface ExpandedViewProps {
  previewUrl?: string | null
  transcript?: string
  onClose: () => void
  onImageRemove: () => void
}

export function ExpandedView({
  previewUrl,
  transcript,
  onClose,
  onImageRemove,
}: ExpandedViewProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {previewUrl && (
        <ImagePreview previewUrl={previewUrl} onRemove={onImageRemove} />
      )}

      {transcript && <VoiceTranscript transcript={transcript} />}
    </div>
  )
}