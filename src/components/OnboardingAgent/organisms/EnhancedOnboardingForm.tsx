import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import VoiceWaterBall from '@/components/VoiceWaterBall'
import { DataChecklist } from '../molecules/DataChecklist'
import { UserProfile } from '../types'

interface EnhancedOnboardingFormProps {
  profile: UserProfile
  isVoiceMode: boolean
  showGreeting: boolean
  isRecording: boolean
  isProcessing: boolean
  isSpeaking: boolean
  transcript: string
  speechError: string | null
  analyser: AnalyserNode | null
  whisperAnalyser: AnalyserNode | null
  onProfileUpdate: (profile: UserProfile) => void
  onToggleRecording: () => void
  onToggleVoiceMode: () => void
  onGetStarted: () => void
  onComplete: () => void
  onSpeakText?: (text: string, skipAutoListen?: boolean) => void
  onUserInput?: () => void
  onTranscriptProcessed?: (transcript: string) => void
}

export function EnhancedOnboardingForm({
  profile,
  isVoiceMode,
  showGreeting,
  isRecording,
  isProcessing,
  isSpeaking,
  transcript,
  speechError,
  analyser,
  whisperAnalyser,
  onProfileUpdate,
  onToggleRecording,
  onToggleVoiceMode,
  onGetStarted,
  onComplete,
  onSpeakText,
  onUserInput,
  onTranscriptProcessed,
}: EnhancedOnboardingFormProps) {
  const [manualMode, setManualMode] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [hasStartedVoiceOnboarding, setHasStartedVoiceOnboarding] =
    useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null)
  const [lastTranscriptProcessed, setLastTranscriptProcessed] = useState('')
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false)
  const [showValuesReview, setShowValuesReview] = useState(false)
  const [hasProvidedInput, setHasProvidedInput] = useState(false)
  const [isInitialMount, setIsInitialMount] = useState(true)

  const isDataComplete =
    profile.age !== null &&
    profile.sex !== null &&
    profile.height !== null &&
    profile.weight !== null &&
    profile.activityLevel !== null &&
    profile.goals !== null &&
    profile.dietaryRestrictions.length > 0

  const handleManualFieldChange = (
    field: keyof UserProfile,
    value: string | number | null | string[]
  ) => {
    onProfileUpdate({ ...profile, [field]: value })
  }

  const getMissingInfoPrompt = () => {
    const missing = []
    if (profile.age === null) missing.push('your age')
    if (profile.sex === null) missing.push('your gender')
    if (profile.height === null) missing.push('your height')
    if (profile.weight === null) missing.push('your weight')
    if (profile.activityLevel === null) missing.push('your activity level')
    if (profile.goals === null) missing.push('your health and fitness goals')
    if (profile.dietaryRestrictions.length === 0)
      missing.push('any dietary restrictions or allergies')

    if (missing.length === 0) return null

    if (missing.length === 1) {
      return `I still need to know ${missing[0]}. Could you tell me about that?`
    } else if (missing.length === 2) {
      return `I still need to know ${missing[0]} and ${missing[1]}. Could you share those details?`
    } else {
      const lastItem = missing.pop()
      return `I still need to know ${missing.join(
        ', '
      )}, and ${lastItem}. Could you share those details?`
    }
  }

  const handleTextSubmit = () => {
    if (textInput.trim() && textInput !== lastTranscriptProcessed) {
      // Enhanced NLP processing would happen here
      console.log('Processing text input:', textInput)
      setLastTranscriptProcessed(textInput)

      // Simulate processing and check for missing info
      setTimeout(() => {
        const missingPrompt = getMissingInfoPrompt()
        if (missingPrompt) {
          setFollowUpQuestion(missingPrompt)
        } else if (isDataComplete) {
          setShowConfirmation(true)
        }
      }, 1000)

      setTextInput('')
    }
  }

  const handleCompleteOnboarding = () => {
    if (isDataComplete) {
      if (showConfirmation) {
        onComplete()
      } else {
        setShowConfirmation(true)
      }
    }
  }

  const formatProfileForConfirmation = () => {
    const heightFeet = profile.height ? Math.floor(profile.height / 12) : 0
    const heightInches = profile.height ? profile.height % 12 : 0
    const heightStr = profile.height
      ? `${heightFeet}'${heightInches}"`
      : 'Not provided'

    return {
      age: profile.age || 'Not provided',
      gender: profile.sex || 'Not provided',
      height: heightStr,
      weight: profile.weight ? `${profile.weight} lbs` : 'Not provided',
      activityLevel: profile.activityLevel || 'Not provided',
      goals: profile.goals || 'Not provided',
      dietaryRestrictions:
        profile.dietaryRestrictions.length > 0
          ? profile.dietaryRestrictions.join(', ')
          : 'None specified',
    }
  }

  // Track when user provides input by watching for profile changes
  useEffect(() => {
    if (hasStartedVoiceOnboarding && !hasProvidedInput) {
      const hasAnyData =
        profile.age !== null ||
        profile.sex !== null ||
        profile.height !== null ||
        profile.weight !== null ||
        profile.activityLevel !== null ||
        (profile.goals && profile.goals.length > 0) ||
        profile.dietaryRestrictions.length > 0

      if (hasAnyData) {
        setHasProvidedInput(true)
        if (onUserInput) {
          onUserInput()
        }
      }
    }
  }, [profile, hasStartedVoiceOnboarding, hasProvidedInput, onUserInput])

  // Set initial mount flag after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialMount(false)
    }, 2000) // Wait 2 seconds before allowing follow-up questions

    return () => clearTimeout(timer)
  }, [])

  // Update lastTranscriptProcessed when transcript changes (from voice input)
  useEffect(() => {
    if (transcript && transcript !== lastTranscriptProcessed) {
      setLastTranscriptProcessed(transcript)
      if (onTranscriptProcessed) {
        onTranscriptProcessed(transcript)
      }
    }
  }, [transcript, lastTranscriptProcessed, onTranscriptProcessed])

  // Check for follow-up questions when profile updates (only after initial mount period)
  useEffect(() => {
    if (
      hasStartedVoiceOnboarding &&
      hasProvidedInput &&
      !isInitialMount &&
      !showConfirmation &&
      !showValuesReview &&
      !isDataComplete &&
      lastTranscriptProcessed // Only if we've processed at least one transcript
    ) {
      const missingPrompt = getMissingInfoPrompt()
      if (missingPrompt && followUpQuestion !== missingPrompt) {
        setFollowUpQuestion(missingPrompt)
        if (onSpeakText && isVoiceMode) {
          setTimeout(() => {
            onSpeakText(missingPrompt)
          }, 1500)
        }
      }
    }
  }, [
    profile,
    hasStartedVoiceOnboarding,
    hasProvidedInput,
    isInitialMount,
    showConfirmation,
    showValuesReview,
    isDataComplete,
    followUpQuestion,
    onSpeakText,
    isVoiceMode,
    lastTranscriptProcessed,
  ])

  const WelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <VoiceWaterBall
          isActive={false}
          analyser={analyser}
          isSpeaking={false}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome to Nutrition AI!
        </h2>
        <p className="text-gray-600">
          I'm here to learn about your health and fitness goals so I can create
          a personalized nutrition plan just for you.
        </p>
        <p className="text-sm text-gray-500">
          I'll need to gather some basic information to personalize your
          calories and macros.
        </p>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => {
              setHasStartedVoiceOnboarding(true)
              onGetStarted()
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Start with Voice
          </Button>
          <Button
            onClick={() => setManualMode(true)}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Use Manual Form
          </Button>
        </div>
      </div>
    </div>
  )

  const DataCollectionStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Tell me about yourself
        </h3>
        <Button
          onClick={onToggleVoiceMode}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          {isVoiceMode ? 'Switch to Manual' : 'Switch to Voice'}
        </Button>
      </div>

      <DataChecklist profile={profile} />

      {isVoiceMode ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <VoiceWaterBall
              isActive={isRecording || isSpeaking}
              analyser={whisperAnalyser || analyser}
              isSpeaking={isSpeaking}
            />
          </div>

          <div className="text-center space-y-4">
            {followUpQuestion ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-medium">
                  {followUpQuestion}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                You can share multiple details at once, like: "I'm 25 years old,
                male, 6 feet tall, 180 pounds, and so on.
              </p>
            )}

            {/* Status indicator */}
            <div className="flex items-center justify-center space-x-2">
              {isSpeaking && (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-600">
                    AI is speaking...
                  </span>
                </>
              )}
              {isRecording && (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600">Listening...</span>
                </>
              )}
              {isProcessing && (
                <>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-yellow-600">Processing...</span>
                </>
              )}
              {isUpdatingInfo && (
                <>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-purple-600">
                    Updating information...
                  </span>
                </>
              )}
              {!isSpeaking &&
                !isRecording &&
                !isProcessing &&
                !isUpdatingInfo && (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-500">
                      Ready to listen
                    </span>
                  </>
                )}
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={onToggleRecording}
                disabled={isProcessing || isSpeaking}
                className={`${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
            </div>

            {transcript && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>You said:</strong> "{transcript}"
                </p>
              </div>
            )}

            {speechError && (
              <div className="mt-2 p-2 bg-red-100 rounded-lg">
                <p className="text-sm text-red-600">{speechError}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="freeform-input">Tell me about yourself</Label>
            <Textarea
              id="freeform-input"
              placeholder="You can share multiple details at once, like: I'm 25 years old, male, 6 feet tall, 180 pounds, and I'm allergic to nuts"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={handleTextSubmit} className="w-full">
              Process Information
            </Button>
          </div>
        </div>
      )}

      {isDataComplete && !showValuesReview && (
        <div className="text-center space-y-4 pt-6 border-t">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">
              All information collected!
            </span>
          </div>
          <Button
            onClick={() => {
              setShowValuesReview(true)
              if (onSpeakText) {
                onSpeakText(
                  "Perfect! I've collected all your information. Does everything look correct?",
                  true // Skip auto-listening for confirmation question
                )
              }
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Review & Confirm
          </Button>
        </div>
      )}

      {showValuesReview && (
        <div className="space-y-4 pt-6 border-t">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              Does everything look correct?
            </h4>
            <p className="text-sm text-gray-600">
              Please review your information above. If anything needs to be
              changed, just tell me what to update.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                if (onSpeakText) {
                  onSpeakText('What would you like me to update?', false) // Allow auto-listening for follow-up
                }
                setShowValuesReview(false)
                setFollowUpQuestion('What would you like me to update?')
              }}
              variant="outline"
              className="flex-1"
            >
              Make Changes
            </Button>
            <Button
              onClick={() => {
                if (onSpeakText) {
                  onSpeakText(
                    'Great! Let me create your personalized nutrition plan.',
                    true // Skip auto-listening when proceeding to next step
                  )
                }
                onComplete()
              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Looks Good!
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  const ManualFormStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Manual Information Entry
        </h3>
        <Button
          onClick={() => setManualMode(false)}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Back to Voice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={profile.age || ''}
            onChange={(e) =>
              handleManualFieldChange('age', parseInt(e.target.value) || null)
            }
            placeholder="Enter your age"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Gender</Label>
          <Select
            onValueChange={(value) => handleManualFieldChange('sex', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={profile.sex || 'Select gender'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height (inches)</Label>
          <Input
            id="height"
            type="number"
            value={profile.height || ''}
            onChange={(e) =>
              handleManualFieldChange(
                'height',
                parseInt(e.target.value) || null
              )
            }
            placeholder="Enter height in inches"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (pounds)</Label>
          <Input
            id="weight"
            type="number"
            value={profile.weight || ''}
            onChange={(e) =>
              handleManualFieldChange(
                'weight',
                parseInt(e.target.value) || null
              )
            }
            placeholder="Enter weight in pounds"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="dietary">Dietary restrictions/allergies</Label>
          <Textarea
            id="dietary"
            value={profile.dietaryRestrictions.join(', ')}
            onChange={(e) =>
              handleManualFieldChange(
                'dietaryRestrictions',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter((s) => s)
              )
            }
            placeholder="e.g., nuts, dairy, gluten-free, vegetarian"
            className="min-h-[80px]"
          />
        </div>
      </div>

      {isDataComplete && (
        <div className="text-center space-y-4 pt-6 border-t">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">
              All information collected!
            </span>
          </div>
          <Button
            onClick={handleCompleteOnboarding}
            className="bg-green-600 hover:bg-green-700"
          >
            Create My Nutrition Plan
          </Button>
        </div>
      )}
    </div>
  )

  const ConfirmationStep = () => {
    const formattedProfile = formatProfileForConfirmation()

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Please Confirm Your Information
          </h3>
          <p className="text-sm text-gray-600">
            I've collected the following information. Please review and confirm
            or make any necessary edits.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Age:</span>
              <span className="text-gray-900">{formattedProfile.age}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Gender:</span>
              <span className="text-gray-900">{formattedProfile.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Height:</span>
              <span className="text-gray-900">{formattedProfile.height}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Weight:</span>
              <span className="text-gray-900">{formattedProfile.weight}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Activity Level:</span>
              <span className="text-gray-900">
                {formattedProfile.activityLevel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Goals:</span>
              <span className="text-gray-900">{formattedProfile.goals}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">
                Dietary Restrictions:
              </span>
              <span className="text-gray-900">
                {formattedProfile.dietaryRestrictions}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setShowConfirmation(false)}
            variant="outline"
            className="flex-1"
          >
            Edit Information
          </Button>
          <Button
            onClick={onComplete}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Confirm & Continue
          </Button>
        </div>
      </div>
    )
  }

  if (showConfirmation) {
    return <ConfirmationStep />
  }

  if (showGreeting) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <VoiceWaterBall
            isActive={isSpeaking}
            analyser={whisperAnalyser || analyser}
            isSpeaking={isSpeaking}
          />
        </div>
        <div className="space-y-2">
          <div className="animate-pulse text-sm text-gray-600">
            {isSpeaking ? 'AI is speaking...' : 'Starting conversation...'}
          </div>
        </div>
      </div>
    )
  }

  if (manualMode) {
    return <ManualFormStep />
  }

  const emptyProfile =
    profile.age === null &&
    profile.sex === null &&
    profile.height === null &&
    profile.weight === null &&
    profile.activityLevel === null &&
    profile.goals.length === 0 &&
    profile.dietaryRestrictions.length === 0

  if (!hasStartedVoiceOnboarding && emptyProfile) {
    return <WelcomeStep />
  }

  return <DataCollectionStep />
}
