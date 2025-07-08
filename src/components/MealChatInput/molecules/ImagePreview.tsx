import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import Image from 'next/image'

interface ImagePreviewProps {
  previewUrl: string
  onRemove: () => void
}

export function ImagePreview({ previewUrl, onRemove }: ImagePreviewProps) {
  return (
    <div className="mb-4 relative">
      <Image
        src={previewUrl}
        alt="Meal preview"
        className="max-w-full h-32 object-cover rounded-lg border"
        width={100}
        height={75}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 rounded-full p-1"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  )
}