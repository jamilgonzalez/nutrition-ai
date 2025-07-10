import { Badge } from '@/components/ui/badge'

interface MealsHeaderProps {
  mealCount: number
}

export default function MealsHeader({ mealCount }: MealsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold">Today&apos;s Meals</h4>
      <Badge variant="outline">{mealCount} recorded</Badge>
    </div>
  )
}