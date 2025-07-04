import MacroBadge from '../atoms/MacroBadge'

interface MacroDisplayProps {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function MacroDisplay({
  calories,
  protein,
  carbs,
  fat,
}: MacroDisplayProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <MacroBadge type="calories" value={calories} />
      <MacroBadge type="protein" value={protein} />
      <MacroBadge type="carbs" value={carbs} />
      <MacroBadge type="fat" value={fat} />
    </div>
  )
}