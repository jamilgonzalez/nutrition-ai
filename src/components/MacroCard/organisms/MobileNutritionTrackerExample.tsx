'use client'

import { useState, useEffect } from 'react'
import MobileNutritionTracker from './MobileNutritionTracker'
import { getTodaysMeals, getTodaysNutritionSummary } from '@/lib/mealStorage'
import { DEFAULT_DAILY_GOALS } from '../constants'

export default function MobileNutritionTrackerExample() {
  const [nutritionData, setNutritionData] = useState({
    caloriesConsumed: 0,
    caloriesGoal: DEFAULT_DAILY_GOALS.calories,
    caloriesRemaining: DEFAULT_DAILY_GOALS.calories,
    macros: {
      protein: { current: 0, goal: DEFAULT_DAILY_GOALS.protein, unit: "g" },
      carbs: { current: 0, goal: DEFAULT_DAILY_GOALS.carbs, unit: "g" },
      fat: { current: 0, goal: DEFAULT_DAILY_GOALS.fat, unit: "g" },
    },
    meals: [] as any[]
  })

  useEffect(() => {
    // Load actual user data
    const loadData = () => {
      const meals = getTodaysMeals()
      const summary = getTodaysNutritionSummary(meals)
      
      // Transform meals to mobile format (same logic as main app)
      const mobileFormatMeals = meals.reduce((acc: any[], meal) => {
        // Use meal's actual type if available, otherwise derive from timestamp
        const mealType = meal.fullNutritionData?.mealType 
          ? meal.fullNutritionData.mealType.charAt(0).toUpperCase() + meal.fullNutritionData.mealType.slice(1)
          : getMealType(meal.timestamp)
        const existingMeal = acc.find(m => m.type === mealType)
        
        const mealItem = {
          id: meal.id,
          name: meal.name,
          time: new Date(meal.timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          calories: meal.nutritionData?.calories || 0,
          protein: meal.nutritionData?.protein || 0,
          carbs: meal.nutritionData?.carbs || 0,
          fat: meal.nutritionData?.fat || 0,
          fullMeal: meal,
        }
        
        if (existingMeal) {
          existingMeal.items.push(mealItem)
          existingMeal.count = existingMeal.items.length
        } else {
          acc.push({
            id: acc.length + 1,
            type: mealType,
            emoji: getMealEmoji(mealType),
            count: 1,
            items: [mealItem]
          })
        }
        
        return acc
      }, [])
      
      setNutritionData({
        caloriesConsumed: summary.calories,
        caloriesGoal: DEFAULT_DAILY_GOALS.calories,
        caloriesRemaining: Math.max(0, DEFAULT_DAILY_GOALS.calories - summary.calories),
        macros: {
          protein: { current: summary.protein, goal: DEFAULT_DAILY_GOALS.protein, unit: "g" },
          carbs: { current: summary.carbs, goal: DEFAULT_DAILY_GOALS.carbs, unit: "g" },
          fat: { current: summary.fat, goal: DEFAULT_DAILY_GOALS.fat, unit: "g" },
        },
        meals: mobileFormatMeals
      })
    }
    
    loadData()
    
    // Listen for meal updates
    const handleMealSaved = () => {
      loadData()
    }
    
    window.addEventListener('mealSaved', handleMealSaved)
    
    return () => {
      window.removeEventListener('mealSaved', handleMealSaved)
    }
  }, [])

  const getMealType = (timestamp: string | Date) => {
    const hour = new Date(timestamp).getHours()
    if (hour < 11) return 'Breakfast'
    if (hour < 15) return 'Lunch'
    if (hour < 19) return 'Dinner'
    return 'Snack'
  }

  const getMealEmoji = (mealType: string) => {
    switch (mealType) {
      case 'Breakfast': return '🍳'
      case 'Lunch': return '🍔'
      case 'Dinner': return '🍽️'
      case 'Snack': return '🥨'
      default: return '🍽️'
    }
  }

  const handleChatSubmit = (message: string) => {
    console.log('Chat message:', message)
    // TODO: Implement chat functionality
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MobileNutritionTracker
        caloriesConsumed={nutritionData.caloriesConsumed}
        caloriesGoal={nutritionData.caloriesGoal}
        caloriesRemaining={nutritionData.caloriesRemaining}
        macros={nutritionData.macros}
        meals={nutritionData.meals}
      />
      
      {/* You would add your own chat input component here */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Add a meal or ask about nutrition..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement
                handleChatSubmit(target.value)
                target.value = ''
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}