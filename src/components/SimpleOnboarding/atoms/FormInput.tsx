import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormInputProps {
  id: string
  label: string
  type?: 'text' | 'number' | 'email'
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = ''
}: FormInputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full"
      />
    </div>
  )
}