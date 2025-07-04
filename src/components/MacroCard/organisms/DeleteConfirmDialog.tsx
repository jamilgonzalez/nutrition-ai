import { Button } from '@/components/ui/button'
import { DeleteConfirmDialogProps } from '../types'

export default function DeleteConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 m-4 w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-4">Delete Meal</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this meal? This action cannot be
          undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="destructive">
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}