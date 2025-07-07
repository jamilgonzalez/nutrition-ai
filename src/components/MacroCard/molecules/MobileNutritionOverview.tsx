import { Card, CardContent } from '@/components/ui/card'
import { Target } from 'lucide-react'

interface MobileNutritionOverviewProps {
  caloriesConsumed: number
  caloriesGoal: number
  caloriesRemaining: number
}

export default function MobileNutritionOverview({
  caloriesConsumed,
  caloriesGoal,
  caloriesRemaining
}: MobileNutritionOverviewProps) {
  const progressPercentage = Math.min((caloriesConsumed / caloriesGoal) * 100, 100)
  
  return (
    <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-emerald-100">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Today's Progress</span>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-bold">{caloriesRemaining}</div>
            <p className="text-emerald-100 text-sm">
              calories remaining of {caloriesGoal.toLocaleString()}
            </p>
          </div>

          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-emerald-100">
            <span>{caloriesConsumed} consumed</span>
            <span>{caloriesRemaining} left</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}