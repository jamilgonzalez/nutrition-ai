import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import MacroSection from '../molecules/MacroSection'
import { NutritionData } from '../types'

interface MacronutrientCardProps {
  macros: NutritionData['macros']
}

export default function MacronutrientCard({ macros }: MacronutrientCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Macronutrients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MacroSection macros={macros} />
      </CardContent>
    </Card>
  )
}