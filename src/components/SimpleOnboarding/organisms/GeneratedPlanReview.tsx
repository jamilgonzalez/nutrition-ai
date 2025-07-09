import { MacroCard } from '../atoms/MacroCard'
import { PlanExplanation } from '../molecules/PlanExplanation'
import { SourcesList } from '../molecules/SourcesList'
import { SubmitButton } from '../atoms/SubmitButton'
import { GeneratedPlan } from '@/types/onboarding'

interface GeneratedPlanReviewProps {
  plan: GeneratedPlan
  onAccept: () => void
  onAdjust: () => void
  className?: string
}

export function GeneratedPlanReview({
  plan,
  onAccept,
  onAdjust,
  className = ''
}: GeneratedPlanReviewProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Your Personalized Nutrition Plan
        </h2>
        <p className="text-gray-600">
          Based on your information, here's what we recommend
        </p>
      </div>

      {/* Macro Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MacroCard
          label="Daily Calories"
          value={plan.calories}
          unit="cal"
          color="bg-blue-500"
        />
        <MacroCard
          label="Protein"
          value={plan.macros.protein}
          unit="g"
          color="bg-red-500"
        />
        <MacroCard
          label="Carbs"
          value={plan.macros.carbs}
          unit="g"
          color="bg-green-500"
        />
        <MacroCard
          label="Fat"
          value={plan.macros.fat}
          unit="g"
          color="bg-yellow-500"
        />
      </div>

      {/* Fiber info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Daily Fiber Goal:</span>
          <span className="text-sm font-bold text-gray-900">{plan.macros.fiber}g</span>
        </div>
      </div>

      {/* Plan Explanation */}
      <PlanExplanation plan={plan} />

      {/* Sources */}
      <SourcesList sources={plan.sources} />

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-6">
        <SubmitButton
          onClick={onAdjust}
          variant="outline"
          className="px-6 py-3 border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          Make Adjustments
        </SubmitButton>
        <SubmitButton
          onClick={onAccept}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white"
        >
          Accept Plan
        </SubmitButton>
      </div>
    </div>
  )
}