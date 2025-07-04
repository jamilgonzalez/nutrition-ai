import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  title: string
  message: string
  onRetry?: () => void
  retryText?: string
}

export default function ErrorMessage({
  title,
  message,
  onRetry,
  retryText = 'Try Again',
}: ErrorMessageProps) {
  return (
    <div className="text-center py-6 space-y-3">
      <div className="flex items-center justify-center gap-2 text-red-600">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          {retryText}
        </Button>
      )}
    </div>
  )
}