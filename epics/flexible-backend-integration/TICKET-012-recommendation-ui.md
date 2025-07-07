# TICKET-012: Recommendation UI Components

**Priority**: Low  
**Estimate**: 3-4 hours  
**Dependencies**: TICKET-011 (Recommendation System), TICKET-008 (Component Migration)  
**Assignee**: TBD  

## Description
Enhance the recommendation UI with advanced features like recommendation history, detailed analytics, and improved user experience patterns. This builds upon the basic recommendation system with additional polish and functionality.

## Acceptance Criteria
- [ ] Recommendation history view
- [ ] Enhanced recommendation analytics
- [ ] Improved mobile responsiveness
- [ ] Better accessibility features
- [ ] Advanced filtering and sorting
- [ ] Batch operations for multiple recommendations

## Files to Create/Modify
- `src/components/NutritionRecommendations/RecommendationHistory.tsx` (new)
- `src/components/NutritionRecommendations/RecommendationAnalytics.tsx` (new)
- `src/components/NutritionRecommendations/RecommendationFilters.tsx` (new)
- `src/components/NutritionRecommendations/BatchActions.tsx` (new)
- Update existing recommendation components for mobile

## Implementation Details

### 1. Recommendation History Component
```typescript
// src/components/NutritionRecommendations/RecommendationHistory.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCurrentBackend } from '@/lib/BackendFactory'
import { useUser } from '@clerk/nextjs'
import { NutritionRecommendation } from '@/lib/types'
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'

export default function RecommendationHistory() {
  const { user } = useUser()
  const [history, setHistory] = useState<NutritionRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'accepted' | 'rejected'>('all')

  useEffect(() => {
    loadRecommendationHistory()
  }, [user?.id])

  const loadRecommendationHistory = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const backend = getCurrentBackend()
      // Note: This would require adding a method to get all recommendations
      // For now, we'll use a placeholder
      setHistory([])
    } catch (error) {
      console.error('Failed to load recommendation history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredHistory = history.filter(rec => {
    if (filter === 'all') return true
    return rec.status === filter
  })

  const stats = {
    total: history.length,
    accepted: history.filter(rec => rec.status === 'accepted').length,
    rejected: history.filter(rec => rec.status === 'rejected').length,
    pending: history.filter(rec => rec.status === 'pending').length
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading history...</div>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            No recommendation history yet. Start chatting with your AI nutritionist to get personalized advice!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recommendation History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-xs text-gray-600">Accepted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-gray-600">Rejected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === 'accepted' ? 'default' : 'outline'}
            onClick={() => setFilter('accepted')}
          >
            Accepted
          </Button>
          <Button
            size="sm"
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </Button>
        </div>

        {/* History List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredHistory.map((recommendation) => (
            <HistoryItem key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function HistoryItem({ recommendation }: { recommendation: NutritionRecommendation }) {
  const getStatusIcon = () => {
    switch (recommendation.status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-600" />
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      {getStatusIcon()}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 truncate">
          {recommendation.title}
        </div>
        <div className="text-xs text-gray-600">
          {formatDate(recommendation.createdAt)} • {recommendation.confidence}% confidence
        </div>
      </div>
      <Badge variant="outline" className="text-xs">
        {recommendation.type.replace('_', ' ')}
      </Badge>
    </div>
  )
}
```

### 2. Recommendation Analytics Component
```typescript
// src/components/NutritionRecommendations/RecommendationAnalytics.tsx
'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NutritionRecommendation } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface RecommendationAnalyticsProps {
  recommendations: NutritionRecommendation[]
}

export default function RecommendationAnalytics({ recommendations }: RecommendationAnalyticsProps) {
  const analytics = useMemo(() => {
    // Acceptance rate by type
    const typeStats = recommendations.reduce((acc, rec) => {
      if (!acc[rec.type]) {
        acc[rec.type] = { total: 0, accepted: 0 }
      }
      acc[rec.type].total++
      if (rec.status === 'accepted') {
        acc[rec.type].accepted++
      }
      return acc
    }, {} as Record<string, { total: number; accepted: number }>)

    const typeData = Object.entries(typeStats).map(([type, stats]) => ({
      name: type.replace('_', ' '),
      total: stats.total,
      accepted: stats.accepted,
      rate: Math.round((stats.accepted / stats.total) * 100)
    }))

    // Confidence distribution
    const confidenceRanges = [
      { range: '90-100%', min: 90, max: 100, count: 0 },
      { range: '80-89%', min: 80, max: 89, count: 0 },
      { range: '70-79%', min: 70, max: 79, count: 0 },
      { range: '60-69%', min: 60, max: 69, count: 0 },
      { range: '<60%', min: 0, max: 59, count: 0 }
    ]

    recommendations.forEach(rec => {
      const range = confidenceRanges.find(r => 
        rec.confidence >= r.min && rec.confidence <= r.max
      )
      if (range) range.count++
    })

    // Overall stats
    const totalRecommendations = recommendations.length
    const acceptedRecommendations = recommendations.filter(r => r.status === 'accepted').length
    const overallAcceptanceRate = totalRecommendations > 0 
      ? Math.round((acceptedRecommendations / totalRecommendations) * 100)
      : 0

    const avgConfidence = totalRecommendations > 0
      ? Math.round(recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / totalRecommendations)
      : 0

    return {
      typeData,
      confidenceData: confidenceRanges.filter(r => r.count > 0),
      overallAcceptanceRate,
      avgConfidence,
      totalRecommendations
    }
  }, [recommendations])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (analytics.totalRecommendations === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendation Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            No data available yet. Get some recommendations first!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analytics.overallAcceptanceRate}%
              </div>
              <div className="text-sm text-gray-600">Acceptance Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {analytics.avgConfidence}%
              </div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {analytics.totalRecommendations}
              </div>
              <div className="text-sm text-gray-600">Total Recommendations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceptance Rate by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Acceptance Rate by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rate" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Confidence Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Confidence Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.confidenceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, count }) => `${range}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.confidenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 3. Mobile-Responsive Enhancements
```typescript
// Update src/components/NutritionRecommendations/RecommendationCard.tsx
// Add mobile-specific styling and interactions

// Add to the component:
const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }
  
  checkMobile()
  window.addEventListener('resize', checkMobile)
  return () => window.removeEventListener('resize', checkMobile)
}, [])

// Update the layout for mobile:
return (
  <Card className="border-gray-200 hover:border-blue-300 transition-colors">
    <CardContent className={`p-4 ${isMobile ? 'space-y-4' : 'space-y-3'}`}>
      <div className={`${isMobile ? 'space-y-3' : 'space-y-3'}`}>
        {/* Mobile-optimized header */}
        <div className={`flex items-start ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
          <div className="flex items-start gap-3 flex-1">
            <span className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {getTypeIcon(recommendation.type)}
            </span>
            <div className="flex-1">
              <h4 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : ''}`}>
                {recommendation.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
            </div>
          </div>
          
          {/* Mobile-optimized badges and controls */}
          <div className={`flex items-center gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
            <Badge className={getConfidenceColor(recommendation.confidence)}>
              <Brain className="w-3 h-3 mr-1" />
              {recommendation.confidence}%
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

        {/* Mobile-optimized action buttons */}
        <div className={`flex gap-2 pt-2 ${isMobile ? 'flex-col' : ''}`}>
          {/* Button content remains the same but uses full width on mobile */}
        </div>
      </div>
    </CardContent>
  </Card>
)
```

### 4. Accessibility Enhancements
```typescript
// src/components/NutritionRecommendations/AccessibleRecommendationCard.tsx
// Enhanced version with full accessibility support

export default function AccessibleRecommendationCard({
  recommendation,
  onAccept,
  onReject,
  isProcessing
}: RecommendationCardProps) {
  const cardId = `recommendation-${recommendation.id}`
  const descriptionId = `${cardId}-description`
  const actionsId = `${cardId}-actions`

  return (
    <Card 
      className="border-gray-200 hover:border-blue-300 transition-colors focus-within:ring-2 focus-within:ring-blue-500"
      role="article"
      aria-labelledby={cardId}
      aria-describedby={descriptionId}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with proper semantic structure */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <span 
                className="text-2xl"
                role="img"
                aria-label={`${recommendation.type} recommendation`}
              >
                {getTypeIcon(recommendation.type)}
              </span>
              <div className="flex-1">
                <h3 
                  id={cardId}
                  className="font-semibold text-gray-900"
                >
                  {recommendation.title}
                </h3>
                <p 
                  id={descriptionId}
                  className="text-sm text-gray-600 mt-1"
                >
                  {recommendation.description}
                </p>
              </div>
            </div>
            
            {/* Accessible confidence badge */}
            <div className="flex items-center gap-2">
              <Badge 
                className={getConfidenceColor(recommendation.confidence)}
                aria-label={`AI confidence level: ${recommendation.confidence} percent`}
              >
                <Brain className="w-3 h-3 mr-1" aria-hidden="true" />
                {recommendation.confidence}%
              </Badge>
              
              {/* Accessible expand/collapse button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-expanded={isExpanded}
                aria-controls={`${cardId}-details`}
                aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Accessible action buttons */}
          <div 
            id={actionsId}
            className="flex gap-2 pt-2"
            role="group"
            aria-labelledby={cardId}
          >
            <Button
              size="sm"
              onClick={onAccept}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
              aria-describedby={descriptionId}
            >
              <CheckCircle className="w-4 h-4 mr-1" aria-hidden="true" />
              {isProcessing ? 'Applying...' : 'Accept Recommendation'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              disabled={isProcessing}
              className="focus:ring-2 focus:ring-gray-500"
              aria-describedby={descriptionId}
            >
              <XCircle className="w-4 h-4 mr-1" aria-hidden="true" />
              {isProcessing ? 'Dismissing...' : 'Dismiss Recommendation'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Testing Requirements
- Responsive design testing across devices
- Accessibility testing with screen readers
- Performance testing with large datasets
- User interaction testing
- Cross-browser compatibility

## Performance Optimizations
- Virtualized lists for large histories
- Lazy loading of analytics charts
- Optimized re-rendering with React.memo
- Efficient data filtering and sorting

## Accessibility Features
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management

## Mobile Experience
- Touch-friendly interface
- Optimized layouts for small screens
- Swipe gestures for actions
- Responsive typography
- Thumb-friendly button sizes

## Definition of Done
- [ ] Recommendation history functional
- [ ] Analytics provide meaningful insights
- [ ] Mobile responsiveness excellent
- [ ] Accessibility standards met
- [ ] Performance optimized
- [ ] Cross-browser tested
- [ ] User testing completed
- [ ] Code review approved