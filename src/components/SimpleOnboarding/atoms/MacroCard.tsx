interface MacroCardProps {
  label: string
  value: number
  unit: string
  color?: string
  className?: string
}

export function MacroCard({
  label,
  value,
  unit,
  color = 'bg-blue-500',
  className = ''
}: MacroCardProps) {
  return (
    <div className={`bg-white border rounded-lg p-4 text-center ${className}`}>
      <div className={`w-4 h-4 ${color} rounded-full mx-auto mb-2`}></div>
      <h3 className="text-sm font-medium text-gray-700 mb-1">{label}</h3>
      <p className="text-2xl font-bold text-gray-900">
        {Math.round(value)}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  )
}