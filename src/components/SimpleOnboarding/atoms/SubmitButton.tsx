import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function SubmitButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  variant = 'default',
  size = 'default'
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${className} ${loading ? 'cursor-not-allowed' : ''}`}
      variant={variant}
      size={size}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}