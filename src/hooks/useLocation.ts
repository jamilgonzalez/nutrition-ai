import { useState, useEffect, useCallback } from 'react'
import {
  getCurrentLocation,
  getCityFromCoordinates,
  getLocationErrorMessage,
  UserLocation,
  LocationError,
} from '@/lib/locationService'

interface UseLocationReturn {
  location: UserLocation | null
  city: string | null
  loading: boolean
  error: string | null
  requestLocation: () => Promise<void>
  clearError: () => void
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [city, setCity] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const userLocation = await getCurrentLocation()
      setLocation(userLocation)

      // Get city name from coordinates
      const cityName = await getCityFromCoordinates(
        userLocation.latitude,
        userLocation.longitude
      )
      setCity(cityName)

      // Update location object with city info
      setLocation({ ...userLocation, city: cityName })
    } catch (err) {
      const locationError = err as LocationError
      setError(getLocationErrorMessage(locationError))
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = () => {
    setError(null)
  }

  // Auto-request location on mount if not already available
  useEffect(() => {
    if (!location && !loading && !error) {
      requestLocation()
    }
  }, [location, loading, error, requestLocation])

  return {
    location,
    city,
    loading,
    error,
    requestLocation,
    clearError,
  }
}
