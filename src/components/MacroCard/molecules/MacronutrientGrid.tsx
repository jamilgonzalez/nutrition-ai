import MacroProgressBar from '../atoms/MacroProgressBar'
import { DailyNutritionData } from '../types'

interface MacronutrientGridProps {
  data: DailyNutritionData
}

export default function MacronutrientGrid({ data }: MacronutrientGridProps) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">Macronutrients</h4>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        <MacroProgressBar
          current={data.protein.current}
          goal={data.protein.goal}
          name="Protein"
        />
        <MacroProgressBar
          current={data.carbs.current}
          goal={data.carbs.goal}
          name="Carbs"
        />
        <MacroProgressBar
          current={data.fat.current}
          goal={data.fat.goal}
          name="Fat"
        />
        {/* <MacroProgressBar
          current={data.sugar.current}
          goal={data.sugar.goal}
          name="Sugar"
        /> */}
      </div>
    </div>
  )
}
