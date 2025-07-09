import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface BeginButtonProps {
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function BeginButton({
  onClick,
  disabled = false,
  className = ''
}: BeginButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-full ${className}`}
      size="lg"
    >
      <Play className="mr-2 h-5 w-5" />
      Begin
    </Button>
  )
}