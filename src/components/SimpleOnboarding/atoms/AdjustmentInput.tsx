import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AdjustmentInputProps {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  unit?: string
  min?: number
  max?: number
  step?: number
  className?: string
}

export function AdjustmentInput({
  id,
  label,
  value,
  onChange,
  unit = '',
  min = 0,
  max = 9999,
  step = 1,
  className = ''
}: AdjustmentInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0
    onChange(newValue)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className="w-full pr-12"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}