import { Progress } from '@/components/ui/progress'
import { calculateMacroCalories } from '../utils/nutritionCalculations'

interface MacroProgressBarProps {
  name: string
  amount: number
  percentage: number
  color: string
  type: 'protein' | 'carbohydrates' | 'fat'
}

export default function MacroProgressBar({
  name,
  amount,
  percentage,
  color,
  type,
}: MacroProgressBarProps) {
  const calories = calculateMacroCalories(amount, type)

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className={`font-medium ${color}`}>{name}</span>
        <span className="text-sm text-gray-600">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="text-center">
        <span className="text-2xl font-bold">{amount}g</span>
        <p className="text-xs text-gray-500">{calories} calories</p>
      </div>
    </div>
  )
}