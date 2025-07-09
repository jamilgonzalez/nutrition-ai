interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  message,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-2 border-gray-200`}></div>
        <div className={`${sizeClasses[size]} rounded-full border-2 border-blue-600 border-t-transparent absolute top-0 left-0 animate-spin`}></div>
      </div>
      {message && (
        <p className="mt-3 text-sm text-gray-600 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}
