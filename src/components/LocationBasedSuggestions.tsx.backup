'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MapPin, Clock, Star, AlertCircle } from 'lucide-react'
import { useLocation } from '@/hooks/useLocation'
import {
  searchRestaurantMenuItems,
  getMacroTargetsFromDailyGoals,
} from '@/lib/restaurantService'
import { MenuItem, MacroTargets } from '@/types/restaurant'
import { DailyNutritionData } from './MacroCard'

interface LocationBasedSuggestionsProps {
  dailyNutritionData: DailyNutritionData
}

export default function LocationBasedSuggestions({
  dailyNutritionData,
}: LocationBasedSuggestionsProps) {
  const {
    location,
    city,
    loading: locationLoading,
    error: locationError,
    requestLocation,
  } = useLocation()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'homecooked' | 'restaurant'>(
    'homecooked'
  )
  const searchCacheRef = useRef<{ [key: string]: MenuItem[] }>({})

  // Calculate macro targets based on remaining daily goals
  const macroTargets: MacroTargets = useMemo(
    () =>
      getMacroTargetsFromDailyGoals(
        dailyNutritionData.caloriesRemaining,
        0.25, // 25% protein
        0.45, // 45% carbs
        0.3 // 30% fat
      ),
    [dailyNutritionData.caloriesRemaining]
  )

  const searchRestaurants = useCallback(async () => {
    if (!city) return

    // Create cache key based on city and calories remaining (rounded to nearest 100)
    const cacheKey = `${city}-${
      Math.round(dailyNutritionData.caloriesRemaining / 100) * 100
    }`

    // Check cache first
    if (searchCacheRef.current[cacheKey]) {
      setMenuItems(searchCacheRef.current[cacheKey])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await searchRestaurantMenuItems(city, macroTargets)
      setMenuItems(result.menuItems)

      // Cache the results
      searchCacheRef.current[cacheKey] = result.menuItems
    } catch (err) {
      setError('Failed to find restaurant suggestions. Please try again.')
      console.error('Restaurant search error:', err)
    } finally {
      setLoading(false)
    }
  }, [city, macroTargets, dailyNutritionData.caloriesRemaining])

  useEffect(() => {
    if (city && selectedTab === 'restaurant') {
      searchRestaurants()
    }
  }, [city, selectedTab, searchRestaurants])

  const HomecookedSuggestions = () => (
    <div className="space-y-3">
      {dailyNutritionData.suggestedMeal ? (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">
                {dailyNutritionData.suggestedMeal.name}
              </h4>
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-700 border-blue-200"
              >
                AI Recommended
              </Badge>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Perfect balance for your remaining macros
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                {dailyNutritionData.suggestedMeal.calories}cal
              </span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {dailyNutritionData.suggestedMeal.protein}p
              </span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                {dailyNutritionData.suggestedMeal.carbs}c
              </span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                {dailyNutritionData.suggestedMeal.fat}f
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm">No homecooked suggestions available</p>
        </div>
      )}
    </div>
  )

  const RestaurantSuggestions = () => {
    if (locationError) {
      return (
        <div className="text-center py-6 space-y-3">
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Location needed</span>
          </div>
          <p className="text-sm text-muted-foreground">{locationError}</p>
          <Button onClick={requestLocation} variant="outline" size="sm">
            <MapPin className="w-4 h-4 mr-2" />
            Enable Location
          </Button>
        </div>
      )
    }

    if (locationLoading) {
      return (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Getting your location...
          </p>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            Finding restaurants near you...
          </p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-6 space-y-3">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Search failed</span>
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={searchRestaurants} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      )
    }

    if (menuItems.length === 0) {
      return (
        <div className="text-center py-6 space-y-3">
          <p className="text-sm text-muted-foreground">
            No restaurant options found that match your macro targets.
          </p>
          <Button onClick={searchRestaurants} variant="outline" size="sm">
            Search Again
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {city && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span>Near {city}</span>
          </div>
        )}
        {menuItems.slice(0, 5).map((item) => (
          <Card
            key={item.id}
            className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:shadow-sm transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 text-sm mb-1">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <span className="font-medium">{item.restaurantName}</span>
                    {item.estimatedDeliveryTime && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.estimatedDeliveryTime}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {item.macroFitScore && (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 border-green-200"
                  >
                    {Math.round(item.macroFitScore * 100)}% match
                  </Badge>
                )}
              </div>

              {item.description && (
                <p className="text-xs text-green-600 mb-2 line-clamp-2">
                  {item.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                    {item.calories}cal
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {item.protein}p
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    {item.carbs}c
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                    {item.fat}f
                  </span>
                </div>
                {item.price && (
                  <span className="text-sm font-medium text-green-800">
                    ${item.price.toFixed(2)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="pt-4 border-t">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">Meal Suggestions</h4>
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          {dailyNutritionData.caloriesRemaining} cal remaining
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="grid w-full grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          <button
            onClick={() => setSelectedTab('homecooked')}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              selectedTab === 'homecooked'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/50'
            )}
          >
            Homecooked
          </button>
          <button
            onClick={() => setSelectedTab('restaurant')}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              selectedTab === 'restaurant'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/50'
            )}
          >
            <span className="hidden sm:inline">Nearby Restaurants</span>
            <span className="sm:hidden">Restaurants</span>
            {city && <span className="ml-1 text-xs">({city})</span>}
          </button>
        </div>

        <div className="mt-4">
          {selectedTab === 'homecooked' ? (
            <HomecookedSuggestions />
          ) : (
            <RestaurantSuggestions />
          )}
        </div>
      </div>
    </div>
  )
}
