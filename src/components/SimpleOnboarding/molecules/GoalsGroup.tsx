import { FormTextarea } from '../atoms/FormTextarea'
import { SimpleOnboardingData } from '@/types/onboarding'

interface GoalsGroupProps {
  data: Pick<SimpleOnboardingData, 'goals'>
  onChange: (field: keyof SimpleOnboardingData, value: string) => void
  className?: string
}

export function GoalsGroup({
  data,
  onChange,
  className = ''
}: GoalsGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Goals</h3>
      
      <FormTextarea
        id="goals"
        label="What are your health and fitness goals?"
        value={data.goals || ''}
        onChange={(e) => onChange('goals', e.target.value)}
        placeholder="e.g., lose weight, gain muscle, maintain current weight, improve athletic performance, eat healthier..."
        required
        rows={4}
      />
      
      <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
        <p className="font-medium mb-2">Examples of goals:</p>
        <ul className="space-y-1 text-xs">
          <li>• Lose 15 pounds for summer</li>
          <li>• Build lean muscle mass</li>
          <li>• Maintain current weight but improve body composition</li>
          <li>• Fuel for marathon training</li>
          <li>• Eat healthier and have more energy</li>
        </ul>
      </div>
    </div>
  )
}