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
}

export function CalorieRecommendationView({
  profile,
  isVoiceMode,
  isSpeaking,
  analyser,
  onToggleVoiceMode,
  onComplete,
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
          />
        </div>
      </CardContent>
    </Card>
  )
}