import { VoiceGreeting } from '../molecules/VoiceGreeting'

interface VoiceGreetingSectionProps {
  onBegin: () => void
  isSpeaking: boolean
  analyser: AnalyserNode | null
  className?: string
}

export function VoiceGreetingSection({
  onBegin,
  isSpeaking,
  analyser,
  className = ''
}: VoiceGreetingSectionProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
      <div className="max-w-lg w-full mx-auto p-6">
        <VoiceGreeting
          onBegin={onBegin}
          isSpeaking={isSpeaking}
          analyser={analyser}
        />
      </div>
    </div>
  )
}