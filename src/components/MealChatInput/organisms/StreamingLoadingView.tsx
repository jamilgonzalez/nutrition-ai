import { LoadingState, LoadingMessage } from '@/hooks/useStreamingMealAnalysis'
import { LoadingDots } from '../atoms/LoadingDots'
import { LoadingMessage as LoadingMessageComponent } from '../atoms/LoadingMessage'
import { ProgressIndicator } from '../atoms/ProgressIndicator'
import {
  X,
  Image,
  Search,
  Calculator,
  CheckCircle,
  Lightbulb,
} from 'lucide-react'

interface StreamingLoadingViewProps {
  loadingState: LoadingState
  currentMessage: LoadingMessage
  hasImage: boolean
  hasText: boolean
  onCancel?: () => void
  className?: string
  'aria-label'?: string
  'data-testid'?: string
}

interface LoadingStateConfig {
  progress: number
  icon: React.ReactNode
  color: string
  ariaLabel: string
}

export function StreamingLoadingView({
  loadingState,
  currentMessage,
  hasImage,
  hasText,
  onCancel,
  className = '',
  'aria-label': ariaLabel,
  'data-testid': testId = 'streaming-loading-view',
}: StreamingLoadingViewProps) {
  const getLoadingStateConfig = (state: LoadingState): LoadingStateConfig => {
    const configs: Record<LoadingState, LoadingStateConfig> = {
      [LoadingState.IDLE]: {
        progress: 0,
        icon: null,
        color: 'text-gray-600',
        ariaLabel: 'Idle',
      },
      [LoadingState.ANALYZING_IMAGE]: {
        progress: 20,
        icon: <Image className="w-6 h-6" aria-hidden="true" />,
        color: 'text-blue-600',
        ariaLabel: 'Analyzing image',
      },
      [LoadingState.ANALYZING_MEAL]: {
        progress: 40,
        icon: <Lightbulb className="w-6 h-6" aria-hidden="true" />,
        color: 'text-green-600',
        ariaLabel: 'Analyzing meal content',
      },
      [LoadingState.SEARCHING_WEB]: {
        progress: 60,
        icon: <Search className="w-6 h-6" aria-hidden="true" />,
        color: 'text-purple-600',
        ariaLabel: 'Searching for nutritional data',
      },
      [LoadingState.CALCULATING_NUTRITION]: {
        progress: 80,
        icon: <Calculator className="w-6 h-6" aria-hidden="true" />,
        color: 'text-orange-600',
        ariaLabel: 'Calculating nutrition information',
      },
      [LoadingState.FINALIZING]: {
        progress: 95,
        icon: <CheckCircle className="w-6 h-6" aria-hidden="true" />,
        color: 'text-green-600',
        ariaLabel: 'Finalizing analysis',
      },
    }

    return (
      configs[state] || {
        progress: 0,
        icon: null,
        color: 'text-gray-600',
        ariaLabel: 'Processing',
      }
    )
  }

  const currentConfig = getLoadingStateConfig(loadingState)
  const inputSummary = []
  if (hasImage) inputSummary.push('image')
  if (hasText) inputSummary.push('text')

  const defaultAriaLabel = `Analyzing meal ${inputSummary.join(' and ')}: ${
    currentConfig.ariaLabel
  }`

  return (
    <section
      className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 animate-fade-in ${className}`}
      data-testid={testId}
      role="status"
      aria-label={ariaLabel || defaultAriaLabel}
      aria-live="polite"
      aria-busy="true"
    >
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`animate-pulse ${currentConfig.color}`}
            data-testid="loading-icon"
            aria-label={currentConfig.ariaLabel}
          >
            {currentConfig.icon}
          </div>
          <div role="status" aria-live="polite">
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
            aria-label="Cancel meal analysis"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </header>

      <div className="mb-4">
        <ProgressIndicator progress={currentConfig.progress} />
      </div>

      <footer className="flex items-center justify-between text-sm text-gray-500">
        <div
          className="flex items-center space-x-4"
          role="group"
          aria-label="Input sources"
        >
          {hasImage && (
            <div className="flex items-center space-x-1" role="status">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full"
                aria-hidden="true"
              ></div>
              <span>Image</span>
            </div>
          )}
          {hasText && (
            <div className="flex items-center space-x-1" role="status">
              <div
                className="w-2 h-2 bg-green-500 rounded-full"
                aria-hidden="true"
              ></div>
              <span>Text</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <LoadingDots />
        </div>
      </footer>
    </section>
  )
}
