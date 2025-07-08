import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface MacroData {
  current: number
  goal: number
  unit: string
}

interface MobileMacroGridProps {
  macros: {
    protein: MacroData
    carbs: MacroData
    fat: MacroData
  }
}

export default function MobileMacroGrid({ macros }: MobileMacroGridProps) {
  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 text-center">
          Macronutrients
        </h3>
        <div className="space-y-3">
          {Object.entries(macros).map(([key, macro]) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-16 text-xs font-medium text-slate-600 capitalize">
                {key}
              </div>
              <div className="flex-1">
                <Progress 
                  value={Math.min((macro.current / macro.goal) * 100, 100)} 
                  className="h-2" 
                />
              </div>
              <div className="text-xs font-semibold text-slate-700 w-16 text-right">
                {macro.current}/{macro.goal}{macro.unit}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}