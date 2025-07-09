import { AdjustmentInput } from '../atoms/AdjustmentInput'
import { GeneratedPlan } from '@/types/onboarding'

interface MacroAdjustmentGroupProps {
  plan: GeneratedPlan
  adjustments: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  onChange: (field: 'calories' | 'protein' | 'carbs' | 'fat', value: number) => void
  className?: string
}

export function MacroAdjustmentGroup({
  plan,
  adjustments,
  onChange,
  className = ''
}: MacroAdjustmentGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Adjust Your Plan</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdjustmentInput
          id="calories"
          label="Daily Calories"
          value={adjustments.calories}
          onChange={(value) => onChange('calories', value)}
          unit="cal"
          min={1000}
          max={5000}
          step={50}
        />
        
        <AdjustmentInput
          id="protein"
          label="Protein"
          value={adjustments.protein}
          onChange={(value) => onChange('protein', value)}
          unit="g"
          min={50}
          max={300}
          step={5}
        />
        
        <AdjustmentInput
          id="carbs"
          label="Carbohydrates"
          value={adjustments.carbs}
          onChange={(value) => onChange('carbs', value)}
          unit="g"
          min={50}
          max={500}
          step={5}
        />
        
        <AdjustmentInput
          id="fat"
          label="Fat"
          value={adjustments.fat}
          onChange={(value) => onChange('fat', value)}
          unit="g"
          min={30}
          max={200}
          step={5}
        />
      </div>
      
      <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
        <p className="font-medium mb-2">Original Plan:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>Calories: {plan.calories}</div>
          <div>Protein: {plan.macros.protein}g</div>
          <div>Carbs: {plan.macros.carbs}g</div>
          <div>Fat: {plan.macros.fat}g</div>
        </div>
      </div>
    </div>
  )
}