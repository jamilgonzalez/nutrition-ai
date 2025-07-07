interface MicronutrientCardProps {
  name: string
  value: number
  unit: string
}

export default function MicronutrientCard({
  name,
  value,
  unit,
}: MicronutrientCardProps) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className="text-xs text-gray-600">{name}</p>
      <p className="font-semibold">
        {value}
        {unit}
      </p>
    </div>
  )
}
