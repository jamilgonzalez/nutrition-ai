import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import RestaurantInfo from '../molecules/RestaurantInfo'
import MacroDisplay from '../molecules/MacroDisplay'
import { MenuItem } from '../types'

interface RestaurantMenuItemProps {
  item: MenuItem
}

export default function RestaurantMenuItem({ item }: RestaurantMenuItemProps) {
  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-green-900 text-sm mb-1">
              {item.name}
            </h4>
            <RestaurantInfo
              restaurantName={item.restaurantName}
              estimatedDeliveryTime={item.estimatedDeliveryTime}
            />
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
          <MacroDisplay
            calories={item.calories}
            protein={item.protein}
            carbs={item.carbs}
            fat={item.fat}
          />
          {item.price && (
            <span className="text-sm font-medium text-green-800">
              ${item.price.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}