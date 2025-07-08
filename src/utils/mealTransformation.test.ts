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
      const date = new Date()
      date.setHours(8, 0, 0, 0) // 8 AM local time
      expect(getMealType(date)).toBe('Breakfast')
    })

    it('returns Lunch for midday hours', () => {
      const date = new Date()
      date.setHours(13, 0, 0, 0) // 1 PM local time
      expect(getMealType(date)).toBe('Lunch')
    })

    it('returns Dinner for evening hours', () => {
      const date = new Date()
      date.setHours(18, 0, 0, 0) // 6 PM local time
      expect(getMealType(date)).toBe('Dinner')
    })

    it('returns Snack for late night hours', () => {
      const date = new Date()
      date.setHours(22, 0, 0, 0) // 10 PM local time
      expect(getMealType(date)).toBe('Snack')
    })

    it('handles string timestamps', () => {
      const testDate = new Date()
      testDate.setHours(9, 0, 0, 0) // 9 AM local time
      expect(getMealType(testDate.toISOString())).toBe('Breakfast')
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
    const createLocalDate = (hour: number, minute: number = 0) => {
      const date = new Date()
      date.setHours(hour, minute, 0, 0)
      return date
    }
    
    const mockMeals: RecordedMeal[] = [
      {
        id: '1',
        name: 'Scrambled Eggs',
        timestamp: createLocalDate(8, 0), // 8:00 AM local time
        notes: 'Morning breakfast',
        nutritionData: {
          calories: 200,
          protein: 15,
          carbs: 5,
          fat: 12,
        },
        fullNutritionData: {
          mealName: 'Scrambled Eggs',
          totalCalories: 200,
          macros: {
            protein: 15,
            carbohydrates: 5,
            fat: 12,
            fiber: 2,
            sugar: 1,
          },
          micronutrients: {
            sodium: 150,
            potassium: 100,
          },
          ingredients: ['eggs', 'butter', 'salt'],
          healthScore: 85,
          recommendations: ['Good protein source'],
          portionSize: '2 eggs',
          mealType: 'breakfast',
        },
      },
      {
        id: '2',
        name: 'Toast',
        timestamp: createLocalDate(8, 15), // 8:15 AM local time
        notes: 'More breakfast',
        nutritionData: {
          calories: 150,
          protein: 5,
          carbs: 25,
          fat: 3,
        },
        fullNutritionData: {
          mealName: 'Toast',
          totalCalories: 150,
          macros: {
            protein: 5,
            carbohydrates: 25,
            fat: 3,
            fiber: 3,
            sugar: 2,
          },
          micronutrients: {
            sodium: 200,
            potassium: 80,
          },
          ingredients: ['bread', 'butter'],
          healthScore: 70,
          recommendations: ['Good carbohydrate source'],
          portionSize: '2 slices',
          mealType: 'breakfast',
        },
      },
      {
        id: '3',
        name: 'Grilled Chicken',
        timestamp: createLocalDate(12, 30), // 12:30 PM local time
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