import { FormInput } from '../atoms/FormInput'
import { FormSelect } from '../atoms/FormSelect'
import { SimpleOnboardingData } from '@/types/onboarding'

interface PersonalInfoGroupProps {
  data: Pick<SimpleOnboardingData, 'age' | 'gender' | 'height' | 'weight'>
  onChange: (field: keyof SimpleOnboardingData, value: string | number) => void
  className?: string
}

export function PersonalInfoGroup({
  data,
  onChange,
  className = '',
}: PersonalInfoGroupProps) {
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          id="age"
          label="Age"
          type="number"
          value={data.age || ''}
          onChange={(e) => onChange('age', parseInt(e.target.value) || 0)}
          placeholder="Enter your age"
          required
        />

        <FormSelect
          id="gender"
          label="Gender"
          value={data.gender || ''}
          onChange={(value) =>
            onChange('gender', value as SimpleOnboardingData['gender'])
          }
          options={genderOptions}
          placeholder="Select your gender"
          required
        />

        <FormInput
          id="height"
          label="Height (inches)"
          type="number"
          value={data.height || ''}
          onChange={(e) => onChange('height', parseInt(e.target.value) || 0)}
          placeholder="e.g., 68 for 5'8"
          required
        />

        <FormInput
          id="weight"
          label="Weight (pounds)"
          type="number"
          value={data.weight || ''}
          onChange={(e) => onChange('weight', parseInt(e.target.value) || 0)}
          placeholder="Enter your weight"
          required
        />
      </div>
    </div>
  )
}
