# TICKET-013: Enhanced Chat Interface

**Priority**: Low  
**Estimate**: 4-5 hours  
**Dependencies**: TICKET-009 (Intent Classification), TICKET-010 (Nutrition Coach API)  
**Assignee**: TBD  

## Description
Enhance the chat interface to seamlessly integrate nutrition coaching with meal analysis. Add intelligent routing, conversation context, and improved user experience features like suggested responses and coaching indicators.

## Acceptance Criteria
- [ ] Seamless integration of coaching and meal analysis in chat
- [ ] Intent classification with user feedback for corrections
- [ ] Suggested responses for common questions
- [ ] Conversation context indicators
- [ ] Enhanced loading states and typing indicators
- [ ] Chat history with categorized conversations

## Files to Create/Modify
- `src/components/MealChatInput/EnhancedChatInput.tsx` (new)
- `src/components/Chat/ConversationContext.tsx` (new)
- `src/components/Chat/SuggestedResponses.tsx` (new)
- `src/components/Chat/IntentIndicator.tsx` (new)
- `src/app/api/chat/route.ts` (modify for intelligent routing)

## Implementation Details

### 1. Enhanced Chat Input Component
```typescript
// src/components/MealChatInput/EnhancedChatInput.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Mic, Send, Paperclip, Bot, Utensils, MessageCircle } from 'lucide-react'
import { classifyMessageIntent } from '@/lib/ai/intentClassification'
import SuggestedResponses from '../Chat/SuggestedResponses'
import IntentIndicator from '../Chat/IntentIndicator'
import ConversationContext from '../Chat/ConversationContext'

interface EnhancedChatInputProps {
  onSendMessage: (message: string, image?: File, intent?: string) => void
  disabled?: boolean
  isLoading?: boolean
  isSavingMeal?: boolean
  showSaveSuccess?: boolean
}

export default function EnhancedChatInput({
  onSendMessage,
  disabled = false,
  isLoading = false,
  isSavingMeal = false,
  showSaveSuccess = false
}: EnhancedChatInputProps) {
  const [message, setMessage] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [predictedIntent, setPredictedIntent] = useState<{
    intent: string
    confidence: number
  } | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [conversationMode, setConversationMode] = useState<'auto' | 'coaching' | 'meal_analysis'>('auto')
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Predict intent as user types (debounced)
  useEffect(() => {
    if (!message.trim() || message.length < 10) {
      setPredictedIntent(null)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const classification = await classifyMessageIntent(message, { hasImage: !!selectedImage })
        if (classification.confidence > 60) {
          setPredictedIntent({
            intent: classification.intent,
            confidence: classification.confidence
          })
        }
      } catch (error) {
        // Ignore prediction errors
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(timer)
  }, [message, selectedImage])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return

    const finalIntent = conversationMode === 'auto' 
      ? predictedIntent?.intent 
      : conversationMode

    onSendMessage(message, selectedImage || undefined, finalIntent)
    
    // Reset form
    setMessage('')
    setSelectedImage(null)
    setPredictedIntent(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setMessage(suggestion)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'coaching':
        return <Bot className="w-4 h-4" />
      case 'meal_analysis':
        return <Utensils className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'coaching':
        return 'bg-blue-100 text-blue-800'
      case 'meal_analysis':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="border-t bg-white p-4">
      {/* Conversation Context */}
      <ConversationContext />

      {/* Suggested Responses */}
      {showSuggestions && (
        <SuggestedResponses 
          onSelect={handleSuggestionSelect}
          onClose={() => setShowSuggestions(false)}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-3">
        {/* Intent Prediction & Mode Selection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {predictedIntent && conversationMode === 'auto' && (
              <IntentIndicator
                intent={predictedIntent.intent}
                confidence={predictedIntent.confidence}
              />
            )}
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={conversationMode === 'auto' ? 'default' : 'outline'}
              onClick={() => setConversationMode('auto')}
              className="text-xs"
            >
              Auto
            </Button>
            <Button
              size="sm"
              variant={conversationMode === 'coaching' ? 'default' : 'outline'}
              onClick={() => setConversationMode('coaching')}
              className="text-xs"
            >
              <Bot className="w-3 h-3 mr-1" />
              Coach
            </Button>
            <Button
              size="sm"
              variant={conversationMode === 'meal_analysis' ? 'default' : 'outline'}
              onClick={() => setConversationMode('meal_analysis')}
              className="text-xs"
            >
              <Utensils className="w-3 h-3 mr-1" />
              Meal
            </Button>
          </div>
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Selected meal"
              className="w-12 h-12 object-cover rounded"
            />
            <span className="text-sm text-gray-600 flex-1">
              {selectedImage.name}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedImage(null)}
            >
              Remove
            </Button>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                conversationMode === 'coaching' 
                  ? "Ask about your nutrition goals, energy levels, or any concerns..."
                  : conversationMode === 'meal_analysis'
                  ? "Describe your meal or upload a photo..."
                  : "Type a message or upload a meal photo..."
              }
              disabled={disabled || isLoading}
              className="min-h-[60px] max-h-32 resize-none pr-12"
              rows={1}
            />
            
            {/* Suggestion Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="absolute right-2 bottom-2 w-8 h-8 p-0"
              disabled={disabled}
            >
              💡
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {/* Image Upload */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isLoading}
              className="w-12 h-12 p-0"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={disabled || isLoading || (!message.trim() && !selectedImage)}
              className="w-12 h-12 p-0"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {isSavingMeal && (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Saving meal...
              </span>
            )}
            {showSaveSuccess && (
              <span className="text-green-600">✓ Meal saved successfully!</span>
            )}
          </div>
          
          <div>
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  )
}
```

### 2. Suggested Responses Component
```typescript
// src/components/Chat/SuggestedResponses.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface SuggestedResponsesProps {
  onSelect: (suggestion: string) => void
  onClose: () => void
}

const SUGGESTIONS = {
  coaching: [
    "I feel tired after lunch every day",
    "I'm not losing weight despite being in a calorie deficit",
    "Should I increase my protein intake?",
    "My energy levels are low lately",
    "I'm having trouble hitting my macro targets",
    "I feel hungry all the time"
  ],
  meal_analysis: [
    "I had eggs and toast for breakfast",
    "What's in this salad?",
    "I ate a chicken sandwich for lunch",
    "Grilled salmon with vegetables",
    "Homemade pizza slice",
    "Greek yogurt with berries"
  ],
  general: [
    "How do I set my nutrition goals?",
    "Can you explain macronutrients?",
    "What's a healthy daily calorie intake?",
    "How accurate is the meal analysis?",
    "Can I track multiple meals per day?",
    "How do I export my nutrition data?"
  ]
}

export default function SuggestedResponses({ onSelect, onClose }: SuggestedResponsesProps) {
  return (
    <Card className="mb-4 border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Suggested questions</h4>
          <Button size="sm" variant="ghost" onClick={onClose} className="w-6 h-6 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {/* Coaching Suggestions */}
          <div>
            <h5 className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              🤖 Nutrition Coaching
            </h5>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.coaching.map((suggestion, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => onSelect(suggestion)}
                  className="text-xs h-8 bg-white hover:bg-blue-50"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Meal Analysis Suggestions */}
          <div>
            <h5 className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              🍽️ Meal Analysis
            </h5>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.meal_analysis.map((suggestion, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => onSelect(suggestion)}
                  className="text-xs h-8 bg-white hover:bg-green-50"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* General Questions */}
          <div>
            <h5 className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              ❓ General Questions
            </h5>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.general.map((suggestion, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => onSelect(suggestion)}
                  className="text-xs h-8 bg-white hover:bg-gray-50"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Intent Indicator Component
```typescript
// src/components/Chat/IntentIndicator.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Bot, Utensils, MessageCircle, AlertCircle } from 'lucide-react'

interface IntentIndicatorProps {
  intent: string
  confidence: number
  onCorrect?: (correctIntent: string) => void
}

export default function IntentIndicator({ intent, confidence, onCorrect }: IntentIndicatorProps) {
  const getIntentDisplay = (intent: string) => {
    switch (intent) {
      case 'coaching':
        return {
          icon: <Bot className="w-3 h-3" />,
          label: 'Nutrition Coaching',
          color: 'bg-blue-100 text-blue-800'
        }
      case 'meal_analysis':
        return {
          icon: <Utensils className="w-3 h-3" />,
          label: 'Meal Analysis',
          color: 'bg-green-100 text-green-800'
        }
      case 'general':
        return {
          icon: <MessageCircle className="w-3 h-3" />,
          label: 'General Question',
          color: 'bg-gray-100 text-gray-800'
        }
      default:
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          label: 'Unknown',
          color: 'bg-yellow-100 text-yellow-800'
        }
    }
  }

  const display = getIntentDisplay(intent)
  const isLowConfidence = confidence < 70

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${display.color} flex items-center gap-1`}>
        {display.icon}
        <span className="text-xs">{display.label}</span>
        <span className="text-xs opacity-75">({confidence}%)</span>
      </Badge>
      
      {isLowConfidence && (
        <span className="text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Low confidence - message may be routed incorrectly
        </span>
      )}
    </div>
  )
}
```

### 4. Conversation Context Component
```typescript
// src/components/Chat/ConversationContext.tsx
'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Clock, TrendingUp, Target } from 'lucide-react'
import { useNutritionData } from '@/hooks/useNutritionData'

export default function ConversationContext() {
  const { todaysSummary, nutritionTargets, pendingRecommendations } = useNutritionData()
  const [showContext, setShowContext] = useState(false)

  // Show context if there are relevant updates
  useEffect(() => {
    const hasRecentActivity = 
      todaysSummary.calories > 0 || 
      pendingRecommendations.length > 0 ||
      !nutritionTargets

    setShowContext(hasRecentActivity)
  }, [todaysSummary, pendingRecommendations, nutritionTargets])

  if (!showContext) return null

  const calorieProgress = nutritionTargets 
    ? Math.round((todaysSummary.calories / nutritionTargets.dailyCalories) * 100)
    : 0

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Today's Context</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Calorie Progress */}
        {nutritionTargets && (
          <Badge variant="outline" className="text-xs">
            <Target className="w-3 h-3 mr-1" />
            {calorieProgress}% calories ({todaysSummary.calories}/{nutritionTargets.dailyCalories})
          </Badge>
        )}

        {/* Protein Progress */}
        {nutritionTargets && (
          <Badge variant="outline" className="text-xs">
            Protein: {todaysSummary.protein}g/{nutritionTargets.targetProtein}g
          </Badge>
        )}

        {/* Pending Recommendations */}
        {pendingRecommendations.length > 0 && (
          <Badge className="bg-blue-100 text-blue-800 text-xs">
            {pendingRecommendations.length} pending recommendation{pendingRecommendations.length !== 1 ? 's' : ''}
          </Badge>
        )}

        {/* No Targets Set */}
        {!nutritionTargets && (
          <Badge className="bg-amber-100 text-amber-800 text-xs">
            No nutrition targets set
          </Badge>
        )}
      </div>
    </div>
  )
}
```

### 5. Enhanced Message Routing
```typescript
// Update src/app/api/chat/route.ts to include intelligent routing
import { classifyMessageIntent } from '@/lib/ai/intentClassification'

export async function POST(req: Request) {
  const { message, image, forceIntent } = await req.json()
  
  // Classify intent if not forced
  let intent = forceIntent
  if (!intent) {
    const classification = await classifyMessageIntent(message, { hasImage: !!image })
    
    // If confidence is low, ask for clarification
    if (classification.confidence < 70) {
      return Response.json({
        response: "I'm not sure if you want me to analyze a meal or provide nutrition coaching. Could you clarify what you'd like help with?",
        suggestions: [
          "Analyze this meal",
          "Give me nutrition advice",
          "Help with my goals"
        ],
        needsClarification: true
      })
    }
    
    intent = classification.intent
  }
  
  // Route to appropriate handler
  switch (intent) {
    case 'meal_analysis':
      return handleMealAnalysis(message, image)
    case 'coaching':
      return handleNutritionCoaching(message)
    case 'general':
      return handleGeneralQuestion(message)
    default:
      return handleGeneralQuestion(message)
  }
}
```

## Performance Optimizations
- Debounced intent prediction to reduce API calls
- Cached suggestions for faster loading
- Optimized re-rendering with React.memo
- Efficient conversation context updates

## User Experience Features
- **Smart Predictions**: Shows likely intent before sending
- **Mode Override**: Users can force specific intent types
- **Context Awareness**: Shows relevant nutrition data
- **Quick Suggestions**: Common questions for easy access
- **Visual Feedback**: Clear indicators for different modes

## Accessibility
- Proper ARIA labels for intent indicators
- Keyboard navigation for suggestions
- Screen reader announcements for state changes
- High contrast mode support

## Mobile Optimizations
- Touch-friendly suggestion buttons
- Optimized textarea sizing
- Thumb-friendly action buttons
- Responsive layout adjustments

## Testing Requirements
- Intent classification accuracy testing
- User interaction flow testing
- Performance testing with large conversations
- Accessibility compliance testing
- Cross-browser compatibility

## Definition of Done
- [ ] Intelligent message routing working
- [ ] Intent prediction accurate and helpful
- [ ] Suggested responses contextually relevant
- [ ] Conversation context provides value
- [ ] Mobile experience optimized
- [ ] Accessibility requirements met
- [ ] Performance benchmarks met
- [ ] User testing completed
- [ ] Code review approved