interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="text-center py-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}