import { Button } from '@/components/ui/button'
import { MicrophoneButton } from '../atoms/MicrophoneButton'
import { StatusIndicator } from '../atoms/StatusIndicator'

interface VoiceControlsProps {
  isRecording: boolean
  isProcessing: boolean
  isSpeaking: boolean
  transcript: string
  speechError: string | null
  onToggleRecording: () => void
  onUseTextInstead: () => void
}

export function VoiceControls({
  isRecording,
  isProcessing,
  isSpeaking,
  transcript,
  speechError,
  onToggleRecording,
  onUseTextInstead,
}: VoiceControlsProps) {
  const getStatus = () => {
    if (isRecording) return 'recording'
    if (isProcessing) return 'processing'
    if (speechError) return 'error'
    return 'ready'
  }

  const getStatusMessage = () => {
    if (isRecording) return 'Recording with Whisper...'
    if (isProcessing) return 'Processing speech...'
    if (speechError) return `Error: ${speechError}`
    return 'Ready'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-4">
        <MicrophoneButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          onToggle={onToggleRecording}
        />
      </div>

      {/* <StatusIndicator status={getStatus()} message={getStatusMessage()} /> */}

      {transcript && (
        <div className="bg-white p-3 rounded-lg border">
          <p className="text-sm">
            <strong>You said:</strong> {transcript}
          </p>
        </div>
      )}

      {speechError && (
        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">
            <strong>Error:</strong> {speechError}
          </p>
        </div>
      )}

      <div className="text-center">
        <Button variant="outline" onClick={onUseTextInstead} size="sm">
          Use Text Instead
        </Button>
      </div>
    </div>
  )
}
