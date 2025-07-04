import LoadingSpinner from '../atoms/LoadingSpinner'
import LocationPrompt from '../molecules/LocationPrompt'
import ErrorMessage from '../atoms/ErrorMessage'
import EmptyState from '../molecules/EmptyState'
import LocationIndicator from '../atoms/LocationIndicator'
import RestaurantMenuItem from './RestaurantMenuItem'
import { MenuItem } from '../types'

interface RestaurantSuggestionsProps {
  locationError: string | null
  locationLoading: boolean
  loading: boolean
  error: string | null
  city?: string
  menuItems: MenuItem[]
  onRequestLocation: () => void
  onRetry: () => void
}

export default function RestaurantSuggestions({
  locationError,
  locationLoading,
  loading,
  error,
  city,
  menuItems,
  onRequestLocation,
  onRetry,
}: RestaurantSuggestionsProps) {
  if (locationError) {
    return (
      <LocationPrompt error={locationError} onRequestLocation={onRequestLocation} />
    )
  }

  if (locationLoading) {
    return <LoadingSpinner message="Getting your location..." />
  }

  if (loading) {
    return <LoadingSpinner message="Finding restaurants near you..." />
  }

  if (error) {
    return (
      <ErrorMessage
        title="Search failed"
        message={error}
        onRetry={onRetry}
      />
    )
  }

  if (menuItems.length === 0) {
    return (
      <EmptyState
        message="No restaurant options found that match your macro targets."
        onRetry={onRetry}
      />
    )
  }

  return (
    <div className="space-y-3">
      {city && <LocationIndicator city={city} />}
      {menuItems.slice(0, 5).map((item) => (
        <RestaurantMenuItem key={item.id} item={item} />
      ))}
    </div>
  )
}