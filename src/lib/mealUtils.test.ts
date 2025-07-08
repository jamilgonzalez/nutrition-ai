import { describe, it, expect, vi } from 'vitest'
import {
  getMealType,
  getMealEmoji,
  transformMealToMobileFormat,
  groupMealsForMobile,
  isValidUrl,
  safeOpenUrl,
  cleanupObjectUrl,
  createManagedObjectUrl,
} from './mealUtils'
import { MEAL_TYPES } from './constants'

// Mock window.open
const mockOpen = vi.fn()
Object.defineProperty(window, 'open', {
  value: mockOpen,
  writable: true,
})

// Mock URL methods
const mockRevokeObjectURL = vi.fn()
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
  writable: true,
})
Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL,
  writable: true,
})

describe('mealUtils', () => {
  describe('getMealType', () => {
    it('returns Breakfast for early morning hours', () => {
      const morningDate = new Date()
      morningDate.setHours(8, 0, 0, 0) // 8 AM local time
      expect(getMealType(morningDate)).toBe(MEAL_TYPES.BREAKFAST)
    })

    it('returns Lunch for midday hours', () => {
      const lunchDate = new Date()
      lunchDate.setHours(12, 30, 0, 0) // 12:30 PM local time
      expect(getMealType(lunchDate)).toBe(MEAL_TYPES.LUNCH)
    })

    it('returns Dinner for evening hours', () => {
      const dinnerDate = new Date()
      dinnerDate.setHours(18, 0, 0, 0) // 6 PM local time
      expect(getMealType(dinnerDate)).toBe(MEAL_TYPES.DINNER)
    })

    it('returns Snack for late night hours', () => {
      const lateDate = new Date()
      lateDate.setHours(21, 0, 0, 0) // 9 PM local time
      expect(getMealType(lateDate)).toBe(MEAL_TYPES.SNACK)
    })

    it('handles string timestamps', () => {
      const testDate = new Date()
      testDate.setHours(8, 0, 0, 0) // 8 AM local time
      expect(getMealType(testDate.toISOString())).toBe(MEAL_TYPES.BREAKFAST)
    })
  })

  describe('getMealEmoji', () => {
    it('returns correct emoji for each meal type', () => {
      expect(getMealEmoji(MEAL_TYPES.BREAKFAST)).toBe('🍳')
      expect(getMealEmoji(MEAL_TYPES.LUNCH)).toBe('🍔')
      expect(getMealEmoji(MEAL_TYPES.DINNER)).toBe('🍽️')
      expect(getMealEmoji(MEAL_TYPES.SNACK)).toBe('🥨')
    })

    it('returns default emoji for unknown meal type', () => {
      expect(getMealEmoji('unknown')).toBe('🍽️')
    })
  })

  describe('transformMealToMobileFormat', () => {
    it('transforms meal to mobile format correctly', () => {
      const testDate = new Date()
      testDate.setHours(12, 30, 0, 0) // 12:30 PM local time
      
      const meal = {
        id: '1',
        name: 'Test Meal',
        timestamp: testDate.toISOString(),
        nutritionData: {
          calories: 400,
          protein: 30,
          carbs: 40,
          fat: 15,
        },
      }

      const result = transformMealToMobileFormat(meal)

      expect(result).toEqual({
        id: '1',
        name: 'Test Meal',
        time: '12:30 PM',
        calories: 400,
        protein: 30,
        carbs: 40,
        fat: 15,
        fullMeal: meal,
      })
    })

    it('handles missing nutrition data', () => {
      const meal = {
        id: '1',
        name: 'Test Meal',
        timestamp: '2023-01-01T12:30:00Z',
      }

      const result = transformMealToMobileFormat(meal)

      expect(result.calories).toBe(0)
      expect(result.protein).toBe(0)
      expect(result.carbs).toBe(0)
      expect(result.fat).toBe(0)
    })
  })

  describe('groupMealsForMobile', () => {
    it('groups meals by type correctly', () => {
      const createLocalTime = (hour: number, minute: number = 0) => {
        const date = new Date()
        date.setHours(hour, minute, 0, 0)
        return date.toISOString()
      }
      
      const meals = [
        {
          id: '1',
          name: 'Breakfast Item',
          timestamp: createLocalTime(8, 0), // 8:00 AM local time
          nutritionData: { calories: 300, protein: 10, carbs: 40, fat: 8 },
        },
        {
          id: '2',
          name: 'Another Breakfast',
          timestamp: createLocalTime(8, 30), // 8:30 AM local time
          nutritionData: { calories: 200, protein: 5, carbs: 30, fat: 5 },
        },
        {
          id: '3',
          name: 'Lunch Item',
          timestamp: createLocalTime(12, 30), // 12:30 PM local time
          nutritionData: { calories: 400, protein: 30, carbs: 20, fat: 15 },
        },
      ]

      const result = groupMealsForMobile(meals)

      expect(result).toHaveLength(2)
      expect(result[0].type).toBe('Breakfast')
      expect(result[0].count).toBe(2)
      expect(result[0].items).toHaveLength(2)
      expect(result[1].type).toBe('Lunch')
      expect(result[1].count).toBe(1)
      expect(result[1].items).toHaveLength(1)
    })

    it('uses meal type from fullNutritionData when available', () => {
      const meals = [
        {
          id: '1',
          name: 'Custom Meal',
          timestamp: '2023-01-01T08:00:00Z',
          nutritionData: { calories: 300, protein: 10, carbs: 40, fat: 8 },
          fullNutritionData: {
            mealType: 'snack',
          },
        },
      ]

      const result = groupMealsForMobile(meals)

      expect(result[0].type).toBe('Snack')
    })
  })

  describe('isValidUrl', () => {
    it('returns true for valid HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('https://example.com/path?param=value')).toBe(true)
    })

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('ftp://example.com')).toBe(false)
      expect(isValidUrl('javascript:alert(1)')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })

  describe('safeOpenUrl', () => {
    beforeEach(() => {
      mockOpen.mockClear()
    })

    it('opens valid URLs', () => {
      safeOpenUrl('https://example.com')
      expect(mockOpen).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer')
    })

    it('does not open invalid URLs', () => {
      safeOpenUrl('javascript:alert(1)')
      expect(mockOpen).not.toHaveBeenCalled()
    })
  })

  describe('cleanupObjectUrl', () => {
    beforeEach(() => {
      mockRevokeObjectURL.mockClear()
    })

    it('revokes blob URLs', () => {
      cleanupObjectUrl('blob:mock-url')
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('does not revoke non-blob URLs', () => {
      cleanupObjectUrl('https://example.com')
      expect(mockRevokeObjectURL).not.toHaveBeenCalled()
    })

    it('handles empty strings', () => {
      cleanupObjectUrl('')
      expect(mockRevokeObjectURL).not.toHaveBeenCalled()
    })
  })

  describe('createManagedObjectUrl', () => {
    beforeEach(() => {
      mockCreateObjectURL.mockClear()
      mockRevokeObjectURL.mockClear()
    })

    it('creates object URL and provides cleanup function', () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      const result = createManagedObjectUrl(file)

      expect(mockCreateObjectURL).toHaveBeenCalledWith(file)
      expect(result.url).toBe('blob:mock-url')
      expect(typeof result.cleanup).toBe('function')

      // Test cleanup function
      result.cleanup()
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })
})