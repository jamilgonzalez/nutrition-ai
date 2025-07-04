import { Button } from '@/components/ui/button'
import { MapPin, AlertCircle } from 'lucide-react'

interface LocationPromptProps {
  error: string
  onRequestLocation: () => void
}

export default function LocationPrompt({
  error,
  onRequestLocation,
}: LocationPromptProps) {
  return (
    <div className="text-center py-6 space-y-3">
      <div className="flex items-center justify-center gap-2 text-amber-600">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Location needed</span>
      </div>
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button onClick={onRequestLocation} variant="outline" size="sm">
        <MapPin className="w-4 h-4 mr-2" />
        Enable Location
      </Button>
    </div>
  )
}