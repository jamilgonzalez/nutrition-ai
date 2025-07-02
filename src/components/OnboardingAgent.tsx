'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useWhisperSpeechRecognition } from '@/hooks/useWhisperSpeechRecognition'
import { useEnhancedSpeechSynthesis } from '@/hooks/useEnhancedSpeechSynthesis'
import { WebSearch } from '@/components/WebSearch'
import VoiceWaterBall from '@/components/VoiceWaterBall'
import VoiceSettings from '@/components/VoiceSettings'

interface UserProfile {
  name: string
  age: number | null
  sex: 'male' | 'female' | 'other' | null
  height: number | null
  weight: number | null
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
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
    text: (name: string) => `Hello ${name}! I'm here to help create your personalized nutrition plan. Let's start by getting to know you better.`,
    voiceText: (name: string) => `Hello ${name}! I'm your nutrition AI assistant. I'm here to help create a personalized nutrition plan just for you. Let's start by getting to know you better. First, could you tell me your age?`
  },
  {
    id: 'age',
    type: 'number',
    text: 'How old are you?',
    voiceText: 'How old are you?',
    field: 'age'
  },
  {
    id: 'sex',
    type: 'select',
    text: 'What is your biological sex?',
    voiceText: 'What is your biological sex? You can say male, female, or other.',
    field: 'sex',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]
  },
  {
    id: 'height',
    type: 'number',
    text: 'What is your height in inches?',
    voiceText: 'What is your height in inches?',
    field: 'height'
  },
  {
    id: 'weight',
    type: 'number',
    text: 'What is your current weight in pounds?',
    voiceText: 'What is your current weight in pounds?',
    field: 'weight'
  },
  {
    id: 'activity',
    type: 'select',
    text: 'How would you describe your activity level?',
    voiceText: 'How would you describe your activity level? You can say sedentary, light, moderate, active, or very active.',
    field: 'activityLevel',
    options: [
      { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
      { value: 'light', label: 'Light (1-3 days per week)' },
      { value: 'moderate', label: 'Moderate (3-5 days per week)' },
      { value: 'active', label: 'Active (6-7 days per week)' },
      { value: 'very_active', label: 'Very Active (twice per day)' }
    ]
  },
  {
    id: 'goals',
    type: 'text',
    text: 'What are your health and fitness goals?',
    voiceText: 'What are your health and fitness goals? For example, weight loss, muscle gain, maintaining current weight, or improving overall health.',
    field: 'goals'
  },
  {
    id: 'health',
    type: 'text',
    text: 'Do you have any health conditions I should know about?',
    voiceText: 'Do you have any health conditions I should know about? This could include diabetes, heart conditions, food allergies, or anything else relevant to your nutrition.',
    field: 'healthConditions'
  },
  {
    id: 'dietary',
    type: 'text',
    text: 'Do you have any dietary restrictions or preferences?',
    voiceText: 'Do you have any dietary restrictions or preferences? For example, vegetarian, vegan, keto, gluten-free, or any foods you avoid.',
    field: 'dietaryRestrictions'
  }
]

export default function OnboardingAgent({ userProfile, onComplete }: OnboardingAgentProps) {
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
    dietaryRestrictions: []
  })
  const [textInput, setTextInput] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(true)
  const [showCalorieRecommendation, setShowCalorieRecommendation] = useState(false)
  const [useWhisper, setUseWhisper] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Browser speech recognition (fallback)
  const browserSpeech = useSpeechRecognition()
  
  // Whisper speech recognition (preferred)
  const whisperSpeech = useWhisperSpeechRecognition()
  
  // Enhanced speech synthesis with audio analysis
  const { speak, stop: stopSpeaking, isSpeaking, analyser } = useEnhancedSpeechSynthesis()
  
  // Use Whisper or fallback to browser speech recognition
  const isRecording = useWhisper ? whisperSpeech.isRecording : browserSpeech.isRecording
  const transcript = useWhisper ? whisperSpeech.transcript : browserSpeech.transcript
  const isProcessing = useWhisper ? (whisperSpeech.isProcessing || false) : false
  const speechError = useWhisper ? whisperSpeech.error : null
  const clearTranscript = useWhisper ? whisperSpeech.clearTranscript : browserSpeech.clearTranscript

  const speakText = useCallback(async (text: string) => {
    if (isSpeaking) {
      stopSpeaking()
      return
    }
    
    try {
      await speak(text)
    } catch (error) {
      console.error('Speech synthesis error:', error)
    }
  }, [speak, isSpeaking, stopSpeaking])

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUseWhisper = localStorage.getItem('useWhisper') === 'true'
      setUseWhisper(savedUseWhisper)
    }
  }, [])

  // Toggle between Whisper and browser speech recognition
  const toggleSpeechRecognition = useCallback(() => {
    const newValue = !useWhisper
    setUseWhisper(newValue)
    if (typeof window !== 'undefined') {
      localStorage.setItem('useWhisper', newValue.toString())
    }
    clearTranscript()
  }, [useWhisper, clearTranscript])

  useEffect(() => {
    if (currentQuestionIndex === 0 && isVoiceMode) {
      const question = QUESTIONS[0]
      const text = typeof question.voiceText === 'function' 
        ? question.voiceText(profile.name) 
        : question.voiceText
      speakText(text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, isVoiceMode, profile.name]) // speakText intentionally omitted to prevent infinite loop

  const handleAnswer = useCallback((answer: string | number) => {
    const currentQuestion = QUESTIONS[currentQuestionIndex]
    
    if (currentQuestion.field) {
      const field = currentQuestion.field as keyof UserProfile
      if (field === 'goals' || field === 'healthConditions' || field === 'dietaryRestrictions') {
        const items = typeof answer === 'string' ? answer.split(',').map(s => s.trim()).filter(s => s) : [answer]
        setProfile(prev => ({ ...prev, [field]: items }))
      } else {
        setProfile(prev => ({ ...prev, [field]: answer }))
      }
    }

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIndex)
      setTextInput('')
      
      if (isVoiceMode) {
        setTimeout(() => {
          const nextQuestion = QUESTIONS[nextIndex]
          const textToSpeak = typeof nextQuestion.text === 'function' 
            ? nextQuestion.text(profile.name) 
            : nextQuestion.text
          speakText(textToSpeak)
        }, 500)
      }
    } else {
      setShowCalorieRecommendation(true)
      if (isVoiceMode) {
        setTimeout(() => {
          speakText("Great! I have all the information I need. Let me search for personalized calorie recommendations based on your profile.")
        }, 500)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [currentQuestionIndex])

  const handleVoiceInput = useCallback((input: string) => {
    const currentQuestion = QUESTIONS[currentQuestionIndex]
    const normalizedInput = input.toLowerCase().trim()

    if (currentQuestion.type === 'number') {
      const number = parseFloat(normalizedInput.replace(/[^\d.]/g, ''))
      if (!isNaN(number)) {
        handleAnswer(number)
      }
    } else if (currentQuestion.type === 'select' && currentQuestion.options) {
      const matchedOption = currentQuestion.options.find(option => 
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
  }, [currentQuestionIndex, clearTranscript, handleAnswer])

  useEffect(() => {
    if (transcript && isVoiceMode) {
      handleVoiceInput(transcript)
    }
  }, [transcript, isVoiceMode, handleVoiceInput])

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      if (useWhisper) {
        await whisperSpeech.stopRecording()
      } else {
        browserSpeech.toggleRecording()
      }
    } else {
      if (useWhisper) {
        await whisperSpeech.startRecording()
      } else {
        browserSpeech.toggleRecording()
      }
    }
  }, [isRecording, useWhisper, whisperSpeech, browserSpeech])

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      handleAnswer(textInput.trim())
    }
  }

  const handleCalorieRecommendationComplete = () => {
    if (isVoiceMode) {
      speakText("Perfect! Your nutritional profile is now complete. You can start tracking your meals and I&apos;ll provide personalized recommendations based on your goals.")
    }
    onComplete(profile)
  }

  const currentQuestion = QUESTIONS[currentQuestionIndex]
  const userName = profile.name || 'there'
  
  const getQuestionText = (question: typeof QUESTIONS[0], name: string) => {
    if (question.type === 'welcome' && typeof question.text === 'function') {
      return question.text(name)
    }
    return typeof question.text === 'function' ? question.text(name) : question.text
  }

  if (showCalorieRecommendation) {
    const searchQuery = `daily calorie needs ${profile.age} year old ${profile.sex} ${profile.height} inches ${profile.weight} pounds ${profile.activityLevel} activity level ${profile.goals.join(' ')}`
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Personalized Calorie Recommendations
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVoiceMode(!isVoiceMode)}
              >
                {isVoiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSpeechRecognition}
                title="Toggle between Whisper and Browser Speech Recognition"
              >
                {useWhisper ? '🎯' : '🗣️'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                title="Voice Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              {isSpeaking && (
                <Button variant="outline" size="sm" onClick={stopSpeaking}>
                  Stop Speaking
                </Button>
              )}
            </div>
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
              <p><strong>Age:</strong> {profile.age} years</p>
              <p><strong>Sex:</strong> {profile.sex}</p>
              <p><strong>Height:</strong> {profile.height} inches</p>
              <p><strong>Weight:</strong> {profile.weight} lbs</p>
              <p><strong>Activity Level:</strong> {profile.activityLevel}</p>
              <p><strong>Goals:</strong> {profile.goals.join(', ')}</p>
              {profile.healthConditions.length > 0 && (
                <p><strong>Health Conditions:</strong> {profile.healthConditions.join(', ')}</p>
              )}
              {profile.dietaryRestrictions.length > 0 && (
                <p><strong>Dietary Restrictions:</strong> {profile.dietaryRestrictions.join(', ')}</p>
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVoiceMode(!isVoiceMode)}
              >
                {isVoiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSpeechRecognition}
                title="Toggle between Whisper and Browser Speech Recognition"
              >
                {useWhisper ? '🎯' : '🗣️'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                title="Voice Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              {isSpeaking && (
                <Button variant="outline" size="sm" onClick={stopSpeaking}>
                  Stop Speaking
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Voice Water Ball Visualization */}
            <div className="flex justify-center">
              <VoiceWaterBall 
                isActive={isVoiceMode && (isRecording || isSpeaking)}
                analyser={useWhisper ? whisperSpeech.analyser : analyser}
                isSpeaking={isSpeaking}
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-lg">
                {getQuestionText(currentQuestion, userName)}
              </p>
            </div>

            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {QUESTIONS.length}
            </div>

            {currentQuestion.type === 'welcome' ? (
              <Button onClick={() => setCurrentQuestionIndex(1)} className="w-full">
                Let&apos;s Get Started
              </Button>
            ) : (
              <>
                {currentQuestion.type === 'number' && (
                  <div className="space-y-2">
                    <Label htmlFor="numberInput">{getQuestionText(currentQuestion, userName)}</Label>
                    <Input
                      id="numberInput"
                      type="number"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                      placeholder="Enter number"
                    />
                  </div>
                )}

                {currentQuestion.type === 'select' && currentQuestion.options && (
                  <div className="space-y-2">
                    <Label>{getQuestionText(currentQuestion, userName)}</Label>
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
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <div className="space-y-2">
                    <Label htmlFor="textInput">{getQuestionText(currentQuestion, userName)}</Label>
                    <Input
                      id="textInput"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                      placeholder="Type your answer"
                    />
                  </div>
                )}

                {!isVoiceMode && (
                  <Button onClick={handleTextSubmit} className="w-full">
                    Next
                  </Button>
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
                            {useWhisper ? 'Stop Recording' : 'Stop Recording'}
                          </>
                        ) : isProcessing ? (
                          <>
                            <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5 mr-2" />
                            {useWhisper ? 'Start Whisper' : 'Start Recording'}
                          </>
                        )}
                      </Button>
                    </div>

                    {(isRecording || (browserSpeech.isListening && !useWhisper)) && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-pulse rounded-full h-3 w-3 bg-red-500"></div>
                        <span className="text-sm text-red-600">
                          {useWhisper ? 'Recording with Whisper...' : 'Listening...'}
                        </span>
                      </div>
                    )}
                    
                    {isProcessing && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                        <span className="text-sm text-blue-600">Processing speech...</span>
                      </div>
                    )}

                    {transcript && (
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm">
                          <strong>You said:</strong> {transcript}
                          {useWhisper && <span className="ml-2 text-xs text-blue-600">(via Whisper)</span>}
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
                        Switch to Text Input
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <VoiceSettings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  )
}