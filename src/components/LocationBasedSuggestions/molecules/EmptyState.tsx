import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  message: string
  onRetry?: () => void
  retryText?: string
}

export default function EmptyState({
  message,
  onRetry,
  retryText = 'Search Again',
}: EmptyStateProps) {
  return (
    <div className="text-center py-6 space-y-3">
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          {retryText}
        </Button>
      )}
    </div>
  )
}