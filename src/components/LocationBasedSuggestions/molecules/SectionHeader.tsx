import { Badge } from '@/components/ui/badge'

interface SectionHeaderProps {
  title: string
  caloriesRemaining: number
}

export default function SectionHeader({
  title,
  caloriesRemaining,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-semibold">{title}</h4>
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-200"
      >
        {caloriesRemaining} cal remaining
      </Badge>
    </div>
  )
}