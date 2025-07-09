import { useState } from 'react'
import { PersonalInfoGroup } from '../molecules/PersonalInfoGroup'
import { ActivityLevelGroup } from '../molecules/ActivityLevelGroup'
import { GoalsGroup } from '../molecules/GoalsGroup'
import { DietaryRestrictionsGroup } from '../molecules/DietaryRestrictionsGroup'
import { SubmitButton } from '../atoms/SubmitButton'
import { SimpleOnboardingData } from '@/types/onboarding'

interface SimpleOnboardingFormProps {
  onSubmit: (data: SimpleOnboardingData) => void
  loading?: boolean
  className?: string
}

export function SimpleOnboardingForm({
  onSubmit,
  loading = false,
  className = ''
}: SimpleOnboardingFormProps) {
  const [formData, setFormData] = useState<SimpleOnboardingData>({
    age: 0,
    gender: 'male',
    height: 0,
    weight: 0,
    activityLevel: 'moderately_active',
    goals: '',
    dietaryRestrictions: ''
  })

  const handleChange = (field: keyof SimpleOnboardingData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.age || !formData.gender || !formData.height || !formData.weight || 
        !formData.activityLevel || !formData.goals) {
      alert('Please fill in all required fields')
      return
    }

    onSubmit(formData)
  }

  const isFormValid = 
    formData.age && formData.age > 0 &&
    formData.gender &&
    formData.height && formData.height > 0 &&
    formData.weight && formData.weight > 0 &&
    formData.activityLevel &&
    formData.goals && formData.goals.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className={`space-y-8 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Tell us about yourself
        </h2>
        <p className="text-gray-600">
          We'll use this information to create your personalized nutrition plan
        </p>
      </div>

      <PersonalInfoGroup
        data={formData}
        onChange={handleChange}
      />

      <ActivityLevelGroup
        data={formData}
        onChange={handleChange}
      />

      <GoalsGroup
        data={formData}
        onChange={handleChange}
      />

      <DietaryRestrictionsGroup
        data={formData}
        onChange={handleChange}
      />

      <div className="flex justify-center pt-6">
        <SubmitButton
          disabled={!isFormValid}
          loading={loading}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
        >
          {loading ? 'Generating Your Plan...' : 'Generate My Nutrition Plan'}
        </SubmitButton>
      </div>
    </form>
  )
}