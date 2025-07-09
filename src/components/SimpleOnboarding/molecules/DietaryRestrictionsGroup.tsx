import { FormTextarea } from '../atoms/FormTextarea'
import { SimpleOnboardingData } from '@/types/onboarding'

interface DietaryRestrictionsGroupProps {
  data: Pick<SimpleOnboardingData, 'dietaryRestrictions'>
  onChange: (field: keyof SimpleOnboardingData, value: string) => void
  className?: string
}

export function DietaryRestrictionsGroup({
  data,
  onChange,
  className = ''
}: DietaryRestrictionsGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Dietary Restrictions & Allergies</h3>
      
      <FormTextarea
        id="dietaryRestrictions"
        label="Do you have any dietary restrictions, allergies, or food preferences?"
        value={data.dietaryRestrictions || ''}
        onChange={(e) => onChange('dietaryRestrictions', e.target.value)}
        placeholder="e.g., vegetarian, gluten-free, dairy-free, nut allergies, low-sodium, keto..."
        rows={3}
      />
      
      <div className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
        <p className="font-medium mb-2">Common restrictions:</p>
        <ul className="space-y-1 text-xs">
          <li>• <strong>Allergies:</strong> nuts, dairy, gluten, shellfish, soy</li>
          <li>• <strong>Dietary preferences:</strong> vegetarian, vegan, pescatarian</li>
          <li>• <strong>Medical diets:</strong> low-sodium, diabetic, heart-healthy</li>
          <li>• <strong>Lifestyle diets:</strong> keto, paleo, Mediterranean</li>
        </ul>
      </div>
    </div>
  )
}