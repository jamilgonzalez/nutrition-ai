import HomecookedMealCard from './HomecookedMealCard'
import { DailyNutritionData } from '../types'

interface HomecookedSuggestionsProps {
  dailyNutritionData: DailyNutritionData
}

export default function HomecookedSuggestions({
  dailyNutritionData,
}: HomecookedSuggestionsProps) {
  return (
    <div className="space-y-3">
      {dailyNutritionData.suggestedMeal ? (
        <HomecookedMealCard meal={dailyNutritionData.suggestedMeal} />
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm">No homecooked suggestions available</p>
        </div>
      )}
    </div>
  )
}