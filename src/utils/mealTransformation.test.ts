import { describe, it, expect } from 'vitest'
import {
  getMealType,
  getMealEmoji,
  transformMealsToMobileFormat,
  createMobileNutritionData,
} from './mealTransformation'
import { RecordedMeal } from '@/lib/mealStorage'

describe('mealTransformation utils', () => {
  describe('getMealType', () => {
    it('returns Breakfast for early morning hours', () => {
      const date = new Date('2023-10-15T08:00:00Z')
      expect(getMealType(date)).toBe('Breakfast')
    })

    it('returns Lunch for midday hours', () => {
      const date = new Date('2023-10-15T13:00:00Z')
      expect(getMealType(date)).toBe('Lunch')
    })

    it('returns Dinner for evening hours', () => {
      const date = new Date('2023-10-15T18:00:00Z')
      expect(getMealType(date)).toBe('Dinner')
    })

    it('returns Snack for late night hours', () => {
      const date = new Date('2023-10-15T22:00:00Z')
      expect(getMealType(date)).toBe('Snack')
    })

    it('handles string timestamps', () => {
      expect(getMealType('2023-10-15T09:00:00Z')).toBe('Breakfast')
    })
  })

  describe('getMealEmoji', () => {
    it('returns correct emoji for each meal type', () => {
      expect(getMealEmoji('Breakfast')).toBe('🍳')
      expect(getMealEmoji('Lunch')).toBe('🍔')
      expect(getMealEmoji('Dinner')).toBe('🍽️')
      expect(getMealEmoji('Snack')).toBe('🥨')
    })

    it('returns default emoji for unknown meal type', () => {
      expect(getMealEmoji('Unknown')).toBe('🍽️')
    })
  })

  describe('transformMealsToMobileFormat', () => {
    const mockMeals: RecordedMeal[] = [
      {
        id: '1',
        name: 'Scrambled Eggs',
        timestamp: new Date('2023-10-15T08:00:00Z'),
        notes: 'Morning breakfast',
        nutritionData: {
          calories: 200,
          protein: 15,
          carbs: 5,
          fat: 12,
        },
        fullNutritionData: {
          mealType: 'breakfast',
        },
      },
      {
        id: '2',
        name: 'Toast',
        timestamp: new Date('2023-10-15T08:15:00Z'),
        notes: 'More breakfast',
        nutritionData: {
          calories: 150,
          protein: 5,
          carbs: 25,
          fat: 3,
        },
        fullNutritionData: {
          mealType: 'breakfast',
        },
      },
      {
        id: '3',
        name: 'Grilled Chicken',
        timestamp: new Date('2023-10-15T12:30:00Z'),
        notes: 'Lunch meal',
        nutritionData: {
          calories: 300,
          protein: 40,
          carbs: 0,
          fat: 15,
        },
      },
    ]

    it('groups meals by type correctly', () => {
      const result = transformMealsToMobileFormat(mockMeals)

      expect(result).toHaveLength(2)
      expect(result[0].type).toBe('Breakfast')
      expect(result[0].count).toBe(2)
      expect(result[0].items).toHaveLength(2)
      expect(result[1].type).toBe('Lunch')
      expect(result[1].count).toBe(1)
    })

    it('uses fullNutritionData mealType when available', () => {
      const result = transformMealsToMobileFormat(mockMeals)
      const breakfastGroup = result.find(group => group.type === 'Breakfast')
      
      expect(breakfastGroup).toBeDefined()
      expect(breakfastGroup!.emoji).toBe('🍳')
    })

    it('falls back to timestamp-based meal type', () => {
      const result = transformMealsToMobileFormat(mockMeals)
      const lunchGroup = result.find(group => group.type === 'Lunch')
      
      expect(lunchGroup).toBeDefined()
      expect(lunchGroup!.emoji).toBe('🍔')
    })

    it('formats meal items correctly', () => {
      const result = transformMealsToMobileFormat(mockMeals)
      const firstItem = result[0].items[0]

      expect(firstItem.id).toBe('1')
      expect(firstItem.name).toBe('Scrambled Eggs')
      expect(firstItem.calories).toBe(200)
      expect(firstItem.protein).toBe(15)
      expect(firstItem.carbs).toBe(5)
      expect(firstItem.fat).toBe(12)
      expect(firstItem.fullMeal).toBe(mockMeals[0])
    })

    it('handles empty meals array', () => {
      const result = transformMealsToMobileFormat([])
      expect(result).toEqual([])
    })

    it('handles meals without nutrition data', () => {
      const mealsWithoutNutrition: RecordedMeal[] = [
        {
          id: '1',
          name: 'Simple Meal',
          timestamp: new Date('2023-10-15T08:00:00Z'),
          notes: 'No nutrition data',
        },
      ]

      const result = transformMealsToMobileFormat(mealsWithoutNutrition)
      expect(result[0].items[0].calories).toBe(0)
      expect(result[0].items[0].protein).toBe(0)
      expect(result[0].items[0].carbs).toBe(0)
      expect(result[0].items[0].fat).toBe(0)
    })
  })

  describe('createMobileNutritionData', () => {
    const mockSummary = {
      calories: 1200,
      protein: 80,
      carbs: 150,
      fat: 40,
    }

    const mockMeals = [
      {
        id: 1,
        type: 'Breakfast',
        emoji: '🍳',
        count: 2,
        items: [],
      },
    ]

    it('creates mobile nutrition data correctly', () => {
      const result = createMobileNutritionData(mockSummary, mockMeals)

      expect(result.caloriesConsumed).toBe(1200)
      expect(result.caloriesGoal).toBe(2000)
      expect(result.caloriesRemaining).toBe(800)
      expect(result.macros.protein.current).toBe(80)
      expect(result.macros.protein.goal).toBe(120)
      expect(result.macros.carbs.current).toBe(150)
      expect(result.macros.fat.current).toBe(40)
      expect(result.meals).toBe(mockMeals)
    })

    it('ensures calories remaining never goes below 0', () => {
      const highCalorieSummary = {
        calories: 2500,
        protein: 100,
        carbs: 200,
        fat: 60,
      }

      const result = createMobileNutritionData(highCalorieSummary, mockMeals)
      expect(result.caloriesRemaining).toBe(0)
    })
  })
})