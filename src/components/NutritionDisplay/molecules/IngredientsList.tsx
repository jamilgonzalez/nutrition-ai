import IngredientBadge from '../atoms/IngredientBadge'

interface IngredientsListProps {
  ingredients: string[]
}

export default function IngredientsList({ ingredients }: IngredientsListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ingredients.map((ingredient, index) => (
        <IngredientBadge key={index} ingredient={ingredient} />
      ))}
    </div>
  )
}