/**
 * Application constants
 */

// Responsive breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const

// Meal types and timing
export const MEAL_TYPES = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch', 
  DINNER: 'Dinner',
  SNACK: 'Snack',
} as const

export const MEAL_TIMING = {
  BREAKFAST_CUTOFF: 11,
  LUNCH_CUTOFF: 15,
  DINNER_CUTOFF: 19,
} as const

export const MEAL_EMOJIS = {
  [MEAL_TYPES.BREAKFAST]: '🍳',
  [MEAL_TYPES.LUNCH]: '🍔',
  [MEAL_TYPES.DINNER]: '🍽️',
  [MEAL_TYPES.SNACK]: '🥨',
} as const

// Time formatting
export const TIME_FORMAT_OPTIONS = {
  hour: '2-digit' as const,
  minute: '2-digit' as const,
}

// UI feedback timing
export const UI_FEEDBACK = {
  SUCCESS_DISPLAY_DURATION: 3000,
} as const