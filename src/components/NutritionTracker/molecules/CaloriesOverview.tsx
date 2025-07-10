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
  // const gradientColor = getGradientColor(percentage)

  return (
    <div className="text-center space-y-2">
      <div className="text-3xl font-bold text-green-600 transition-all duration-500 ease-out">
        {remaining}
      </div>
      <div className="text-sm text-muted-foreground">
        Calories remaining of {dailyGoal} goal
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: '#000000',
          }}
        />
      </div>
      <div className="text-xs text-muted-foreground transition-all duration-500">
        <span className="transition-all duration-500">{consumed}</span> consumed
        • <span className="transition-all duration-500">{remaining}</span>{' '}
        remaining
      </div>
    </div>
  )
}
