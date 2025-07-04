import { getGradientColor } from '../utils/colorHelpers'
import { DEFAULT_DAILY_GOALS } from '../constants'

interface CaloriesOverviewProps {
  consumed: number
  remaining: number
  dailyGoal: number
}

export default function CaloriesOverview({
  consumed,
  remaining,
  dailyGoal,
}: CaloriesOverviewProps) {
  const percentage = (consumed / dailyGoal) * 100
  const gradientColor = getGradientColor(percentage)

  return (
    <div className="text-center space-y-2">
      <div className="text-3xl font-bold text-green-600">{remaining}</div>
      <div className="text-sm text-muted-foreground">
        Calories remaining of {dailyGoal} goal
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: gradientColor,
          }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        {consumed} consumed • {remaining} remaining
      </div>
    </div>
  )
}