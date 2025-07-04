import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface ActionButtonProps {
  icon: LucideIcon
  onClick: () => void
  variant?: 'edit' | 'delete'
}

export default function ActionButton({
  icon: Icon,
  onClick,
  variant = 'edit',
}: ActionButtonProps) {
  const getHoverColor = () => {
    switch (variant) {
      case 'delete':
        return 'hover:text-red-600'
      case 'edit':
      default:
        return 'hover:text-gray-600'
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onClick}
      className={`h-6 w-6 p-0 text-gray-400 ${getHoverColor()}`}
    >
      <Icon className="w-3 h-3" />
    </Button>
  )
}