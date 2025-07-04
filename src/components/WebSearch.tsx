'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ExternalLink, Search, Loader2, Edit3, Mic, MicOff } from 'lucide-react'
import DatabaseStub from '@/lib/database'

interface SearchResult {
  title: string
  url: string
  snippet: string
  score: number
}

interface CalorieRecommendation {
  dailyCalories: number
  macros: {
    protein: number
    carbs: number
    fat: number
    proteinPercentage: number
    carbsPercentage: number
    fatPercentage: number
  }
  mealPlan?: {
    breakfast: { calories: number; suggestions: string[] }
    lunch: { calories: number; suggestions: string[] }
    dinner: { calories: number; suggestions: string[] }
    snacks: { calories: number; suggestions: string[] }
  }
  keyRecommendations?: string[]
  sources: SearchResult[]
  summary: string
  // Backward compatibility
  protein?: number
  carbs?: number
  fat?: number
}

interface WebSearchProps {
  query: string
  onComplete: () => void
  isVoiceMode?: boolean
  onToggleVoiceMode?: () => void
  onSpeakText?: (text: string) => void
  userId?: string
}

export function WebSearch({ 
  query, 
  onComplete, 
  isVoiceMode = false, 
  onToggleVoiceMode,
  onSpeakText,
  userId 
}: WebSearchProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<CalorieRecommendation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdjustments, setShowAdjustments] = useState(false)
  const [adjustmentText, setAdjustmentText] = useState('')
  const [isAdjusting, setIsAdjusting] = useState(false)

  useEffect(() => {
    performSearch()
  }, [query])

  const performSearch = async () => {
    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error('Failed to search for calorie recommendations')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to fetch calorie recommendations. Please try again.')

      // Fallback with mock data for demo purposes
      setResults({
        dailyCalories: 2200,
        macros: {
          protein: 165,
          carbs: 275,
          fat: 73,
          proteinPercentage: 30,
          carbsPercentage: 50,
          fatPercentage: 20,
        },
        sources: [
          {
            title: 'Calorie Calculator - Mayo Clinic',
            url: 'https://www.mayoclinic.org/healthy-lifestyle/weight-loss/in-depth/calories/art-20048890',
            snippet:
              'Calculate your daily calorie needs based on age, sex, height, weight, and activity level.',
            score: 0.95,
          },
          {
            title: 'Dietary Guidelines for Americans - USDA',
            url: 'https://www.dietaryguidelines.gov/',
            snippet:
              'Official dietary guidelines including calorie recommendations for different demographics.',
            score: 0.92,
          },
        ],
        summary:
          'Based on your profile, your estimated daily calorie needs are around 2,200 calories. This includes approximately 165g protein (30%), 275g carbs (50%), and 73g fat (20%). These recommendations are based on established nutritional guidelines for your age, sex, activity level, and goals.',
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleAdjustment = async () => {
    if (!adjustmentText.trim() || !results) return
    
    setIsAdjusting(true)
    try {
      // In a real implementation, this would call an API to adjust the plan
      // For now, we'll simulate an adjustment
      const adjustedResults = { ...results }
      
      // Simple adjustment logic based on common requests
      const lowerText = adjustmentText.toLowerCase()
      
      if (lowerText.includes('more protein') || lowerText.includes('increase protein')) {
        adjustedResults.macros.protein = Math.round(adjustedResults.macros.protein * 1.2)
        adjustedResults.macros.carbs = Math.round(adjustedResults.macros.carbs * 0.9)
      } else if (lowerText.includes('less carbs') || lowerText.includes('lower carbs')) {
        adjustedResults.macros.carbs = Math.round(adjustedResults.macros.carbs * 0.8)
        adjustedResults.macros.fat = Math.round(adjustedResults.macros.fat * 1.1)
      } else if (lowerText.includes('more calories') || lowerText.includes('increase calories')) {
        adjustedResults.dailyCalories = Math.round(adjustedResults.dailyCalories * 1.1)
        adjustedResults.macros.protein = Math.round(adjustedResults.macros.protein * 1.1)
        adjustedResults.macros.carbs = Math.round(adjustedResults.macros.carbs * 1.1)
        adjustedResults.macros.fat = Math.round(adjustedResults.macros.fat * 1.1)
      } else if (lowerText.includes('less calories') || lowerText.includes('fewer calories')) {
        adjustedResults.dailyCalories = Math.round(adjustedResults.dailyCalories * 0.9)
        adjustedResults.macros.protein = Math.round(adjustedResults.macros.protein * 0.9)
        adjustedResults.macros.carbs = Math.round(adjustedResults.macros.carbs * 0.9)
        adjustedResults.macros.fat = Math.round(adjustedResults.macros.fat * 0.9)
      }
      
      adjustedResults.summary = `${adjustedResults.summary} (Adjusted based on your preferences: "${adjustmentText}")`
      
      setResults(adjustedResults)
      setShowAdjustments(false)
      setAdjustmentText('')
      
      if (onSpeakText) {
        onSpeakText('I\'ve adjusted your plan based on your preferences. Here are your updated recommendations.')
      }
    } catch (error) {
      console.error('Error adjusting plan:', error)
    } finally {
      setIsAdjusting(false)
    }
  }

  const handleShowAdjustments = () => {
    setShowAdjustments(true)
    if (onSpeakText) {
      onSpeakText('You can now adjust your nutrition plan. Tell me what changes you\'d like to make, such as more protein, fewer carbs, or different calorie targets.')
    }
  }

  if (isSearching) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Searching for personalized calorie recommendations...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={performSearch} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!results) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Your Personalized Nutrition Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {results.dailyCalories}
              </div>
              <div className="text-sm text-blue-800">Daily Calories</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {results.macros?.protein || results.protein || 0}g
              </div>
              <div className="text-sm text-green-800">Protein</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {results.macros?.carbs || results.carbs || 0}g
              </div>
              <div className="text-sm text-yellow-800">Carbs</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {results.macros?.fat || results.fat || 0}g
              </div>
              <div className="text-sm text-purple-800">Fat</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Summary</h4>
            <p className="text-sm text-gray-700">{results.summary}</p>
          </div>

          {showAdjustments && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Adjust Your Plan
              </h4>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Tell me what changes you'd like to make to your nutrition plan:
                </p>
                <Textarea
                  value={adjustmentText}
                  onChange={(e) => setAdjustmentText(e.target.value)}
                  placeholder="e.g., I want more protein, fewer carbs, or increase calories by 200"
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleAdjustment}
                    disabled={isAdjusting || !adjustmentText.trim()}
                    className="flex-1"
                  >
                    {isAdjusting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adjusting...
                      </>
                    ) : (
                      'Apply Changes'
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowAdjustments(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {!showAdjustments && (
              <Button
                onClick={handleShowAdjustments}
                variant="outline"
                className="flex-1"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Adjust Plan
              </Button>
            )}
            <Button onClick={async () => {
              // Save nutrition targets to database if userId is provided
              if (userId && results) {
                try {
                  await DatabaseStub.saveNutritionTargets(userId, {
                    dailyCalories: results.dailyCalories,
                    targetProtein: results.macros?.protein || results.protein || 0,
                    targetCarbs: results.macros?.carbs || results.carbs || 0,
                    targetFat: results.macros?.fat || results.fat || 0,
                  })
                  console.log('Nutrition targets saved successfully')
                } catch (error) {
                  console.error('Failed to save nutrition targets:', error)
                }
              }
              onComplete()
            }} className="flex-1">
              Complete Setup
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sources & References</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.sources.map((source, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium mb-2 text-blue-600">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        {source.title}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {source.snippet}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Relevance: {Math.round(source.score * 100)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> These recommendations are for
              informational purposes only. Please consult with a healthcare
              professional or registered dietitian for personalized nutritional
              advice, especially if you have health conditions or specific
              dietary needs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WebSearch
