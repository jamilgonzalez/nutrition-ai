import { MenuItem, MacroTargets, RestaurantSearchResult } from '@/types/restaurant';

export async function searchRestaurantMenuItems(
  cityName: string,
  macroTargets: MacroTargets
): Promise<RestaurantSearchResult> {
  const searchQuery = `restaurants near ${cityName} healthy menu items nutrition information calories ${macroTargets.calories.min}-${macroTargets.calories.max} protein ${macroTargets.protein.min}g+`;
  
  const response = await fetch('/api/restaurant-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: searchQuery,
      location: cityName,
      macroTargets
    })
  });

  if (!response.ok) {
    throw new Error(`Restaurant search failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    menuItems: data.menuItems || [],
    searchQuery,
    location: cityName,
    timestamp: new Date()
  };
}

export function calculateMacroFitScore(
  menuItem: MenuItem,
  targets: MacroTargets,
  tolerance: number = 0.2
): number {
  const caloriesScore = calculateFitScore(menuItem.calories, targets.calories.min, targets.calories.max, tolerance);
  const proteinScore = calculateFitScore(menuItem.protein, targets.protein.min, targets.protein.max, tolerance);
  const carbsScore = calculateFitScore(menuItem.carbs, targets.carbs.min, targets.carbs.max, tolerance);
  const fatScore = calculateFitScore(menuItem.fat, targets.fat.min, targets.fat.max, tolerance);
  
  return (caloriesScore + proteinScore + carbsScore + fatScore) / 4;
}

function calculateFitScore(
  value: number,
  min: number,
  max: number,
  tolerance: number
): number {
  const adjustedMin = min * (1 - tolerance);
  const adjustedMax = max * (1 + tolerance);
  
  if (value >= adjustedMin && value <= adjustedMax) {
    return 1.0;
  }
  
  if (value < adjustedMin) {
    return Math.max(0, 1 - (adjustedMin - value) / adjustedMin);
  }
  
  return Math.max(0, 1 - (value - adjustedMax) / adjustedMax);
}

export function filterMenuItemsByMacros(
  items: MenuItem[],
  targets: MacroTargets,
  tolerance: number = 0.2
): MenuItem[] {
  return items
    .map(item => ({
      ...item,
      macroFitScore: calculateMacroFitScore(item, targets, tolerance)
    }))
    .filter(item => (item.macroFitScore || 0) > 0.5)
    .sort((a, b) => (b.macroFitScore || 0) - (a.macroFitScore || 0));
}

export function getMacroTargetsFromDailyGoals(
  dailyCalories: number,
  proteinPercentage: number = 0.25,
  carbsPercentage: number = 0.45,
  fatPercentage: number = 0.30
): MacroTargets {
  const mealCalories = dailyCalories / 3; // Assume 3 meals per day
  
  return {
    calories: {
      min: Math.round(mealCalories * 0.8),
      max: Math.round(mealCalories * 1.2)
    },
    protein: {
      min: Math.round((mealCalories * proteinPercentage) / 4 * 0.8), // 4 calories per gram
      max: Math.round((mealCalories * proteinPercentage) / 4 * 1.2)
    },
    carbs: {
      min: Math.round((mealCalories * carbsPercentage) / 4 * 0.8),
      max: Math.round((mealCalories * carbsPercentage) / 4 * 1.2)
    },
    fat: {
      min: Math.round((mealCalories * fatPercentage) / 9 * 0.8), // 9 calories per gram
      max: Math.round((mealCalories * fatPercentage) / 9 * 1.2)
    }
  };
}