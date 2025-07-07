import { getGradientColor, calculatePercentage } from '../utils/colorHelpers'
import { MacroProgressProps } from '../types'

export default function MacroProgressBar({
  current,
  goal,
  name,
}: MacroProgressProps) {
  const percentage = calculatePercentage(current, goal)
  const color = getGradientColor(percentage)

  return (
    <div className="space-y-1">
      <div className="text-center">
        <span className="text-xs font-medium">{name}</span>
        <div className="text-xs text-muted-foreground transition-all duration-500">
          <span className="transition-all duration-500">{current}</span>/<span className="transition-all duration-300">{goal}</span>g
        </div>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}