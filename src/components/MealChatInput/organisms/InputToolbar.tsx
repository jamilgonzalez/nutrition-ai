import { Camera, ImageIcon, Mic, MicOff } from 'lucide-react'
import { ToolbarButton } from '../atoms/ToolbarButton'

interface InputToolbarProps {
  onCameraClick: () => void
  onImageClick: () => void
  onVoiceToggle: () => void
  disabled?: boolean
  speechSupported?: boolean
  isRecording?: boolean
}

export function InputToolbar({
  onCameraClick,
  onImageClick,
  onVoiceToggle,
  disabled,
  speechSupported,
  isRecording,
}: InputToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ToolbarButton
          icon={Camera}
          onClick={onCameraClick}
          disabled={disabled}
        />
        <ToolbarButton
          icon={ImageIcon}
          onClick={onImageClick}
          disabled={disabled}
        />
      </div>

      {speechSupported && (
        <ToolbarButton
          icon={isRecording ? MicOff : Mic}
          onClick={onVoiceToggle}
          disabled={disabled}
          className={isRecording ? 'bg-red-100 text-red-600' : ''}
        />
      )}
    </div>
  )
}