import { FormSelect } from '../atoms/FormSelect'
import { SimpleOnboardingData, ACTIVITY_LEVELS } from '@/types/onboarding'

interface ActivityLevelGroupProps {
  data: Pick<SimpleOnboardingData, 'activityLevel'>
  onChange: (field: keyof SimpleOnboardingData, value: string) => void
  className?: string
}

export function ActivityLevelGroup({
  data,
  onChange,
  className = ''
}: ActivityLevelGroupProps) {
  const activityOptions = Object.entries(ACTIVITY_LEVELS).map(([value, label]) => ({
    value,
    label
  }))

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Level</h3>
      
      <FormSelect
        id="activityLevel"
        label="How active are you?"
        value={data.activityLevel || ''}
        onChange={(value) => onChange('activityLevel', value as SimpleOnboardingData['activityLevel'])}
        options={activityOptions}
        placeholder="Select your activity level"
        required
      />
      
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p className="font-medium mb-2">Activity Level Guide:</p>
        <ul className="space-y-1 text-xs">
          <li><strong>Sedentary:</strong> Desk job, little to no exercise</li>
          <li><strong>Lightly Active:</strong> Light exercise 1-3 days/week</li>
          <li><strong>Moderately Active:</strong> Moderate exercise 3-5 days/week</li>
          <li><strong>Very Active:</strong> Hard exercise 6-7 days/week</li>
          <li><strong>Extremely Active:</strong> Very hard exercise, physical job</li>
        </ul>
      </div>
    </div>
  )
}