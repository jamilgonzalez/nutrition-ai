import { Badge } from '@/components/ui/badge'

interface IngredientBadgeProps {
  ingredient: string
}

export default function IngredientBadge({ ingredient }: IngredientBadgeProps) {
  return (
    <Badge variant="secondary" className="text-sm">
      {ingredient}
    </Badge>
  )
}