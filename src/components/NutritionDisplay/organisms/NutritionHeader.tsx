import { Card, CardContent, CardHeader } from '@/components/ui/card'
import MealHeader from '../molecules/MealHeader'
import CalorieDisplay from '../molecules/CalorieDisplay'
import { NutritionData } from '../types'

interface NutritionHeaderProps {
  data: Pick<
    NutritionData,
    'mealName' | 'mealType' | 'portionSize' | 'healthScore' | 'totalCalories'
  >
}

export default function NutritionHeader({ data }: NutritionHeaderProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <MealHeader
          mealName={data.mealName}
          mealType={data.mealType}
          portionSize={data.portionSize}
          healthScore={data.healthScore}
        />
      </CardHeader>
      <CardContent className="pt-6">
        <CalorieDisplay calories={data.totalCalories} />
      </CardContent>
    </Card>
  )
}