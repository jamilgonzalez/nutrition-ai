# TICKET-009: LLM Intent Classification

**Priority**: Medium  
**Estimate**: 3-4 hours  
**Dependencies**: None (can work in parallel)  
**Assignee**: TBD  

## Description
Implement LLM-based intent classification to automatically route user messages between meal analysis and nutrition coaching. This replaces rigid keyword matching with intelligent understanding of user intent.

## Acceptance Criteria
- [ ] AI classifies messages into meal_analysis, coaching, or general categories
- [ ] Confidence scoring for classification decisions
- [ ] Context-aware classification using conversation history
- [ ] Fallback handling for low-confidence classifications
- [ ] Performance optimized for real-time chat

## Files to Create/Modify
- `src/lib/ai/intentClassification.ts` (new)
- `src/lib/ai/prompts.ts` (new)
- `src/lib/utils/contextBuilder.ts` (new)

## Implementation Details

### 1. Core Intent Classification
```typescript
// src/lib/ai/intentClassification.ts
import { generateText, generateObject } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { z } from 'zod'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const classificationModel = openrouter.chat('openai/gpt-4o-mini')

export type MessageIntent = 'meal_analysis' | 'coaching' | 'general'

export interface IntentClassification {
  intent: MessageIntent
  confidence: number
  reasoning?: string
}

export interface ClassificationContext {
  recentMessages?: string[]
  currentTargets?: boolean
  recentActivity?: 'meal_logging' | 'target_adjustment' | 'browsing'
  hasImage?: boolean
}

/**
 * Classify user message intent using AI
 */
export async function classifyMessageIntent(
  message: string, 
  context?: ClassificationContext
): Promise<IntentClassification> {
  // Quick determination for messages with images
  if (context?.hasImage) {
    return {
      intent: 'meal_analysis',
      confidence: 95,
      reasoning: 'Message contains an image, likely meal analysis request'
    }
  }

  try {
    const classificationPrompt = buildClassificationPrompt(message, context)
    
    const response = await generateObject({
      model: classificationModel,
      schema: z.object({
        intent: z.enum(['meal_analysis', 'coaching', 'general']),
        confidence: z.number().min(0).max(100),
        reasoning: z.string().optional()
      }),
      prompt: classificationPrompt,
      maxTokens: 100
    })

    return response.object
  } catch (error) {
    console.error('Intent classification failed:', error)
    
    // Fallback to simple classification
    return fallbackClassification(message, context)
  }
}

/**
 * Build the classification prompt with context
 */
function buildClassificationPrompt(message: string, context?: ClassificationContext): string {
  const basePrompt = `Classify the following user message into one of these categories:

1. "meal_analysis" - User wants to analyze a specific meal, food, or get nutrition information about what they ate/plan to eat
2. "coaching" - User is asking for nutrition advice, reporting how they feel, asking about their targets, goals, or wanting guidance  
3. "general" - General conversation, greetings, or unclear intent

Examples:
- "I ate a chicken sandwich for lunch" → meal_analysis
- "What's in this salad?" → meal_analysis
- "I had eggs and toast this morning" → meal_analysis
- "I feel tired after meals" → coaching
- "Should I increase my protein?" → coaching
- "I'm not losing weight despite being in a deficit" → coaching
- "My energy is low lately" → coaching
- "I've been hitting my macros but feel sluggish" → coaching
- "Hello" → general
- "How does this app work?" → general`

  let contextInfo = ''
  
  if (context) {
    contextInfo += '\nContext:'
    
    if (context.recentActivity) {
      contextInfo += `\n- Recent activity: ${context.recentActivity}`
    }
    
    if (context.recentMessages?.length) {
      contextInfo += `\n- Recent messages: ${context.recentMessages.join(', ')}`
    }
    
    if (context.currentTargets !== undefined) {
      contextInfo += `\n- User has nutrition targets: ${context.currentTargets ? 'yes' : 'no'}`
    }
  }

  return `${basePrompt}${contextInfo}

User message: "${message}"

Respond with JSON containing:
{
  "intent": "meal_analysis|coaching|general",
  "confidence": 85,
  "reasoning": "Brief explanation of why this classification was chosen"
}`
}

/**
 * Fallback classification when AI fails
 */
function fallbackClassification(message: string, context?: ClassificationContext): IntentClassification {
  const lowerMessage = message.toLowerCase()
  
  // Simple keyword-based fallback
  const mealKeywords = [
    'ate', 'eating', 'meal', 'breakfast', 'lunch', 'dinner', 'snack',
    'calories', 'food', 'nutrition facts', 'ingredients'
  ]
  
  const coachingKeywords = [
    'tired', 'energy', 'feel', 'advice', 'should i', 'recommend',
    'plateau', 'not working', 'adjust', 'goals', 'targets'
  ]
  
  const mealScore = mealKeywords.filter(keyword => lowerMessage.includes(keyword)).length
  const coachingScore = coachingKeywords.filter(keyword => lowerMessage.includes(keyword)).length
  
  if (mealScore > coachingScore && mealScore > 0) {
    return {
      intent: 'meal_analysis',
      confidence: Math.min(70, 30 + mealScore * 10),
      reasoning: 'Fallback classification based on meal-related keywords'
    }
  }
  
  if (coachingScore > 0) {
    return {
      intent: 'coaching', 
      confidence: Math.min(70, 30 + coachingScore * 10),
      reasoning: 'Fallback classification based on coaching-related keywords'
    }
  }
  
  return {
    intent: 'general',
    confidence: 50,
    reasoning: 'Fallback classification - no clear intent detected'
  }
}

/**
 * Batch classify multiple messages (useful for conversation analysis)
 */
export async function batchClassifyMessages(
  messages: Array<{ text: string; context?: ClassificationContext }>
): Promise<IntentClassification[]> {
  try {
    const classifications = await Promise.all(
      messages.map(({ text, context }) => 
        classifyMessageIntent(text, context)
      )
    )
    
    return classifications
  } catch (error) {
    console.error('Batch classification failed:', error)
    return messages.map(({ text, context }) => 
      fallbackClassification(text, context)
    )
  }
}

/**
 * Get classification with conversation context
 */
export async function classifyWithConversationContext(
  message: string,
  conversationHistory: string[],
  userActivity?: 'meal_logging' | 'target_adjustment' | 'browsing'
): Promise<IntentClassification> {
  const context: ClassificationContext = {
    recentMessages: conversationHistory.slice(-3), // Last 3 messages
    recentActivity: userActivity
  }
  
  return classifyMessageIntent(message, context)
}
```

### 2. AI Prompts Library
```typescript
// src/lib/ai/prompts.ts
export const INTENT_CLASSIFICATION_PROMPT = `You are an expert at understanding user intent in nutrition and meal tracking conversations.

Classify each message into one of these categories:

**meal_analysis**: User wants to:
- Analyze a specific meal or food item
- Get nutrition information about what they ate
- Upload and analyze meal photos
- Ask about calories/macros in specific foods
- Log or track a meal

**coaching**: User wants to:
- Get nutrition advice or guidance
- Discuss how they're feeling (energy, mood, etc.)
- Ask about their nutrition goals or targets
- Get recommendations for improvement
- Discuss plateaus, challenges, or concerns
- Adjust their nutrition plan

**general**: 
- Greetings and pleasantries
- App functionality questions
- Unclear or ambiguous messages
- Off-topic conversations

Key indicators:
- Specific food mentions + "ate/eating" → meal_analysis
- Feeling/energy/mood descriptions → coaching
- "Should I" or "recommend" questions → coaching
- Goal/target related questions → coaching
- Technical app questions → general`

export const CONTEXT_AWARE_CLASSIFICATION = `Consider the conversation context:

Recent Activity Context:
- meal_logging: User has been actively logging meals
- target_adjustment: User recently changed nutrition targets  
- browsing: User is exploring the app

Recent Messages Context:
Use the last few messages to understand the conversation flow.
If user was just discussing coaching topics, ambiguous messages likely continue that theme.
If user was logging meals, food-related messages are likely meal analysis.

Confidence Guidelines:
- 90-100: Very clear intent with strong indicators
- 70-89: Clear intent with some ambiguity
- 50-69: Unclear intent, reasonable guess
- Below 50: Very ambiguous, needs clarification`

export const COACHING_INDICATORS = [
  'tired', 'energy', 'feel', 'feeling',
  'plateau', 'not working', 'not losing',
  'advice', 'recommend', 'should i',
  'goals', 'targets', 'adjust',
  'mood', 'sleep', 'performance',
  'cravings', 'hungry', 'satiety'
]

export const MEAL_ANALYSIS_INDICATORS = [
  'ate', 'eating', 'had for',
  'calories in', 'nutrition in', 'macros',
  'breakfast', 'lunch', 'dinner', 'snack',
  'food', 'meal', 'dish', 'ingredients',
  'cooked', 'prepared', 'restaurant'
]
```

### 3. Context Builder Utility
```typescript
// src/lib/utils/contextBuilder.ts
import { ClassificationContext } from '@/lib/ai/intentClassification'

export interface UserSession {
  recentMessages: Array<{
    text: string
    timestamp: Date
    intent?: string
  }>
  currentActivity?: 'meal_logging' | 'target_adjustment' | 'browsing'
  hasNutritionTargets: boolean
}

/**
 * Build classification context from user session
 */
export function buildClassificationContext(
  session: UserSession,
  hasImage: boolean = false
): ClassificationContext {
  return {
    recentMessages: session.recentMessages
      .slice(-3)
      .map(msg => msg.text),
    currentTargets: session.hasNutritionTargets,
    recentActivity: session.currentActivity,
    hasImage
  }
}

/**
 * Update user session with new message
 */
export function updateUserSession(
  session: UserSession,
  message: string,
  intent?: string,
  activity?: 'meal_logging' | 'target_adjustment' | 'browsing'
): UserSession {
  const newMessage = {
    text: message,
    timestamp: new Date(),
    intent
  }
  
  return {
    ...session,
    recentMessages: [...session.recentMessages, newMessage].slice(-10), // Keep last 10
    currentActivity: activity || session.currentActivity
  }
}

/**
 * Determine user activity based on recent actions
 */
export function inferUserActivity(session: UserSession): 'meal_logging' | 'target_adjustment' | 'browsing' {
  const recentIntents = session.recentMessages
    .slice(-3)
    .map(msg => msg.intent)
    .filter(Boolean)
  
  const mealAnalysisCount = recentIntents.filter(intent => intent === 'meal_analysis').length
  const coachingCount = recentIntents.filter(intent => intent === 'coaching').length
  
  if (mealAnalysisCount >= 2) return 'meal_logging'
  if (coachingCount >= 2) return 'target_adjustment'
  
  return 'browsing'
}
```

### 4. Integration with Chat Handler
```typescript
// Example integration in chat handler
import { classifyMessageIntent, ClassificationContext } from '@/lib/ai/intentClassification'
import { buildClassificationContext, updateUserSession } from '@/lib/utils/contextBuilder'

export async function handleChatMessage(
  message: string, 
  image?: File,
  userSession?: UserSession
): Promise<'meal_analysis' | 'coaching' | 'general'> {
  
  const context = userSession 
    ? buildClassificationContext(userSession, !!image)
    : { hasImage: !!image }
  
  const classification = await classifyMessageIntent(message, context)
  
  // Handle low confidence classifications
  if (classification.confidence < 70) {
    return 'general' // Will ask for clarification
  }
  
  return classification.intent
}
```

## Performance Optimizations
- Use lightweight gpt-4o-mini model for fast classification
- Cache common classifications for similar messages
- Fallback to keyword matching if AI is slow
- Batch processing for conversation analysis

## Error Handling
- Graceful fallback to keyword-based classification
- Timeout handling for AI requests
- Retry logic with exponential backoff
- Default to 'general' classification on errors

## Testing Requirements
- Unit tests for classification accuracy
- Test with various message types and contexts
- Performance testing for response times
- Test fallback mechanisms
- A/B testing for classification prompt effectiveness

## Monitoring & Analytics
- Track classification accuracy over time
- Monitor confidence score distributions
- Log misclassifications for prompt improvement
- Performance metrics for AI response times

## Future Improvements
- Fine-tuning classification model on user data
- Multi-language support
- Personalized classification based on user patterns
- Integration with user feedback for model improvement

## Definition of Done
- [ ] AI classifies messages with >85% accuracy
- [ ] Context-aware classification working
- [ ] Confidence scoring implemented
- [ ] Fallback mechanisms tested
- [ ] Performance meets real-time requirements
- [ ] Error handling comprehensive
- [ ] Unit tests passing
- [ ] Integration tests with chat system
- [ ] Code review approved