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
  // Validate inputs and handle edge cases
  const safeCaloriesConsumed = Math.max(0, caloriesConsumed)
  const safeCaloriesGoal = Math.max(1, caloriesGoal) // Prevent division by zero
  const safeCaloriesRemaining = Math.max(0, caloriesRemaining)
  
  const progressPercentage = Math.min((safeCaloriesConsumed / safeCaloriesGoal) * 100, 100)
  
  return (
    <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
      <CardContent className="p-4">
        <section className="text-center space-y-3" aria-labelledby="nutrition-overview-heading">
          <header className="flex items-center justify-center gap-2 text-emerald-100">
            <Target className="w-4 h-4" aria-hidden="true" />
            <h2 id="nutrition-overview-heading" className="text-sm font-medium">Today's Progress</h2>
          </header>

          <div className="space-y-2">
            <div className="text-4xl font-bold" aria-label={`${safeCaloriesRemaining} calories remaining`}>
              {safeCaloriesRemaining.toLocaleString()}
            </div>
            <p className="text-emerald-100 text-sm">
              calories remaining of {safeCaloriesGoal.toLocaleString()}
            </p>
          </div>

          <div className="bg-white/20 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${Math.round(progressPercentage)}% of daily calorie goal consumed`}>
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-emerald-100" role="group" aria-label="Calorie breakdown">
            <span aria-label={`${safeCaloriesConsumed} calories consumed`}>{safeCaloriesConsumed.toLocaleString()} consumed</span>
            <span aria-label={`${safeCaloriesRemaining} calories remaining`}>{safeCaloriesRemaining.toLocaleString()} left</span>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}