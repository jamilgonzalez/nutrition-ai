import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface ToolbarButtonProps {
  icon: LucideIcon
  onClick: () => void
  disabled?: boolean
  variant?: 'outline' | 'ghost' | 'default'
  className?: string
  ariaLabel?: string
}

export function ToolbarButton({
  icon: Icon,
  onClick,
  disabled,
  variant = 'outline',
  className,
  ariaLabel,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={`flex-shrink-0 p-2 ${className || ''}`}
      aria-label={ariaLabel}
    >
      <Icon className="w-4 h-4" />
    </Button>
  )
}