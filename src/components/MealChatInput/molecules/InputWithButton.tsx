import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'

interface InputWithButtonProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  disabled?: boolean
  onSubmit: (e: React.FormEvent) => void
  hasContent: boolean
}

export function InputWithButton({
  value,
  onChange,
  placeholder,
  disabled,
  onSubmit,
  hasContent,
}: InputWithButtonProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="relative">
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pr-12"
        />
        <Button
          type="submit"
          size="sm"
          disabled={disabled || !hasContent}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2 h-8 w-8"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}