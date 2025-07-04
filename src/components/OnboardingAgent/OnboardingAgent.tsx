'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWhisperSpeechRecognition } from '@/hooks/useWhisperSpeechRecognition'
import { useEnhancedSpeechSynthesis } from '@/hooks/useEnhancedSpeechSynthesis'
import { VoiceToggleButton } from './atoms/VoiceToggleButton'
import { EnhancedOnboardingForm } from './organisms/EnhancedOnboardingForm'
import { CalorieRecommendationView } from './organisms/CalorieRecommendationView'
import { UserProfile, OnboardingAgentProps } from './types'
import {
  extractMultipleDataPoints,
  mergeExtractedData,
} from './utils/nlpProcessor'

export default function OnboardingAgent({
  userProfile,
  onComplete,
}: OnboardingAgentProps) {
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
  const [isVoiceMode, setIsVoiceMode] = useState(true)
  const [showCalorieRecommendation, setShowCalorieRecommendation] =
    useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)
  const [skipAutoListening, setSkipAutoListening] = useState(false)

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
    if (!isVoiceMode || isRecording || skipAutoListening) return

    setTimeout(async () => {
      try {
        await whisperSpeech.startRecording()
      } catch (error) {
        console.error('Failed to start auto-listening:', error)
      }
    }, 1000)
  }, [isVoiceMode, isRecording, skipAutoListening, whisperSpeech])

  const speakText = useCallback(
    async (text: string, skipAutoListen: boolean = false) => {
      if (!speechEnabled) {
        enableSpeechSynthesis()
      }

      // Set the skip flag before speaking
      setSkipAutoListening(skipAutoListen)

      try {
        await speak(text)
        if (!skipAutoListen) {
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
    [speak, speechEnabled, enableSpeechSynthesis, startListeningAfterSpeech]
  )

  const handleCompleteDataCollection = useCallback(() => {
    setShowCalorieRecommendation(true)
    if (isVoiceMode) {
      setTimeout(() => {
        speakText(
          'Great! I have all the information I need. Let me search for personalized calorie recommendations based on your profile.'
        )
      }, 500)
    }
  }, [isVoiceMode, speakText])

  const handleVoiceInput = useCallback(
    (input: string) => {
      if (input.trim()) {
        const normalizedInput = input.toLowerCase().trim()

        // Check if user is confirming information is correct
        const confirmationPhrases = [
          'yes',
          'yep',
          'yup',
          'yeah',
          'correct',
          'right',
          'good',
          'looks good',
          'thats right',
          "that's right",
          'thats correct',
          "that's correct",
          'sounds good',
          'sounds right',
          'all good',
          'perfect',
          'exactly',
          'confirmed',
          'confirm',
          'ok',
          'okay',
          'fine',
          'absolutely',
          'sure',
          'definitely',
          'for sure',
          'all set',
          'looks correct',
        ]

        const isConfirming = confirmationPhrases.some(
          (phrase) =>
            normalizedInput.includes(phrase) ||
            normalizedInput === phrase ||
            normalizedInput.startsWith(phrase + ' ') ||
            normalizedInput.endsWith(' ' + phrase)
        )

        // Check if user wants to make changes
        const changePhrases = [
          'no',
          'nope',
          'wrong',
          'incorrect',
          'change',
          'update',
          'fix',
          'modify',
          'edit',
          'not right',
          'not correct',
          "that's wrong",
          'thats wrong',
          'need to change',
          'needs fixing',
        ]

        const wantsChanges = changePhrases.some((phrase) =>
          normalizedInput.includes(phrase)
        )

        // Check if all data is complete for confirmation logic
        const isDataComplete =
          profile.age !== null &&
          profile.sex !== null &&
          profile.height !== null &&
          profile.weight !== null &&
          profile.activityLevel !== null &&
          profile.goals &&
          profile.goals.length > 0 &&
          profile.dietaryRestrictions.length > 0

        if (isDataComplete && isConfirming) {
          // User confirmed - proceed to next step
          if (isVoiceMode) {
            speakText(
              'Great! Let me create your personalized nutrition plan.',
              true
            )
          }
          handleCompleteDataCollection()
          clearTranscript()
          return
        }

        if (isDataComplete && wantsChanges) {
          // User wants to make changes
          if (isVoiceMode) {
            speakText('What would you like me to update?')
          }
          clearTranscript()
          return
        }

        // Normal data extraction logic
        const extractedData = extractMultipleDataPoints(input)
        const updatedProfile = mergeExtractedData(profile, extractedData)
        setProfile(updatedProfile)

        // Provide feedback about what was extracted
        if (Object.keys(extractedData).length > 0) {
          const extractedItems = Object.keys(extractedData).join(', ')
          console.log(`Extracted: ${extractedItems}`)

          if (isVoiceMode) {
            const feedbackMessage = `Got it! Could you confirm that the information I've collected is correct?`
            speakText(feedbackMessage)
          }
        }
      }
      clearTranscript()
    },
    [
      profile,
      clearTranscript,
      isVoiceMode,
      speakText,
      handleCompleteDataCollection,
    ]
  )

  useEffect(() => {
    if (transcript && isVoiceMode && !showCalorieRecommendation) {
      handleVoiceInput(transcript)
    }
  }, [transcript, isVoiceMode, showCalorieRecommendation, handleVoiceInput])

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await whisperSpeech.stopRecording()
    } else {
      // Reset skip flag when user manually starts recording
      setSkipAutoListening(false)
      await whisperSpeech.startRecording()
    }
  }, [isRecording, whisperSpeech])

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
        const firstName = profile.name.split(' ')[0]
        const greetingText = `Hello ${firstName}! I'm your nutrition assistant, and I'm here to learn about your health and fitness goals so I can create a personalized nutrition plan just for you. I'll show what kind of info i'm looking for in this next step and you can just say something like "I'm 25 years old, male, 6 feet tall, 180 pounds, and I'm allergic to nuts."`
        await speakText(greetingText)
      }

      setTimeout(
        () => {
          setShowGreeting(false)
        },
        isVoiceMode ? 1000 : 2000
      )
    }, 100)
  }

  if (showCalorieRecommendation) {
    return (
      <CalorieRecommendationView
        profile={profile}
        isVoiceMode={isVoiceMode}
        isSpeaking={isSpeaking}
        analyser={analyser}
        onToggleVoiceMode={() => setIsVoiceMode(!isVoiceMode)}
        onComplete={handleCalorieRecommendationComplete}
        onSpeakText={speakText}
        transcript={transcript}
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
        <EnhancedOnboardingForm
          profile={profile}
          isVoiceMode={isVoiceMode}
          showGreeting={showGreeting}
          isRecording={isRecording}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
          transcript={transcript}
          speechError={speechError}
          analyser={analyser}
          whisperAnalyser={whisperSpeech.analyser}
          onProfileUpdate={setProfile}
          onToggleRecording={toggleRecording}
          onToggleVoiceMode={() => setIsVoiceMode(!isVoiceMode)}
          onGetStarted={handleGetStarted}
          onComplete={handleCompleteDataCollection}
          onSpeakText={speakText}
          onUserInput={() => {
            // User has provided first input, follow-up logic can now activate
            console.log('User provided first input')
          }}
          onTranscriptProcessed={(transcript) => {
            console.log('Transcript processed:', transcript)
          }}
        />
      </CardContent>
    </Card>
  )
}
