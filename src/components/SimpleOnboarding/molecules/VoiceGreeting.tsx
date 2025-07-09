import { BeginButton } from '../atoms/BeginButton'
import VoiceWaterBall from '@/components/VoiceWaterBall'

interface VoiceGreetingProps {
  onBegin: () => void
  isSpeaking: boolean
  analyser: AnalyserNode | null
  className?: string
}

export function VoiceGreeting({
  onBegin,
  isSpeaking,
  analyser,
  className = ''
}: VoiceGreetingProps) {
  return (
    <div className={`text-center space-y-6 ${className}`}>
      <div className="flex justify-center">
        <VoiceWaterBall
          isActive={isSpeaking}
          analyser={analyser}
          isSpeaking={isSpeaking}
        />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome to Nutrition AI!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          I'm here to create a personalized nutrition plan just for you. 
          Click begin to start with a quick voice greeting.
        </p>
      </div>
      
      <BeginButton onClick={onBegin} disabled={isSpeaking} />
      
      {isSpeaking && (
        <p className="text-sm text-blue-600 animate-pulse">
          AI is speaking...
        </p>
      )}
    </div>
  )
}