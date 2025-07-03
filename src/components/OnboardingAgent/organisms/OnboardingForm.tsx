import { Button } from '@/components/ui/button'
import VoiceWaterBall from '@/components/VoiceWaterBall'
import { QuestionDisplay } from '../molecules/QuestionDisplay'
import { VoiceControls } from '../molecules/VoiceControls'
import { TextInput } from '../molecules/TextInput'
import { Question, UserProfile } from '../types'

interface OnboardingFormProps {
  currentQuestion: Question
  currentQuestionIndex: number
  totalQuestions: number
  profile: UserProfile
  textInput: string
  isVoiceMode: boolean
  showGreeting: boolean
  isRecording: boolean
  isProcessing: boolean
  isSpeaking: boolean
  transcript: string
  speechError: string | null
  analyser: AnalyserNode | null
  whisperAnalyser: AnalyserNode | null
  onTextInputChange: (value: string) => void
  onSelectChange: (value: string) => void
  onTextSubmit: () => void
  onToggleRecording: () => void
  onUseTextInstead: () => void
  onGetStarted: () => void
}

export function OnboardingForm({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  profile,
  textInput,
  isVoiceMode,
  showGreeting,
  isRecording,
  isProcessing,
  isSpeaking,
  transcript,
  speechError,
  analyser,
  whisperAnalyser,
  onTextInputChange,
  onSelectChange,
  onTextSubmit,
  onToggleRecording,
  onUseTextInstead,
  onGetStarted,
}: OnboardingFormProps) {
  const userName = profile.name || 'there'

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <VoiceWaterBall
          isActive={isVoiceMode && (isRecording || isSpeaking)}
          analyser={whisperAnalyser || analyser}
          isSpeaking={isSpeaking}
        />
      </div>

      <QuestionDisplay
        question={currentQuestion}
        userName={userName}
        showGreeting={showGreeting}
        currentIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
      />

      {currentQuestion.type === 'welcome' ? (
        <div className="space-y-4">
          {!showGreeting ? (
            <Button onClick={onGetStarted} className="w-full">
              {`Let's Get Started`}
            </Button>
          ) : (
            <div className="text-center">
              <div className="animate-pulse text-sm text-gray-600">
                {isVoiceMode ? 'Speaking...' : 'Starting conversation...'}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {!isVoiceMode && (
            <div className="space-y-4">
              <TextInput
                question={currentQuestion}
                textInput={textInput}
                onTextInputChange={onTextInputChange}
                onSelectChange={onSelectChange}
                onSubmit={onTextSubmit}
              />
            </div>
          )}

          {isVoiceMode && (
            <VoiceControls
              isRecording={isRecording}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
              transcript={transcript}
              speechError={speechError}
              onToggleRecording={onToggleRecording}
              onUseTextInstead={onUseTextInstead}
            />
          )}
        </>
      )}
    </div>
  )
}
