'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Utensils,
  Zap,
  Heart,
  TrendingUp,
  Clock,
  Star,
  Apple,
  AlertCircle,
} from 'lucide-react'

export interface NutritionData {
  mealName: string
  totalCalories: number
  macros: {
    protein: number
    carbohydrates: number
    fat: number
    fiber: number
    sugar: number
  }
  micronutrients: {
    sodium?: number
    potassium?: number
    vitaminC?: number
    calcium?: number
    iron?: number
  }
  ingredients: string[]
  healthScore: number
  recommendations: string[]
  portionSize: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
}

interface NutritionDisplayProps {
  data: NutritionData
  onSaveEntry?: () => void
}

export default function NutritionDisplay({
  data,
  onSaveEntry,
}: NutritionDisplayProps) {
  // Calculate macro percentages for display
  const totalMacroCalories =
    data.macros.protein * 4 +
    data.macros.carbohydrates * 4 +
    data.macros.fat * 9
  const proteinPercentage = Math.round(
    ((data.macros.protein * 4) / totalMacroCalories) * 100
  )
  const carbPercentage = Math.round(
    ((data.macros.carbohydrates * 4) / totalMacroCalories) * 100
  )
  const fatPercentage = Math.round(
    ((data.macros.fat * 9) / totalMacroCalories) * 100
  )

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return '🌅'
      case 'lunch':
        return '☀️'
      case 'dinner':
        return '🌙'
      case 'snack':
        return '🍎'
      default:
        return '🍽️'
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-yellow-600 bg-yellow-100'
    if (score >= 4) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">
                  {getMealTypeIcon(data.mealType)}
                </span>
                {data.mealName}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Utensils className="w-4 h-4" />
                  {data.portionSize}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {data.mealType.charAt(0).toUpperCase() +
                    data.mealType.slice(1)}
                </span>
              </div>
            </div>
            <div
              className={`px-3 py-2 rounded-lg font-semibold ${getHealthScoreColor(
                data.healthScore
              )}`}
            >
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {data.healthScore}/10
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Zap className="w-8 h-8 text-yellow-500" />
              {data.totalCalories}
              <span className="text-lg text-gray-500">calories</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Macros Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Macronutrients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Protein */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-600">Protein</span>
                <span className="text-sm text-gray-600">
                  {proteinPercentage}%
                </span>
              </div>
              <Progress value={proteinPercentage} className="h-2" />
              <div className="text-center">
                <span className="text-2xl font-bold">
                  {data.macros.protein}g
                </span>
                <p className="text-xs text-gray-500">
                  {data.macros.protein * 4} calories
                </p>
              </div>
            </div>

            {/* Carbohydrates */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-600">Carbs</span>
                <span className="text-sm text-gray-600">{carbPercentage}%</span>
              </div>
              <Progress value={carbPercentage} className="h-2" />
              <div className="text-center">
                <span className="text-2xl font-bold">
                  {data.macros.carbohydrates}g
                </span>
                <p className="text-xs text-gray-500">
                  {data.macros.carbohydrates * 4} calories
                </p>
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-purple-600">Fat</span>
                <span className="text-sm text-gray-600">{fatPercentage}%</span>
              </div>
              <Progress value={fatPercentage} className="h-2" />
              <div className="text-center">
                <span className="text-2xl font-bold">{data.macros.fat}g</span>
                <p className="text-xs text-gray-500">
                  {data.macros.fat * 9} calories
                </p>
              </div>
            </div>
          </div>

          {/* Additional macros */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Fiber</p>
              <p className="text-lg font-semibold">{data.macros.fiber}g</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Sugar</p>
              <p className="text-lg font-semibold">{data.macros.sugar}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Micronutrients Card */}
      {Object.values(data.micronutrients).some(
        (value) => value !== undefined
      ) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Key Micronutrients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {data.micronutrients.sodium && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Sodium</p>
                  <p className="font-semibold">
                    {data.micronutrients.sodium}mg
                  </p>
                </div>
              )}
              {data.micronutrients.potassium && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Potassium</p>
                  <p className="font-semibold">
                    {data.micronutrients.potassium}mg
                  </p>
                </div>
              )}
              {data.micronutrients.vitaminC && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Vitamin C</p>
                  <p className="font-semibold">
                    {data.micronutrients.vitaminC}mg
                  </p>
                </div>
              )}
              {data.micronutrients.calcium && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Calcium</p>
                  <p className="font-semibold">
                    {data.micronutrients.calcium}mg
                  </p>
                </div>
              )}
              {data.micronutrients.iron && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Iron</p>
                  <p className="font-semibold">{data.micronutrients.iron}mg</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ingredients Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-green-500" />
            Identified Ingredients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.ingredients.map((ingredient, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {ingredient}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Card */}
      {data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Nutritional Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Entry Button */}
      {onSaveEntry && (
        <div className="text-center pt-4">
          <button
            onClick={onSaveEntry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save to My Nutrition Log
          </button>
        </div>
      )}
    </div>
  )
}
