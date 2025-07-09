import { MacroCard } from '../atoms/MacroCard'
import { PlanExplanation } from '../molecules/PlanExplanation'
import { SourcesList } from '../molecules/SourcesList'
import { SubmitButton } from '../atoms/SubmitButton'
import { GeneratedPlan, AdjustedPlan } from '@/types/onboarding'

interface GeneratedPlanReviewProps {
  plan: GeneratedPlan | AdjustedPlan
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
  const isAdjusted = 'adjustments' in plan
  
  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {isAdjusted ? 'Your Adjusted Nutrition Plan' : 'Your Personalized Nutrition Plan'}
        </h2>
        <p className="text-gray-600">
          {isAdjusted 
            ? 'Here\'s your updated plan with the adjustments you requested'
            : 'Based on your information, here\'s what we recommend'
          }
        </p>
      </div>

      {/* Show adjustment summary if plan was adjusted */}
      {isAdjusted && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Adjustments Made:</h3>
          <p className="text-sm text-blue-800 mb-2">
            <strong>Reason:</strong> {plan.adjustments.adjustmentReason}
          </p>
          <div className="text-sm text-blue-800">
            <strong>Changes:</strong>
            <ul className="list-disc ml-4 mt-1">
              {plan.adjustments.calories && <li>Calories: {plan.adjustments.calories}</li>}
              {plan.adjustments.protein && <li>Protein: {plan.adjustments.protein}g</li>}
              {plan.adjustments.carbs && <li>Carbs: {plan.adjustments.carbs}g</li>}
              {plan.adjustments.fat && <li>Fat: {plan.adjustments.fat}g</li>}
            </ul>
          </div>
        </div>
      )}

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

      {/* Adjustment Explanation if plan was adjusted */}
      {isAdjusted && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Adjustment Impact:</h4>
          <p className="text-sm text-green-800 leading-relaxed">
            {plan.adjustmentExplanation}
          </p>
        </div>
      )}

      {/* Sources */}
      <SourcesList sources={plan.sources} />

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-6">
        <SubmitButton
          onClick={onAdjust}
          variant="outline"
          className="px-6 py-3 border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          {isAdjusted ? 'Make More Adjustments' : 'Make Adjustments'}
        </SubmitButton>
        <SubmitButton
          onClick={onAccept}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white"
        >
          {isAdjusted ? 'Accept Adjusted Plan' : 'Accept Plan'}
        </SubmitButton>
      </div>
    </div>
  )
}