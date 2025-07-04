import { Edit2, Trash2 } from 'lucide-react'
import ActionButton from '../atoms/ActionButton'

interface MealActionsProps {
  onEdit: () => void
  onDelete: () => void
  timestamp: Date
}

export default function MealActions({
  onEdit,
  onDelete,
  timestamp,
}: MealActionsProps) {
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">{formattedTime}</span>
      <ActionButton icon={Edit2} onClick={onEdit} variant="edit" />
      <ActionButton icon={Trash2} onClick={onDelete} variant="delete" />
    </div>
  )
}
