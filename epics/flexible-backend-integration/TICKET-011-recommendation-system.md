# TICKET-011: Recommendation System

**Priority**: Medium  
**Estimate**: 4-5 hours  
**Dependencies**: TICKET-010 (Nutrition Coach API), TICKET-007 (useNutritionData Hook)  
**Assignee**: TBD  

## Description
Implement the recommendation approval system that allows users to review AI-generated nutrition recommendations, accept or reject them, and automatically apply target changes when accepted.

## Acceptance Criteria
- [ ] Users can view pending recommendations
- [ ] Clear before/after comparison for target changes
- [ ] Accept/reject functionality with confirmation
- [ ] Automatic target updates when recommendations accepted
- [ ] Recommendation history tracking
- [ ] UI feedback for recommendation status changes

## Files to Create/Modify
- `src/components/NutritionRecommendations/PendingRecommendations.tsx` (new)
- `src/components/NutritionRecommendations/RecommendationCard.tsx` (new)
- `src/components/NutritionRecommendations/TargetComparison.tsx` (new)
- `src/components/NutritionRecommendations/index.ts` (new)
- Update `src/components/MacroCard/MacroCard.tsx` to show recommendations

## Implementation Details

### 1. Main Recommendations Component
```typescript
// src/components/NutritionRecommendations/PendingRecommendations.tsx
'use client'

import { useState } from 'react'
import { useNutritionData } from '@/hooks/useNutritionData'
import RecommendationCard from './RecommendationCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PendingRecommendations() {
  const { 
    pendingRecommendations, 
    acceptRecommendation, 
    rejectRecommendation,
    isLoading,
    error 
  } = useNutritionData()
  
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🤖</span>
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading recommendations...</div>
        </CardContent>
      </Card>
    )
  }

  if (pendingRecommendations.length === 0) {
    return null // Don't show empty state
  }

  const handleAccept = async (recommendationId: string) => {
    setProcessingIds(prev => new Set(prev).add(recommendationId))
    
    try {
      await acceptRecommendation(recommendationId)
    } catch (error) {
      console.error('Failed to accept recommendation:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(recommendationId)
        return newSet
      })
    }
  }

  const handleReject = async (recommendationId: string) => {
    setProcessingIds(prev => new Set(prev).add(recommendationId))
    
    try {
      await rejectRecommendation(recommendationId)
    } catch (error) {
      console.error('Failed to reject recommendation:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(recommendationId)
        return newSet
      })
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>🤖</span>
            AI Recommendations
          </span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {pendingRecommendations.length} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            Error loading recommendations. Please try again.
          </div>
        )}
        
        {pendingRecommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onAccept={() => handleAccept(recommendation.id)}
            onReject={() => handleReject(recommendation.id)}
            isProcessing={processingIds.has(recommendation.id)}
          />
        ))}
      </CardContent>
    </Card>
  )
}
```

### 2. Individual Recommendation Card
```typescript
// src/components/NutritionRecommendations/RecommendationCard.tsx
'use client'

import { useState } from 'react'
import { NutritionRecommendation } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Brain } from 'lucide-react'
import TargetComparison from './TargetComparison'
import SourceCitation from '../SourceCitation'

interface RecommendationCardProps {
  recommendation: NutritionRecommendation
  onAccept: () => void
  onReject: () => void
  isProcessing: boolean
}

export default function RecommendationCard({
  recommendation,
  onAccept,
  onReject,
  isProcessing
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState<'accept' | 'reject' | null>(null)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'target_adjustment':
        return '🎯'
      case 'meal_suggestion':
        return '🍽️'
      case 'lifestyle_change':
        return '🏃‍♂️'
      default:
        return '💡'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800'
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const handleAcceptConfirm = () => {
    setShowConfirmation(null)
    onAccept()
  }

  const handleRejectConfirm = () => {
    setShowConfirmation(null)
    onReject()
  }

  return (
    <Card className="border-gray-200 hover:border-blue-300 transition-colors">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-2xl">{getTypeIcon(recommendation.type)}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getConfidenceColor(recommendation.confidence)}>
                <Brain className="w-3 h-3 mr-1" />
                {recommendation.confidence}% confident
              </Badge>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Target Comparison for target adjustments */}
          {recommendation.type === 'target_adjustment' && 
           recommendation.currentTargets && 
           recommendation.proposedTargets && (
            <TargetComparison
              current={recommendation.currentTargets}
              proposed={recommendation.proposedTargets}
            />
          )}

          {/* Expanded Details */}
          {isExpanded && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              {/* Reasoning */}
              <div>
                <h5 className="font-medium text-gray-700 text-sm mb-1">Reasoning</h5>
                <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
              </div>

              {/* Sources */}
              {recommendation.sources && recommendation.sources.length > 0 && (
                <SourceCitation sources={recommendation.sources} />
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {showConfirmation === 'accept' ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-gray-600">Apply this recommendation?</span>
                <Button
                  size="sm"
                  onClick={handleAcceptConfirm}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? 'Applying...' : 'Yes, Apply'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowConfirmation(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </div>
            ) : showConfirmation === 'reject' ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-gray-600">Dismiss this recommendation?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRejectConfirm}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Dismissing...' : 'Yes, Dismiss'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowConfirmation(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => setShowConfirmation('accept')}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowConfirmation('reject')}
                  disabled={isProcessing}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Dismiss
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Target Comparison Component
```typescript
// src/components/NutritionRecommendations/TargetComparison.tsx
'use client'

import { NutritionTargets } from '@/lib/types'
import { ArrowRight } from 'lucide-react'

interface TargetComparisonProps {
  current: NutritionTargets
  proposed: NutritionTargets
}

export default function TargetComparison({ current, proposed }: TargetComparisonProps) {
  const formatChange = (currentValue: number, proposedValue: number) => {
    const change = proposedValue - currentValue
    const percentage = Math.round((change / currentValue) * 100)
    
    if (change === 0) return null
    
    return {
      change,
      percentage,
      isIncrease: change > 0,
      text: change > 0 ? `+${change}` : `${change}`
    }
  }

  const TargetRow = ({ 
    label, 
    unit, 
    currentValue, 
    proposedValue 
  }: { 
    label: string
    unit: string
    currentValue: number
    proposedValue: number 
  }) => {
    const change = formatChange(currentValue, proposedValue)
    const hasChange = currentValue !== proposedValue

    return (
      <div className={`flex items-center justify-between p-2 rounded ${
        hasChange ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
      }`}>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {currentValue}{unit}
          </span>
          {hasChange && (
            <>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {proposedValue}{unit}
              </span>
              {change && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  change.isIncrease 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {change.text}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h5 className="font-medium text-gray-700 text-sm">Proposed Changes</h5>
      <div className="space-y-1">
        <TargetRow
          label="Daily Calories"
          unit=""
          currentValue={current.dailyCalories}
          proposedValue={proposed.dailyCalories}
        />
        <TargetRow
          label="Protein"
          unit="g"
          currentValue={current.targetProtein}
          proposedValue={proposed.targetProtein}
        />
        <TargetRow
          label="Carbs"
          unit="g"
          currentValue={current.targetCarbs}
          proposedValue={proposed.targetCarbs}
        />
        <TargetRow
          label="Fat"
          unit="g"
          currentValue={current.targetFat}
          proposedValue={proposed.targetFat}
        />
      </div>
    </div>
  )
}
```

### 4. Integration with MacroCard
```typescript
// Update src/components/MacroCard/MacroCard.tsx
import PendingRecommendations from '../NutritionRecommendations/PendingRecommendations'

export default function MacroCard() {
  // ... existing code

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 space-y-6">
      {/* Show pending recommendations at the top */}
      <PendingRecommendations />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Today's Nutrition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ... existing content */}
        </CardContent>
      </Card>

      {/* ... rest of component */}
    </div>
  )
}
```

### 5. Success/Error Feedback Component
```typescript
// src/components/NutritionRecommendations/RecommendationFeedback.tsx
'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface RecommendationFeedbackProps {
  type: 'success' | 'error'
  message: string
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export default function RecommendationFeedback({
  type,
  message,
  onClose,
  autoClose = true,
  duration = 3000
}: RecommendationFeedbackProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-sm ${
      type === 'success' 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-start gap-3">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-0.5 hover:bg-white/20 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
```

### 6. Export Index
```typescript
// src/components/NutritionRecommendations/index.ts
export { default as PendingRecommendations } from './PendingRecommendations'
export { default as RecommendationCard } from './RecommendationCard'
export { default as TargetComparison } from './TargetComparison'
export { default as RecommendationFeedback } from './RecommendationFeedback'
```

## State Management
- Uses `useNutritionData` hook for data operations
- Local state for UI interactions (expanded/collapsed, processing)
- Optimistic updates handled by the hook
- Real-time updates when new recommendations arrive

## User Experience Features
- **Visual Indicators**: Icons, colors, and badges for quick understanding
- **Confidence Scoring**: Shows AI confidence to help user decision-making
- **Confirmation Steps**: Prevents accidental accepts/rejects
- **Loading States**: Clear feedback during processing
- **Success/Error Feedback**: Toast notifications for actions

## Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance
- Focus management

## Testing Requirements
- Unit tests for all components
- Integration tests with useNutritionData hook
- User interaction testing (accept/reject flows)
- Error scenario testing
- Accessibility testing

## Performance Considerations
- Optimistic updates for immediate feedback
- Efficient re-rendering with proper keys
- Lazy loading for recommendation details
- Debounced actions to prevent spam clicking

## Integration Points
- Seamlessly integrates with MacroCard layout
- Uses existing design system components
- Maintains consistent styling with app theme
- Responsive design for mobile devices

## Definition of Done
- [ ] Users can view pending recommendations
- [ ] Target comparison clearly shows changes
- [ ] Accept/reject functionality working
- [ ] Automatic target updates on acceptance
- [ ] Error handling and user feedback
- [ ] Responsive design implemented
- [ ] Accessibility requirements met
- [ ] Unit tests passing
- [ ] Integration with MacroCard complete
- [ ] Code review approved