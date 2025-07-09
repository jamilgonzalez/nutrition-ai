import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface FormTextareaProps {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  className?: string
  rows?: number
}

export function FormTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  rows = 3
}: FormTextareaProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full resize-none"
      />
    </div>
  )
}