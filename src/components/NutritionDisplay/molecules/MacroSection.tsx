import MacroProgressBar from '../atoms/MacroProgressBar'
import { calculateMacroPercentages } from '../utils/nutritionCalculations'
import { NutritionData } from '../types'

interface MacroSectionProps {
  macros: NutritionData['macros']
}

export default function MacroSection({ macros }: MacroSectionProps) {
  const percentages = calculateMacroPercentages(macros)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MacroProgressBar
          name="Protein"
          amount={macros.protein}
          percentage={percentages.protein}
          color="text-blue-600"
          type="protein"
        />
        <MacroProgressBar
          name="Carbs"
          amount={macros.carbohydrates}
          percentage={percentages.carbohydrates}
          color="text-green-600"
          type="carbohydrates"
        />
        <MacroProgressBar
          name="Fat"
          amount={macros.fat}
          percentage={percentages.fat}
          color="text-purple-600"
          type="fat"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-sm text-gray-600">Fiber</p>
          <p className="text-lg font-semibold">{macros.fiber}g</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <p className="text-sm text-gray-600">Sugar</p>
          <p className="text-lg font-semibold">{macros.sugar}g</p>
        </div>
      </div>
    </div>
  )
}