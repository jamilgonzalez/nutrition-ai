import MicronutrientCard from '../atoms/MicronutrientCard'
import { NutritionData } from '../types'

interface MicronutrientGridProps {
  micronutrients: NutritionData['micronutrients']
}

export default function MicronutrientGrid({
  micronutrients,
}: MicronutrientGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {micronutrients.sodium && (
        <MicronutrientCard
          name="Sodium"
          value={micronutrients.sodium}
          unit="mg"
        />
      )}
      {micronutrients.potassium && (
        <MicronutrientCard
          name="Potassium"
          value={micronutrients.potassium}
          unit="mg"
        />
      )}
      {micronutrients.vitaminC && (
        <MicronutrientCard
          name="Vitamin C"
          value={micronutrients.vitaminC}
          unit="mg"
        />
      )}
      {micronutrients.calcium && (
        <MicronutrientCard
          name="Calcium"
          value={micronutrients.calcium}
          unit="mg"
        />
      )}
      {micronutrients.iron && (
        <MicronutrientCard
          name="Iron"
          value={micronutrients.iron}
          unit="mg"
        />
      )}
    </div>
  )
}