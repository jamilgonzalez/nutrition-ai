import { Clock } from 'lucide-react'

interface RestaurantInfoProps {
  restaurantName: string
  estimatedDeliveryTime?: string
}

export default function RestaurantInfo({
  restaurantName,
  estimatedDeliveryTime,
}: RestaurantInfoProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-green-700">
      <span className="font-medium">{restaurantName}</span>
      {estimatedDeliveryTime && (
        <>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{estimatedDeliveryTime}</span>
          </div>
        </>
      )}
    </div>
  )
}