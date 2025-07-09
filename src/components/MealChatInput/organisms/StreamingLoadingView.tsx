import { LoadingState, LoadingMessage } from '@/hooks/useStreamingMealAnalysis'
import { LoadingDots } from '../atoms/LoadingDots'
import { LoadingMessage as LoadingMessageComponent } from '../atoms/LoadingMessage'
import { ProgressIndicator } from '../atoms/ProgressIndicator'

interface StreamingLoadingViewProps {
  loadingState: LoadingState
  currentMessage: LoadingMessage
  hasImage: boolean
  hasText: boolean
  onCancel?: () => void
  className?: string
}

export function StreamingLoadingView({
  loadingState,
  currentMessage,
  hasImage,
  hasText,
  onCancel,
  className = ''
}: StreamingLoadingViewProps) {
  const getProgress = (state: LoadingState): number => {
    switch (state) {
      case LoadingState.ANALYZING_IMAGE:
        return 20
      case LoadingState.ANALYZING_MEAL:
        return 40
      case LoadingState.SEARCHING_WEB:
        return 60
      case LoadingState.CALCULATING_NUTRITION:
        return 80
      case LoadingState.FINALIZING:
        return 95
      default:
        return 0
    }
  }

  const getStateIcon = (state: LoadingState): React.ReactNode => {
    switch (state) {
      case LoadingState.ANALYZING_IMAGE:
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case LoadingState.ANALYZING_MEAL:
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      case LoadingState.SEARCHING_WEB:
        return (
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )
      case LoadingState.CALCULATING_NUTRITION:
        return (
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case LoadingState.FINALIZING:
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 animate-fade-in ${className}`} data-testid="streaming-loading-view">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="animate-pulse" data-testid="loading-icon">
            {getStateIcon(loadingState)}
          </div>
          <div>
            <LoadingMessageComponent
              primary={currentMessage.primary}
              secondary={currentMessage.secondary}
            />
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cancel analysis"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mb-4">
        <ProgressIndicator progress={getProgress(loadingState)} />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          {hasImage && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Image</span>
            </div>
          )}
          {hasText && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Text</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <LoadingDots />
        </div>
      </div>
    </div>
  )
}