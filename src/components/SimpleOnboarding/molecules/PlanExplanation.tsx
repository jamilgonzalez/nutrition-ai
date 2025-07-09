import { GeneratedPlan } from '@/types/onboarding'

interface PlanExplanationProps {
  plan: GeneratedPlan
  className?: string
}

export function PlanExplanation({
  plan,
  className = ''
}: PlanExplanationProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Plan Explanation</h3>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Why this plan works for you:</h4>
        <p className="text-sm text-blue-800 leading-relaxed">
          {plan.explanation}
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Methodology:</h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          {plan.methodology}
        </p>
      </div>
    </div>
  )
}