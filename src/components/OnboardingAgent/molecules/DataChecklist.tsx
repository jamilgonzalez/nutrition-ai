import { Check } from 'lucide-react'
import { UserProfile } from '../types'

interface DataChecklistProps {
  profile: UserProfile
}

interface ChecklistItem {
  id: string
  label: string
  completed: boolean
  value?: string | null
}

export function DataChecklist({ profile }: DataChecklistProps) {
  const formatHeight = (height: number | null) => {
    if (!height) return null
    const feet = Math.floor(height / 12)
    const inches = height % 12
    return `${feet}'${inches}"`
  }

  const formatActivityLevel = (level: string | null) => {
    if (!level) return null
    return level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')
  }

  const checklistItems: ChecklistItem[] = [
    {
      id: 'age',
      label: 'Age',
      completed: profile.age !== null && profile.age > 0,
      value: profile.age ? `${profile.age} years old` : null,
    },
    {
      id: 'gender',
      label: 'Gender',
      completed: profile.sex !== null,
      value: profile.sex ? profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1) : null,
    },
    {
      id: 'height',
      label: 'Height',
      completed: profile.height !== null && profile.height > 0,
      value: formatHeight(profile.height),
    },
    {
      id: 'weight',
      label: 'Weight',
      completed: profile.weight !== null && profile.weight > 0,
      value: profile.weight ? `${profile.weight} lbs` : null,
    },
    {
      id: 'activityLevel',
      label: 'Activity Level',
      completed: profile.activityLevel !== null,
      value: formatActivityLevel(profile.activityLevel),
    },
    {
      id: 'goals',
      label: 'Goals',
      completed: profile.goals !== null && profile.goals.length > 0,
      value: profile.goals && profile.goals.length > 0 ? profile.goals.join(', ') : null,
    },
    {
      id: 'dietary',
      label: 'Dietary restrictions/allergies',
      completed: profile.dietaryRestrictions.length > 0,
      value: profile.dietaryRestrictions.length > 0 ? profile.dietaryRestrictions.join(', ') : null,
    },
  ]

  console.log('profile', profile)

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Information needed:
      </h3>
      <div className="space-y-2">
        {checklistItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  item.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {item.completed && <Check className="w-3 h-3 text-white" />}
              </div>
              <span
                className={`text-sm transition-colors ${
                  item.completed ? 'text-green-700 font-medium' : 'text-gray-600'
                }`}
              >
                {item.label}
              </span>
            </div>
            {item.value && (
              <span className="text-sm text-blue-600 font-medium">
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
