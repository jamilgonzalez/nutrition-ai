import { Camera, ImageIcon, Mic, MicOff, History } from 'lucide-react'
import { ToolbarButton } from '../atoms/ToolbarButton'
import { MealHistoryButton } from '../molecules/MealHistoryButton'
import type { RecordedMeal } from '@/lib/mealStorage'
import { useState } from 'react'

interface InputToolbarProps {
  onCameraClick: () => void
  onImageClick: () => void
  onVoiceToggle: () => void
  onMealFromHistoryAdded: (meal: RecordedMeal) => void
  disabled?: boolean
  speechSupported?: boolean
  isRecording?: boolean
  user?: any
}

export function InputToolbar({
  onCameraClick,
  onImageClick,
  onVoiceToggle,
  onMealFromHistoryAdded,
  disabled,
  speechSupported,
  isRecording,
  user,
}: InputToolbarProps) {
  const [isMealHistoryOpen, setIsMealHistoryOpen] = useState(false)

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ToolbarButton
          icon={Camera}
          onClick={onCameraClick}
          disabled={disabled}
          ariaLabel="Take photo with camera"
        />
        <ToolbarButton
          icon={ImageIcon}
          onClick={onImageClick}
          disabled={disabled}
          ariaLabel="Upload image from gallery"
        />
        <ToolbarButton
          icon={History}
          onClick={() => setIsMealHistoryOpen(true)}
          disabled={disabled}
          ariaLabel="Open meal history"
        />
        <MealHistoryButton 
          onMealAdded={onMealFromHistoryAdded} 
          user={user}
          isOpen={isMealHistoryOpen}
          onOpenChange={setIsMealHistoryOpen}
        />
      </div>

      {speechSupported && (
        <ToolbarButton
          icon={isRecording ? MicOff : Mic}
          onClick={onVoiceToggle}
          disabled={disabled}
          className={isRecording ? 'bg-red-100 text-red-600' : ''}
          ariaLabel={isRecording ? "Stop voice recording" : "Start voice recording"}
        />
      )}
    </div>
  )
}