import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart } from 'lucide-react'
import MicronutrientGrid from '../molecules/MicronutrientGrid'
import { NutritionData } from '../types'

interface MicronutrientCardProps {
  micronutrients: NutritionData['micronutrients']
}

export default function MicronutrientCard({
  micronutrients,
}: MicronutrientCardProps) {
  const hasMicronutrients = Object.values(micronutrients).some(
    (value) => value !== undefined
  )

  if (!hasMicronutrients) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Key Micronutrients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MicronutrientGrid micronutrients={micronutrients} />
      </CardContent>
    </Card>
  )
}