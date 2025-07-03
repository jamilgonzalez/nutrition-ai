import { Button } from '@/components/ui/button'
import { Volume2, VolumeX } from 'lucide-react'

interface VoiceToggleButtonProps {
  isVoiceMode: boolean
  onToggle: () => void
}

export function VoiceToggleButton({ isVoiceMode, onToggle }: VoiceToggleButtonProps) {
  return (
    <Button variant="outline" size="sm" onClick={onToggle}>
      {isVoiceMode ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
    </Button>
  )
}