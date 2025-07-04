export function getMealTypeIcon(type: string) {
  switch (type) {
    case 'breakfast':
      return '🌅'
    case 'lunch':
      return '☀️'
    case 'dinner':
      return '🌙'
    case 'snack':
      return '🍎'
    default:
      return '🍽️'
  }
}

export function getHealthScoreColor(score: number) {
  if (score >= 8) return 'text-green-600 bg-green-100'
  if (score >= 6) return 'text-yellow-600 bg-yellow-100'
  if (score >= 4) return 'text-orange-600 bg-orange-100'
  return 'text-red-600 bg-red-100'
}