interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className = '' }: LoadingDotsProps) {
  return (
    <div className={`flex space-x-1 ${className}`} data-testid="loading-dots-container">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
          data-testid="loading-dot"
        />
      ))}
    </div>
  )
}