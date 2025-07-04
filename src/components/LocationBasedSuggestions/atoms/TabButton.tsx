import { cn } from '@/lib/utils'
import { TabType } from '../types'

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export default function TabButton({
  active,
  onClick,
  children,
  className,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-background/50',
        className
      )}
    >
      {children}
    </button>
  )
}