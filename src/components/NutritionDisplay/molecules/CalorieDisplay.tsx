import { Zap } from 'lucide-react'

interface CalorieDisplayProps {
  calories: number
}

export default function CalorieDisplay({ calories }: CalorieDisplayProps) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
        <Zap className="w-8 h-8 text-yellow-500" />
        {calories}
        <span className="text-lg text-gray-500">calories</span>
      </div>
    </div>
  )
}