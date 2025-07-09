import { useState } from 'react'
import { MacroAdjustmentGroup } from '../molecules/MacroAdjustmentGroup'
import { FormTextarea } from '../atoms/FormTextarea'
import { SubmitButton } from '../atoms/SubmitButton'
import { GeneratedPlan, PlanAdjustmentRequest } from '@/types/onboarding'

interface PlanAdjustmentFormProps {
  plan: GeneratedPlan
  onSubmit: (adjustments: PlanAdjustmentRequest) => void
  onCancel: () => void
  loading?: boolean
  className?: string
}

export function PlanAdjustmentForm({
  plan,
  onSubmit,
  onCancel,
  loading = false,
  className = ''
}: PlanAdjustmentFormProps) {
  const [adjustments, setAdjustments] = useState({
    calories: plan.calories,
    protein: plan.macros.protein,
    carbs: plan.macros.carbs,
    fat: plan.macros.fat
  })
  
  const [adjustmentReason, setAdjustmentReason] = useState('')

  const handleMacroChange = (field: 'calories' | 'protein' | 'carbs' | 'fat', value: number) => {
    setAdjustments(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!adjustmentReason.trim()) {
      alert('Please provide a reason for the adjustment')
      return
    }

    const adjustmentRequest: PlanAdjustmentRequest = {
      adjustmentReason,
      ...(adjustments.calories !== plan.calories && { calories: adjustments.calories }),
      ...(adjustments.protein !== plan.macros.protein && { protein: adjustments.protein }),
      ...(adjustments.carbs !== plan.macros.carbs && { carbs: adjustments.carbs }),
      ...(adjustments.fat !== plan.macros.fat && { fat: adjustments.fat })
    }

    onSubmit(adjustmentRequest)
  }

  const hasChanges = 
    adjustments.calories !== plan.calories ||
    adjustments.protein !== plan.macros.protein ||
    adjustments.carbs !== plan.macros.carbs ||
    adjustments.fat !== plan.macros.fat

  return (
    <form onSubmit={handleSubmit} className={`space-y-8 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Adjust Your Plan
        </h2>
        <p className="text-gray-600">
          Make changes to better fit your preferences
        </p>
      </div>

      <MacroAdjustmentGroup
        plan={plan}
        adjustments={adjustments}
        onChange={handleMacroChange}
      />

      <FormTextarea
        id="adjustmentReason"
        label="Why are you making these adjustments?"
        value={adjustmentReason}
        onChange={(e) => setAdjustmentReason(e.target.value)}
        placeholder="e.g., I prefer more protein for muscle building, I want fewer calories for faster weight loss..."
        required
        rows={3}
      />

      <div className="flex gap-4 justify-center pt-6">
        <SubmitButton
          type="button"
          onClick={onCancel}
          variant="outline"
          className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </SubmitButton>
        <SubmitButton
          disabled={!hasChanges || !adjustmentReason.trim()}
          loading={loading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? 'Updating Plan...' : 'Review Updated Plan'}
        </SubmitButton>
      </div>
    </form>
  )
}