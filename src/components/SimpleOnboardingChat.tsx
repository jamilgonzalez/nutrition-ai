'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from '@/components/ui/kibo-ui/ai/conversation'
import {
  AIInput,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
  AIInputSubmit,
  AIInputButton,
} from '@/components/ui/kibo-ui/ai/input'
import {
  AIMessage,
  AIMessageContent,
  AIMessageAvatar,
} from '@/components/ui/kibo-ui/ai/message'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

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

interface SimpleOnboardingChatProps {
  userProfile: {
    firstName?: string
    lastName?: string
  }
  onComplete: (profile: UserProfile) => void
  userId: string
}

export default function SimpleOnboardingChat({
  userProfile,
  onComplete,
  userId,
}: SimpleOnboardingChatProps) {
  const [input, setInput] = useState('')
  const { user } = useUser()
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

  const {
    isRecording,
    transcript,
    speechSupported,
    toggleRecording,
    clearTranscript,
  } = useSpeechRecognition()

  const { messages, append, isLoading, stop } = useChat({
    api: '/api/onboarding',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hi ${
          userProfile.firstName || 'there'
        }! I'm your nutrition assistant. I need to gather some basic information to create your personalized nutrition plan. Just chat with me naturally and I'll ask follow-up questions as needed.

Let's start - could you tell me your age, height, weight, and activity level?`,
      },
    ],
    onFinish: (message) => {
      // Check if the assistant has indicated completion
      if (message.content.includes('ONBOARDING_COMPLETE:')) {
        try {
          const jsonStr = message.content.split('ONBOARDING_COMPLETE:')[1]
          const completedProfile = JSON.parse(jsonStr)
          onComplete(completedProfile)
        } catch (error) {
          console.error('Error parsing completed profile:', error)
        }
      }
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const messageText = input.trim() || transcript.trim()
    if (!messageText) return

    await append({
      role: 'user',
      content: messageText,
    })
    setInput('')
    clearTranscript()
  }

  const getSubmitStatus = () => {
    if (isLoading) return 'streaming'
    return 'ready'
  }

  const displayText = input || transcript

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex flex-col">
        <AIConversation className="flex-1">
          <AIConversationContent>
            {messages.map((message) => (
              <AIMessage
                key={message.id}
                from={message.role === 'user' ? 'user' : 'assistant'}
              >
                <AIMessageContent>{message.content}</AIMessageContent>
                <AIMessageAvatar
                  src={
                    message.role === 'user'
                      ? user?.imageUrl || '/user-avatar.png'
                      : '/ai-avatar.png'
                  }
                  name={
                    message.role === 'user' ? user?.firstName || 'You' : 'AI'
                  }
                />
              </AIMessage>
            ))}
          </AIConversationContent>
          <AIConversationScrollButton />
        </AIConversation>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 z-50">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1">
            <AIInput onSubmit={handleSubmit}>
              <AIInputTextarea
                value={displayText}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell me about your nutrition goals..."
                disabled={isLoading || isRecording}
                minHeight={48}
                maxHeight={120}
              />
              <AIInputToolbar>
                <AIInputTools>
                  {speechSupported && (
                    <AIInputButton
                      onClick={toggleRecording}
                      disabled={isLoading}
                      variant={isRecording ? 'default' : 'ghost'}
                    >
                      {isRecording ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </AIInputButton>
                  )}
                </AIInputTools>
                <AIInputSubmit
                  status={getSubmitStatus()}
                  disabled={isLoading || !displayText.trim()}
                  onClick={isLoading ? stop : undefined}
                />
              </AIInputToolbar>
            </AIInput>
          </div>
        </div>
      </div>

      <div className="h-24" />
    </div>
  )
}
