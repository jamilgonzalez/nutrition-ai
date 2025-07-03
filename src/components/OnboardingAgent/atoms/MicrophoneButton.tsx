import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'

interface MicrophoneButtonProps {
  isRecording: boolean
  isProcessing: boolean
  onToggle: () => void
}

export function MicrophoneButton({ 
  isRecording, 
  isProcessing, 
  onToggle 
}: MicrophoneButtonProps) {
  return (
    <Button
      onClick={onToggle}
      variant={isRecording ? 'destructive' : 'default'}
      size="lg"
      disabled={isProcessing}
    >
      {isRecording ? (
        <>
          <MicOff className="w-5 h-5 mr-2" />
          Stop Recording
        </>
      ) : isProcessing ? (
        <>
          <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          Processing...
        </>
      ) : (
        <>
          <Mic className="w-5 h-5 mr-2" />
          Start Voice Input
        </>
      )}
    </Button>
  )
}