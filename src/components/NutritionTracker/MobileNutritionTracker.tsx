'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import MobileNutritionOverview from './molecules/MobileNutritionOverview'
import MobileMacroGrid from './molecules/MobileMacroGrid'
import MobileMealItem from './molecules/MobileMealItem'
import DeleteConfirmDialog from './organisms/DeleteConfirmDialog'
import { MobileNutritionData } from '@/utils/mealTransformation'

interface MobileNutritionTrackerProps {
  data: MobileNutritionData
  onDeleteMeal?: (mealId: string) => void
  isLoading?: boolean
  error?: string | null
}

export default function MobileNutritionTracker({
  data: { caloriesConsumed, caloriesGoal, caloriesRemaining, macros, meals },
  onDeleteMeal,
  isLoading = false,
  error = null,
}: MobileNutritionTrackerProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [mealToDelete, setMealToDelete] = useState<string | null>(null)

  // Derive total meal items count
  const totalMealItems = useMemo(() => {
    return meals.reduce((sum, mealGroup) => sum + mealGroup.count, 0)
  }, [meals])

  // Derive empty state
  const isEmpty = useMemo(() => {
    return !isLoading && totalMealItems === 0
  }, [isLoading, totalMealItems])

  const handleDeleteClick = (mealId: string) => {
    setMealToDelete(mealId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (mealToDelete && onDeleteMeal) {
      onDeleteMeal(mealToDelete)
    }
    setIsDeleteDialogOpen(false)
    setMealToDelete(null)
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setMealToDelete(null)
  }

  // Show error state
  if (error) {
    return (
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white">
        <div className="px-4 py-8 text-center">
          <div className="text-red-500 mb-2" role="alert" aria-live="polite">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Failed to load nutrition data
          </h2>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white">
        <div className="px-4 py-4 space-y-4">
          <MobileNutritionOverview
            caloriesConsumed={caloriesConsumed}
            caloriesGoal={caloriesGoal}
            caloriesRemaining={caloriesRemaining}
          />

          <MobileMacroGrid macros={macros} />

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-semibold text-slate-800">
                Today's Meals
              </h2>
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-600 text-xs"
              >
                {totalMealItems} items
              </Badge>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="space-y-2" role="status" aria-live="polite">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-12 bg-slate-200 rounded"></div>
                </div>
                <span className="sr-only">Loading meals...</span>
              </div>
            )}

            {/* Empty state */}
            {isEmpty && (
              <div className="py-8 text-center">
                <div className="text-4xl mb-2">🍽️</div>
                <h3 className="text-lg font-medium text-slate-700 mb-1">
                  No meals today
                </h3>
                <p className="text-sm text-slate-500">
                  Add your first meal using the chat below
                </p>
              </div>
            )}

            {/* Meals list */}
            {!isLoading &&
              !isEmpty &&
              meals.map((mealGroup) => (
                <div key={mealGroup.id} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <span
                      className="text-lg"
                      role="img"
                      aria-label={mealGroup.type}
                    >
                      {mealGroup.emoji}
                    </span>
                    <span className="font-medium text-slate-700 text-sm">
                      {mealGroup.type} ({mealGroup.count})
                    </span>
                  </div>

                  {mealGroup.items.map((item) => (
                    <MobileMealItem
                      key={item.id}
                      item={item}
                      onDelete={
                        onDeleteMeal
                          ? () => handleDeleteClick(item.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  )
}
