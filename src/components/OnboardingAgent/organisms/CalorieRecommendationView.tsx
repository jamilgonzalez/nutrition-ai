import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import VoiceWaterBall from '@/components/VoiceWaterBall'
import { WebSearch } from '@/components/WebSearch'
import { VoiceToggleButton } from '../atoms/VoiceToggleButton'
import { ProfileSummary } from '../molecules/ProfileSummary'
import { UserProfile } from '../types'

interface CalorieRecommendationViewProps {
  profile: UserProfile
  isVoiceMode: boolean
  isSpeaking: boolean
  analyser: AnalyserNode | null
  onToggleVoiceMode: () => void
  onComplete: () => void
  onSpeakText?: (text: string) => void
  transcript?: string
  userId?: string
}

export function CalorieRecommendationView({
  profile,
  isVoiceMode,
  isSpeaking,
  analyser,
  onToggleVoiceMode,
  onComplete,
  onSpeakText,
  transcript,
  userId,
}: CalorieRecommendationViewProps) {
  const searchQuery = `daily calorie needs ${profile.age} year old ${
    profile.sex
  } ${profile.height} inches ${profile.weight} pounds ${
    profile.activityLevel
  } activity level ${profile.goals.join(
    ' '
  )}. Make sure to factor in your health conditions and dietary restrictions ${profile.healthConditions.join(
    ' '
  )} ${profile.dietaryRestrictions.join(' ')}`

  // Handle voice confirmation for the nutrition plan
  useEffect(() => {
    if (transcript && isVoiceMode) {
      const normalizedInput = transcript.toLowerCase().trim()
      
      // Check if user is confirming the nutrition plan
      const confirmationPhrases = [
        'yes', 'yep', 'yup', 'yeah', 'correct', 'right', 'good', 'looks good', 
        'thats right', "that's right", 'thats correct', "that's correct",
        'sounds good', 'sounds right', 'all good', 'perfect', 'exactly',
        'confirmed', 'confirm', 'ok', 'okay', 'fine', 'absolutely',
        'sure', 'definitely', 'for sure', 'all set', 'looks correct',
        'accept', 'approved', 'great', 'awesome', 'fantastic'
      ]
      
      const isConfirming = confirmationPhrases.some(phrase => 
        normalizedInput.includes(phrase) ||
        normalizedInput === phrase ||
        normalizedInput.startsWith(phrase + ' ') ||
        normalizedInput.endsWith(' ' + phrase)
      )

      if (isConfirming) {
        // User confirmed the nutrition plan - complete onboarding
        if (onSpeakText) {
          onSpeakText('Perfect! Your nutritional profile is now complete. You can start tracking your meals and I\'ll provide personalized recommendations based on your goals.')
        }
        onComplete()
      }
    }
  }, [transcript, isVoiceMode, onSpeakText, onComplete])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Personalized Calorie Recommendations
          <VoiceToggleButton
            isVoiceMode={isVoiceMode}
            onToggle={onToggleVoiceMode}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center">
            <VoiceWaterBall
              isActive={isVoiceMode}
              analyser={analyser}
              isSpeaking={isSpeaking}
            />
          </div>

          <ProfileSummary profile={profile} />

          <WebSearch
            query={searchQuery}
            onComplete={onComplete}
            isVoiceMode={isVoiceMode}
            onToggleVoiceMode={onToggleVoiceMode}
            onSpeakText={onSpeakText}
            userId={userId}
          />
        </div>
      </CardContent>
    </Card>
  )
}