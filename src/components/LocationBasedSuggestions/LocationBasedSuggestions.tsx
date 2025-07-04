'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useLocation } from '@/hooks/useLocation'
import { searchRestaurantMenuItems } from '@/lib/restaurantService'
import SectionHeader from './molecules/SectionHeader'
import TabSelector from './molecules/TabSelector'
import HomecookedSuggestions from './organisms/HomecookedSuggestions'
import RestaurantSuggestions from './organisms/RestaurantSuggestions'
import { getMacroTargetsFromDailyGoals, createCacheKey } from './utils/macroCalculations'
import { LocationBasedSuggestionsProps, MenuItem, MacroTargets, TabType } from './types'

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
  const [selectedTab, setSelectedTab] = useState<TabType>('homecooked')
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

    const cacheKey = createCacheKey(city, dailyNutritionData.caloriesRemaining)

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

  return (
    <div className="pt-4 border-t">
      <SectionHeader
        title="Meal Suggestions"
        caloriesRemaining={dailyNutritionData.caloriesRemaining}
      />

      <div className="space-y-4">
        <TabSelector
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          city={city || undefined}
        />

        <div className="mt-4">
          {selectedTab === 'homecooked' ? (
            <HomecookedSuggestions dailyNutritionData={dailyNutritionData} />
          ) : (
            <RestaurantSuggestions
              locationError={locationError}
              locationLoading={locationLoading}
              loading={loading}
              error={error}
              city={city || undefined}
              menuItems={menuItems}
              onRequestLocation={requestLocation}
              onRetry={searchRestaurants}
            />
          )}
        </div>
      </div>
    </div>
  )
}