export function getGradientColor(percentage: number): string {
  const clampedPercentage = Math.min(percentage, 100)
  const hue = (1 - clampedPercentage / 100) * 240
  return `hsl(${hue}, 70%, 50%)`
}

export function calculatePercentage(current: number, goal: number): number {
  return Math.min((current / goal) * 100, 100)
}