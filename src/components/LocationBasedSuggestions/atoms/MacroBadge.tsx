import { cn } from '@/lib/utils'

interface MacroBadgeProps {
  type: 'calories' | 'protein' | 'carbs' | 'fat'
  value: number
  className?: string
}

export default function MacroBadge({ type, value, className }: MacroBadgeProps) {
  const getStyles = () => {
    switch (type) {
      case 'calories':
        return 'bg-orange-100 text-orange-700'
      case 'protein':
        return 'bg-blue-100 text-blue-700'
      case 'carbs':
        return 'bg-green-100 text-green-700'
      case 'fat':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getSuffix = () => {
    switch (type) {
      case 'calories':
        return 'cal'
      case 'protein':
        return 'p'
      case 'carbs':
        return 'c'
      case 'fat':
        return 'f'
      default:
        return ''
    }
  }

  return (
    <span
      className={cn(
        'px-2 py-1 rounded-full font-medium text-sm',
        getStyles(),
        className
      )}
    >
      {value}
      {getSuffix()}
    </span>
  )
}