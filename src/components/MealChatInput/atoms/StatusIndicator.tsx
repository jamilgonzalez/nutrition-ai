import { LucideIcon } from 'lucide-react'

interface StatusIndicatorProps {
  icon: LucideIcon
  text: string
  className?: string
}

export function StatusIndicator({ icon: Icon, text, className }: StatusIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Icon className="w-4 h-4" />
      <span>{text}</span>
    </div>
  )
}