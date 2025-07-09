interface LoadingMessageProps {
  primary: string
  secondary: string
  className?: string
}

export function LoadingMessage({ primary, secondary, className = '' }: LoadingMessageProps) {
  return (
    <div className={`${className}`} data-testid="loading-message-container">
      <div className="text-base font-medium text-gray-900 animate-fade-in">
        {primary}
      </div>
      <div className="text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {secondary}
      </div>
    </div>
  )
}