'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWhisperSpeechRecognition } from '@/hooks/useWhisperSpeechRecognition'
import { useEnhancedSpeechSynthesis } from '@/hooks/useEnhancedSpeechSynthesis'
import { VoiceToggleButton } from './atoms/VoiceToggleButton'
import { OnboardingForm } from './organisms/OnboardingForm'
import { CalorieRecommendationView } from './organisms/CalorieRecommendationView'
import { UserProfile, OnboardingAgentProps } from './types'
import { QUESTIONS } from './constants'

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

  const whisperSpeech = useWhisperSpeechRecognition()
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    analyser,
  } = useEnhancedSpeechSynthesis()

  const isRecording = whisperSpeech.isRecording
  const transcript = whisperSpeech.transcript
  const isProcessing = whisperSpeech.isProcessing || false
  const speechError = whisperSpeech.error
  const clearTranscript = whisperSpeech.clearTranscript

  const enableSpeechSynthesis = useCallback(() => {
    if (!speechEnabled && 'speechSynthesis' in window) {
      const testUtterance = new SpeechSynthesisUtterance('')
      speechSynthesis.speak(testUtterance)
      speechSynthesis.cancel()
      setSpeechEnabled(true)
    }
  }, [speechEnabled])

  const startListeningAfterSpeech = useCallback(async () => {
    if (!isVoiceMode || isRecording) return

    setTimeout(async () => {
      try {
        await whisperSpeech.startRecording()
      } catch (error) {
        console.error('Failed to start auto-listening:', error)
      }
    }, 1000)
  }, [isVoiceMode, isRecording, whisperSpeech])

  const speakText = useCallback(
    async (text: string) => {
      if (!speechEnabled) {
        enableSpeechSynthesis()
      }

      try {
        await speak(text)
        if (currentQuestionIndex > 0) {
          await startListeningAfterSpeech()
        }
      } catch (error) {
        console.error('Speech synthesis error:', error)

        if (error instanceof Error && error.message.includes('not allowed')) {
          console.warn(
            'Speech synthesis requires user interaction. Please click anywhere on the page to enable voice features.'
          )
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
              typeof nextQuestion.voiceText === 'function'
                ? nextQuestion.voiceText(profile.name)
                : nextQuestion.voiceText

            console.log('textToSpeak', textToSpeak)
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

  const handleGetStarted = async () => {
    if (showGreeting) return
    enableSpeechSynthesis()
    setShowGreeting(true)

    setTimeout(async () => {
      if (isVoiceMode) {
        const currentQuestion = QUESTIONS[0]
        const greetingText =
          typeof currentQuestion.voiceText === 'function'
            ? currentQuestion.voiceText(profile.name)
            : currentQuestion.voiceText
        await speakText(greetingText)
      }

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
      )
    }, 100)
  }

  const currentQuestion = QUESTIONS[currentQuestionIndex]

  if (showCalorieRecommendation) {
    return (
      <CalorieRecommendationView
        profile={profile}
        isVoiceMode={isVoiceMode}
        isSpeaking={isSpeaking}
        analyser={analyser}
        onToggleVoiceMode={() => setIsVoiceMode(!isVoiceMode)}
        onComplete={handleCalorieRecommendationComplete}
      />
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Nutrition AI Assistant
          <VoiceToggleButton
            isVoiceMode={isVoiceMode}
            onToggle={() => setIsVoiceMode(!isVoiceMode)}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <OnboardingForm
          currentQuestion={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={QUESTIONS.length}
          profile={profile}
          textInput={textInput}
          isVoiceMode={isVoiceMode}
          showGreeting={showGreeting}
          isRecording={isRecording}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          transcript={transcript}
          speechError={speechError}
          analyser={analyser}
          whisperAnalyser={whisperSpeech.analyser}
          onTextInputChange={setTextInput}
          onSelectChange={handleAnswer}
          onTextSubmit={handleTextSubmit}
          onToggleRecording={toggleRecording}
          onUseTextInstead={() => setIsVoiceMode(false)}
          onGetStarted={handleGetStarted}
        />
      </CardContent>
    </Card>
  )
}
