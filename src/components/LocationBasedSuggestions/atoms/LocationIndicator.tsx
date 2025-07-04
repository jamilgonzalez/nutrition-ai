import { MapPin } from 'lucide-react'

interface LocationIndicatorProps {
  city: string
}

export default function LocationIndicator({ city }: LocationIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
      <MapPin className="w-4 h-4" />
      <span>Near {city}</span>
    </div>
  )
}