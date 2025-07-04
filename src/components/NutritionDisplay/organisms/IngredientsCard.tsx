import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Apple } from 'lucide-react'
import IngredientsList from '../molecules/IngredientsList'

interface IngredientsCardProps {
  ingredients: string[]
}

export default function IngredientsCard({ ingredients }: IngredientsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Apple className="w-5 h-5 text-green-500" />
          Identified Ingredients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <IngredientsList ingredients={ingredients} />
      </CardContent>
    </Card>
  )
}