interface ProgressIndicatorProps {
  progress: number
  className?: string
}

export function ProgressIndicator({ progress, className = '' }: ProgressIndicatorProps) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`} data-testid="progress-container">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        data-testid="progress-bar"
      />
    </div>
  )
}