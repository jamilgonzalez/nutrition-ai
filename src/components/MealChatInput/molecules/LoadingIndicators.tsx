import { Loader2, Database, CheckCircle } from 'lucide-react'

interface LoadingIndicatorsProps {
  isLoading?: boolean
  isSavingMeal?: boolean
  showSaveSuccess?: boolean
}

export function LoadingIndicators({
  isLoading,
  isSavingMeal,
  showSaveSuccess,
}: LoadingIndicatorsProps) {
  if (!isLoading && !isSavingMeal && !showSaveSuccess) return null

  return (
    <div className="mb-3 flex items-center justify-center gap-2 text-sm">
      {(isLoading || isSavingMeal) && (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-gray-600">
            {isSavingMeal ? (
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
      {showSaveSuccess && !isLoading && !isSavingMeal && (
        <>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Meal saved successfully!</span>
        </>
      )}
    </div>
  )
}