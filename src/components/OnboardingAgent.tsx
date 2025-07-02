'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { useWhisperSpeechRecognition } from '@/hooks/useWhisperSpeechRecognition'
import { useEnhancedSpeechSynthesis } from '@/hooks/useEnhancedSpeechSynthesis'
import { WebSearch } from '@/components/WebSearch'
import VoiceWaterBall from '@/components/VoiceWaterBall'

interface UserProfile {
  name: string
  age: number | null
  sex: 'male' | 'female' | 'other' | null
  height: number | null
  weight: number | null
  activityLevel:
    | 'sedentary'
    | 'light'
    | 'moderate'
    | 'active'
    | 'very_active'
    | null
  goals: string[]
  healthConditions: string[]
  dietaryRestrictions: string[]
}

interface OnboardingAgentProps {
  userProfile: { firstName?: string; lastName?: string }
  onComplete: (profile: UserProfile) => void
}

const QUESTIONS = [
  {
    id: 'welcome',
    type: 'welcome',
    text: (name: string) =>
      `Hello ${
        name.split(' ')[0]
      }! I'm here to help create your personalized nutrition plan. Let's start by getting to know you better.`,
    voiceText: (name: string) =>
      `Hello ${
        name.split(' ')[0]
      }! I'm your nutrition AI assistant. I'm here to help create a personalized nutrition plan just for you. Let's start by getting to know you better. First, could you tell me your age?`,
  },
  {
    id: 'age',
    type: 'number',
    text: 'How old are you?',
    voiceText: 'How old are you?',
    field: 'age',
  },
  {
    id: 'sex',
    type: 'select',
    text: 'What is your biological sex?',
    voiceText:
      'What is your biological sex? You can say male, female, or other.',
    field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'height',
    type: 'number',
    text: 'What is your height in inches?',
    voiceText: 'What is your height in inches?',
    field: 'height',
  },
  {
    id: 'weight',
    type: 'number',
    text: 'What is your current weight in pounds?',
    voiceText: 'What is your current weight in pounds?',
    field: 'weight',
  },
  {
    id: 'activity',
    type: 'select',
    text: 'How would you describe your activity level?',
    voiceText:
      'How would you describe your activity level? You can say sedentary, light, moderate, active, or very active.',
    field: 'activityLevel',
    options: [
      { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
      { value: 'light', label: 'Light (1-3 days per week)' },
      { value: 'moderate', label: 'Moderate (3-5 days per week)' },
      { value: 'active', label: 'Active (6-7 days per week)' },
      { value: 'very_active', label: 'Very Active (twice per day)' },
    ],
  },
  {
    id: 'goals',
    type: 'text',
    text: 'What are your health and fitness goals?',
    voiceText:
      'What are your health and fitness goals? For example, weight loss, muscle gain, maintaining current weight, or improving overall health.',
    field: 'goals',
  },
  {
    id: 'health',
    type: 'text',
    text: 'Do you have any health conditions I should know about?',
    voiceText:
      'Do you have any health conditions I should know about? This could include diabetes, heart conditions, food allergies, or anything else relevant to your nutrition.',
    field: 'healthConditions',
  },
  {
    id: 'dietary',
    type: 'text',
    text: 'Do you have any dietary restrictions or preferences?',
    voiceText:
      'Do you have any dietary restrictions or preferences? For example, vegetarian, vegan, keto, gluten-free, or any foods you avoid.',
    field: 'dietaryRestrictions',
  },
]

export default function OnboardingAgent({
  userProfile,
  onComplete,
}: OnboardingAgentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [profile, setProfile] = useState<UserProfile>({
    name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
    age: null,
    sex: null,
    height: null,
    weight: null,
    activityLevel: null,
    goals: [],
    healthConditions: [],
    dietaryRestrictions: [],
  })
  const [textInput, setTextInput] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(true)
  const [showCalorieRecommendation, setShowCalorieRecommendation] =
    useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)

  // Whisper speech recognition
  const whisperSpeech = useWhisperSpeechRecognition()

  // Enhanced speech synthesis with audio analysis
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    analyser,
  } = useEnhancedSpeechSynthesis()

  // Whisper speech recognition state
  const isRecording = whisperSpeech.isRecording
  const transcript = whisperSpeech.transcript
  const isProcessing = whisperSpeech.isProcessing || false
  const speechError = whisperSpeech.error
  const clearTranscript = whisperSpeech.clearTranscript

  // Enable speech synthesis on first user interaction
  const enableSpeechSynthesis = useCallback(() => {
    if (!speechEnabled && 'speechSynthesis' in window) {
      // Test speech synthesis to enable it
      const testUtterance = new SpeechSynthesisUtterance('')
      speechSynthesis.speak(testUtterance)
      speechSynthesis.cancel()
      setSpeechEnabled(true)
    }
  }, [speechEnabled])

  // Auto start listening after speech ends
  const startListeningAfterSpeech = useCallback(async () => {
    if (!isVoiceMode || isRecording) return

    // Small delay to ensure speech has fully ended
    setTimeout(async () => {
      try {
        await whisperSpeech.startRecording()
      } catch (error) {
        console.error('Failed to start auto-listening:', error)
      }
    }, 500)
  }, [isVoiceMode, isRecording, whisperSpeech])

  const speakText = useCallback(
    async (text: string) => {
      if (isSpeaking) {
        stopSpeaking()
        return
      }

      // Enable speech synthesis if not already enabled
      if (!speechEnabled) {
        enableSpeechSynthesis()
      }

      try {
        await speak(text)
        // Automatically start listening after speech ends (only for non-welcome questions)
        if (currentQuestionIndex > 0) {
          await startListeningAfterSpeech()
        }
      } catch (error) {
        console.error('Speech synthesis error:', error)

        // If speech synthesis fails due to not-allowed, show a user-friendly message
        if (error instanceof Error && error.message.includes('not allowed')) {
          console.warn(
            'Speech synthesis requires user interaction. Please click anywhere on the page to enable voice features.'
          )
          // You could also show a toast notification or other UI feedback here
        }
      }
    },
    [
      speak,
      isSpeaking,
      stopSpeaking,
      speechEnabled,
      enableSpeechSynthesis,
      startListeningAfterSpeech,
      currentQuestionIndex,
    ]
  )

  // Speech synthesis will be enabled when user clicks "Let's Get Started"

  useEffect(() => {
    if (currentQuestionIndex === 0 && isVoiceMode && speechEnabled) {
      const question = QUESTIONS[0]
      const text =
        typeof question.voiceText === 'function'
          ? question.voiceText(profile.name)
          : question.voiceText
      // Delay to ensure speech synthesis is fully ready
      setTimeout(() => {
        speakText(text)
      }, 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, isVoiceMode, profile.name, speechEnabled]) // speakText intentionally omitted to prevent infinite loop

  const handleAnswer = useCallback(
    (answer: string | number) => {
      const currentQuestion = QUESTIONS[currentQuestionIndex]

      if (currentQuestion.field) {
        const field = currentQuestion.field as keyof UserProfile
        if (
          field === 'goals' ||
          field === 'healthConditions' ||
          field === 'dietaryRestrictions'
        ) {
          const items =
            typeof answer === 'string'
              ? answer
                  .split(',')
                  .map((s) => s.trim())
                  .filter((s) => s)
              : [answer]
          setProfile((prev) => ({ ...prev, [field]: items }))
        } else {
          setProfile((prev) => ({ ...prev, [field]: answer }))
        }
      }

      if (currentQuestionIndex < QUESTIONS.length - 1) {
        const nextIndex = currentQuestionIndex + 1
        setCurrentQuestionIndex(nextIndex)
        setTextInput('')

        if (isVoiceMode) {
          setTimeout(async () => {
            const nextQuestion = QUESTIONS[nextIndex]
            const textToSpeak =
              typeof nextQuestion.text === 'function'
                ? nextQuestion.text(profile.name)
                : nextQuestion.text
            await speakText(textToSpeak)
          }, 500)
        }
      } else {
        setShowCalorieRecommendation(true)
        if (isVoiceMode) {
          setTimeout(() => {
            speakText(
              'Great! I have all the information I need. Let me search for personalized calorie recommendations based on your profile.'
            )
          }, 500)
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [currentQuestionIndex]
  )

  const handleVoiceInput = useCallback(
    (input: string) => {
      const currentQuestion = QUESTIONS[currentQuestionIndex]
      const normalizedInput = input.toLowerCase().trim()

      if (currentQuestion.type === 'number') {
        const number = parseFloat(normalizedInput.replace(/[^\d.]/g, ''))
        if (!isNaN(number)) {
          handleAnswer(number)
        }
      } else if (currentQuestion.type === 'select' && currentQuestion.options) {
        const matchedOption = currentQuestion.options.find(
          (option) =>
            normalizedInput.includes(option.label.toLowerCase()) ||
            normalizedInput.includes(option.value.toLowerCase())
        )
        if (matchedOption) {
          handleAnswer(matchedOption.value)
        }
      } else if (currentQuestion.type === 'text') {
        if (normalizedInput.length > 0) {
          handleAnswer(normalizedInput)
        }
      }

      clearTranscript()
    },
    [currentQuestionIndex, clearTranscript, handleAnswer]
  )

  useEffect(() => {
    if (transcript && isVoiceMode) {
      handleVoiceInput(transcript)
    }
  }, [transcript, isVoiceMode, handleVoiceInput])

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await whisperSpeech.stopRecording()
    } else {
      await whisperSpeech.startRecording()
    }
  }, [isRecording, whisperSpeech])

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      // Stop any active recording since user is manually inputting
      if (isRecording) {
        whisperSpeech.stopRecording()
      }
      handleAnswer(textInput.trim())
    }
  }

  const handleCalorieRecommendationComplete = () => {
    if (isVoiceMode) {
      speakText(
        'Perfect! Your nutritional profile is now complete. You can start tracking your meals and I&apos;ll provide personalized recommendations based on your goals.'
      )
    }
    onComplete(profile)
  }

  const currentQuestion = QUESTIONS[currentQuestionIndex]
  const userName = profile.name || 'there'

  const getQuestionText = (question: (typeof QUESTIONS)[0], name: string) => {
    if (question.type === 'welcome' && typeof question.text === 'function') {
      return question.text(name)
    }
    return typeof question.text === 'function'
      ? question.text(name)
      : question.text
  }

  if (showCalorieRecommendation) {
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVoiceMode(!isVoiceMode)}
            >
              {isVoiceMode ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Voice Water Ball Visualization */}
            <div className="flex justify-center">
              <VoiceWaterBall
                isActive={isVoiceMode}
                analyser={analyser}
                isSpeaking={isSpeaking}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Your Profile Summary:</h3>
              <p>
                <strong>Age:</strong> {profile.age} years
              </p>
              <p>
                <strong>Sex:</strong> {profile.sex}
              </p>
              <p>
                <strong>Height:</strong> {profile.height} inches
              </p>
              <p>
                <strong>Weight:</strong> {profile.weight} lbs
              </p>
              <p>
                <strong>Activity Level:</strong> {profile.activityLevel}
              </p>
              <p>
                <strong>Goals:</strong> {profile.goals.join(', ')}
              </p>
              {profile.healthConditions.length > 0 && (
                <p>
                  <strong>Health Conditions:</strong>{' '}
                  {profile.healthConditions.join(', ')}
                </p>
              )}
              {profile.dietaryRestrictions.length > 0 && (
                <p>
                  <strong>Dietary Restrictions:</strong>{' '}
                  {profile.dietaryRestrictions.join(', ')}
                </p>
              )}
            </div>

            <WebSearch
              query={searchQuery}
              onComplete={handleCalorieRecommendationComplete}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Nutrition AI Assistant
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVoiceMode(!isVoiceMode)}
            >
              {isVoiceMode ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Voice Water Ball Visualization */}
            <div className="flex justify-center">
              <VoiceWaterBall
                isActive={isVoiceMode && (isRecording || isSpeaking)}
                analyser={whisperSpeech.analyser || analyser}
                isSpeaking={isSpeaking}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-lg">
                {showGreeting && currentQuestion.type === 'welcome'
                  ? typeof currentQuestion.voiceText === 'function'
                    ? currentQuestion.voiceText(userName)
                    : currentQuestion.voiceText
                  : getQuestionText(currentQuestion, userName)}
              </p>
            </div>

            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {QUESTIONS.length}
            </div>

            {currentQuestion.type === 'welcome' ? (
              <div className="space-y-4">
                {!showGreeting ? (
                  <Button
                    onClick={async () => {
                      enableSpeechSynthesis()
                      setShowGreeting(true)

                      // Show the greeting text first
                      setTimeout(async () => {
                        if (isVoiceMode) {
                          const greetingText =
                            typeof currentQuestion.voiceText === 'function'
                              ? currentQuestion.voiceText(profile.name)
                              : currentQuestion.voiceText
                          await speakText(greetingText)
                        }

                        // Then move to the first actual question
                        setTimeout(
                          async () => {
                            setCurrentQuestionIndex(1)
                            setShowGreeting(false)

                            if (isVoiceMode) {
                              const question = QUESTIONS[1]
                              const textToSpeak =
                                typeof question.text === 'function'
                                  ? question.text(profile.name)
                                  : question.text
                              await speakText(textToSpeak)
                            }
                          },
                          isVoiceMode ? 1000 : 2000
                        ) // Give time to read if not voice mode
                      }, 100)
                    }}
                    className="w-full"
                  >
                    Let&apos;s Get Started
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
                    {currentQuestion.type === 'select' &&
                    currentQuestion.options ? (
                      <Select onValueChange={handleAnswer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentQuestion.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          type={
                            currentQuestion.type === 'number'
                              ? 'number'
                              : 'text'
                          }
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === 'Enter' && handleTextSubmit()
                          }
                          placeholder={
                            currentQuestion.type === 'number'
                              ? 'Enter number'
                              : 'Type your answer'
                          }
                        />
                        <Button onClick={handleTextSubmit} className="w-full">
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {isVoiceMode && (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={toggleRecording}
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
                    </div>

                    {isRecording && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-pulse rounded-full h-3 w-3 bg-red-500"></div>
                        <span className="text-sm text-red-600">
                          Recording with Whisper...
                        </span>
                      </div>
                    )}

                    {!isRecording && !isSpeaking && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="rounded-full h-3 w-3 bg-green-500"></div>
                        <span className="text-sm text-green-600">
                          Ready - I'll start listening after I finish speaking
                        </span>
                      </div>
                    )}

                    {isProcessing && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                        <span className="text-sm text-blue-600">
                          Processing speech...
                        </span>
                      </div>
                    )}

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
                      <Button
                        variant="outline"
                        onClick={() => setIsVoiceMode(false)}
                        size="sm"
                      >
                        Use Text Instead
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
