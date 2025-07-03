interface StatusIndicatorProps {
  status: 'recording' | 'processing' | 'ready' | 'error'
  message: string
}

export function StatusIndicator({ status, message }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'recording':
        return 'bg-red-500'
      case 'processing':
        return 'border-blue-500 border-t-transparent'
      case 'ready':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getTextColor = () => {
    switch (status) {
      case 'recording':
        return 'text-red-600'
      case 'processing':
        return 'text-blue-600'
      case 'ready':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className={`rounded-full h-3 w-3 ${getStatusColor()} ${
          status === 'recording' ? 'animate-pulse' : ''
        } ${status === 'processing' ? 'animate-spin border-2' : ''}`}
      ></div>
      <span className={`text-sm ${getTextColor()}`}>{message}</span>
    </div>
  )
}