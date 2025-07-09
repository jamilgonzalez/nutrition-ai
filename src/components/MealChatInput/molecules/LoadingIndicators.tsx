import { Loader2, Database, CheckCircle } from 'lucide-react'

interface LoadingIndicatorsProps {
  isLoading?: boolean
  showSaveSuccess?: boolean
}

export function LoadingIndicators({
  isLoading,
  showSaveSuccess,
}: LoadingIndicatorsProps) {
  if (!isLoading && !showSaveSuccess) return null

  return (
    <div className="mb-3 flex items-center justify-center gap-2 text-sm">
      {isLoading && (
        <>
          <Loader2 className="w-4 h-4 animate-spin" data-testid="loader-icon" aria-label="Loading" />
          <span className="text-gray-600">
            {isLoading ? (
              <>
                <Database className="w-4 h-4 inline mr-1" />
                Saving nutrition data...
              </>
            ) : (
              'Analyzing meal...'
            )}
          </span>
        </>
      )}
      {showSaveSuccess && !isLoading && (
        <>
          <CheckCircle className="w-4 h-4 text-green-600" data-testid="success-icon" aria-label="Success" />
          <span className="text-green-600">Meal saved successfully!</span>
        </>
      )}
    </div>
  )
}
