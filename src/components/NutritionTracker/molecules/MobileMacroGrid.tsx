import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface MacroData {
  current: number
  goal: number
  unit: string
}

interface MacroDisplayData extends MacroData {
  name: string
  percentage: number
  isOverTarget: boolean
}

interface MobileMacroGridProps {
  macros: {
    protein: MacroData
    carbs: MacroData
    fat: MacroData
  }
}

export default function MobileMacroGrid({ macros }: MobileMacroGridProps) {
  // Process macro data with validation and calculations
  const processedMacros: MacroDisplayData[] = Object.entries(macros).map(([key, macro]) => {
    const safeCurrent = Math.max(0, macro.current)
    const safeGoal = Math.max(1, macro.goal) // Prevent division by zero
    const percentage = Math.min((safeCurrent / safeGoal) * 100, 100)
    const isOverTarget = safeCurrent > safeGoal
    
    return {
      name: key,
      current: safeCurrent,
      goal: safeGoal,
      unit: macro.unit,
      percentage,
      isOverTarget
    }
  })

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <header className="text-center mb-3">
          <h3 className="text-sm font-semibold text-slate-700">
            Macronutrients
          </h3>
        </header>
        <section className="space-y-3" role="group" aria-label="Macronutrient progress">
          {processedMacros.map((macro) => (
            <div key={macro.name} className="flex items-center gap-3">
              <div className="w-16 text-xs font-medium text-slate-600 capitalize">
                {macro.name}
              </div>
              <div className="flex-1">
                <Progress 
                  value={macro.percentage}
                  className="h-2"
                  aria-label={`${macro.name}: ${macro.current} of ${macro.goal} ${macro.unit} (${Math.round(macro.percentage)}%)`}
                />
              </div>
              <div className={`text-xs font-semibold w-16 text-right ${
                macro.isOverTarget ? 'text-amber-600' : 'text-slate-700'
              }`}>
                <span aria-label={`${macro.current} consumed out of ${macro.goal} ${macro.unit} target`}>
                  {macro.current.toLocaleString()}/{macro.goal.toLocaleString()}{macro.unit}
                </span>
              </div>
            </div>
          ))}
        </section>
      </CardContent>
    </Card>
  )
}