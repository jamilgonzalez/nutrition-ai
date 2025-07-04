import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { tavily } from '@tavily/core'
import { z } from 'zod'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
})

const nutritionModel = openrouter.chat('openai/gpt-4o-mini')

// Define the comprehensive nutrition plan schema
const nutritionPlanSchema = z.object({
  dailyCalories: z.number().describe('Recommended daily calorie intake'),
  macros: z.object({
    protein: z.number().describe('Daily protein target in grams'),
    carbs: z.number().describe('Daily carbohydrate target in grams'),
    fat: z.number().describe('Daily fat target in grams'),
    proteinPercentage: z
      .number()
      .describe('Protein as percentage of total calories'),
    carbsPercentage: z
      .number()
      .describe('Carbs as percentage of total calories'),
    fatPercentage: z.number().describe('Fat as percentage of total calories'),
  }),
  mealPlan: z.object({
    breakfast: z.object({
      calories: z.number(),
      suggestions: z
        .array(z.string())
        .describe('3-4 breakfast meal suggestions'),
    }),
    lunch: z.object({
      calories: z.number(),
      suggestions: z.array(z.string()).describe('3-4 lunch meal suggestions'),
    }),
    dinner: z.object({
      calories: z.number(),
      suggestions: z.array(z.string()).describe('3-4 dinner meal suggestions'),
    }),
    snacks: z.object({
      calories: z.number(),
      suggestions: z
        .array(z.string())
        .describe('3-4 healthy snack suggestions'),
    }),
  }),
  keyRecommendations: z
    .array(z.string())
    .describe('5-7 personalized nutrition recommendations'),
  supplementation: z
    .array(z.string())
    .describe('Recommended supplements if any, or empty array'),
  hydration: z.object({
    dailyWaterIntake: z
      .number()
      .describe('Recommended daily water intake in ounces'),
    tips: z.array(z.string()).describe('Hydration tips'),
  }),
  timeline: z.object({
    weeklyGoals: z.array(z.string()).describe('Weekly nutrition goals'),
    monthlyMilestones: z
      .array(z.string())
      .describe('Monthly progress milestones'),
  }),
  adaptations: z.object({
    forHealthConditions: z
      .array(z.string())
      .describe('Specific adaptations for health conditions'),
    forDietaryRestrictions: z
      .array(z.string())
      .describe('Adaptations for dietary restrictions'),
  }),
})

interface SearchResult {
  title: string
  url: string
  snippet: string
  score: number
}

interface UserProfile {
  age?: number
  sex?: string
  height?: number
  weight?: number
  activityLevel?: string
  goals?: string[]
  healthConditions?: string[]
  dietaryRestrictions?: string[]
}

type NutritionPlan = z.infer<typeof nutritionPlanSchema> & {
  sources: SearchResult[]
  summary: string
}

export async function POST(request: NextRequest) {
  let query = ''
  let profile: UserProfile | null = null
  try {
    const requestData = await request.json()
    query = requestData.query
    profile = requestData.profile

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Search for relevant nutrition information using Tavily
    const searchResults = await tvly.search(query, {
      searchDepth: 'advanced',
      maxResults: 6,
      includeAnswer: true,
      includeImages: false,
      includeRawContent: false,
    })

    // Calculate base calories using the existing function
    const baseCalories = calculateCalories(query)

    // Create a comprehensive prompt for the LLM with all context
    const nutritionPrompt = `
You are a world-class nutritionist and dietitian. Create a comprehensive, personalized nutrition plan based on the following information:

## User Profile:
${
  profile
    ? `
- Age: ${profile?.age} years
- Sex: ${profile?.sex}
- Height: ${profile?.height} inches
- Weight: ${profile?.weight} pounds
- Activity Level: ${profile?.activityLevel}
- Goals: ${profile?.goals?.join(', ') || 'General health'}
- Health Conditions: ${profile?.healthConditions?.join(', ') || 'None reported'}
- Dietary Restrictions: ${
        profile?.dietaryRestrictions?.join(', ') || 'None reported'
      }
`
    : 'Profile information not provided'
}

## Search Query Context:
${query}

## Latest Nutrition Research & Guidelines:
${searchResults.results
  .map(
    (result) => `
**${result.title}**
${result.content}
`
  )
  .join('\n')}

## Base Calorie Calculation:
Estimated daily calories: ${baseCalories}

## Instructions:
Create a detailed, evidence-based nutrition plan that:
1. Uses the most current nutritional science and guidelines
2. Accounts for the user's specific profile, goals, and restrictions
3. Provides practical, actionable meal suggestions
4. Considers any health conditions or dietary restrictions
5. Includes specific macronutrient targets optimized for their goals
6. Provides a realistic timeline for achieving nutrition goals
7. Suggests appropriate supplementation only if scientifically warranted

Base your recommendations on peer-reviewed research, established dietary guidelines, and evidence-based nutrition practices. Ensure all suggestions are safe, practical, and sustainable for long-term success.`

    // Generate comprehensive nutrition plan using LLM
    const nutritionPlan = await generateObject({
      model: nutritionModel,
      schema: nutritionPlanSchema,
      prompt: nutritionPrompt,
    })

    // Format search results for response
    const formattedSources: SearchResult[] = searchResults.results.map(
      (result) => ({
        title: result.title,
        url: result.url,
        snippet: result.content.substring(0, 200) + '...',
        score: result.score || 0.8,
      })
    )

    // Create comprehensive summary
    const summary = `Based on your personal profile and the latest nutritional research, I've created a comprehensive nutrition plan tailored specifically for you. Your daily calorie target is ${nutritionPlan.object.dailyCalories} calories, with macronutrient targets of ${nutritionPlan.object.macros.protein}g protein (${nutritionPlan.object.macros.proteinPercentage}%), ${nutritionPlan.object.macros.carbs}g carbohydrates (${nutritionPlan.object.macros.carbsPercentage}%), and ${nutritionPlan.object.macros.fat}g fat (${nutritionPlan.object.macros.fatPercentage}%). This plan includes personalized meal suggestions, hydration goals, and specific recommendations for your health conditions and dietary preferences. The plan is designed to support your goals while being sustainable and enjoyable long-term.`

    const result: NutritionPlan = {
      ...nutritionPlan.object,
      sources: formattedSources,
      summary,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Enhanced nutrition search API error:', error)
    
    // Fallback to basic calculation if LLM fails
    const fallbackCalories = calculateCalories(query || '')
    const fallbackResult: NutritionPlan = {
      dailyCalories: fallbackCalories,
      macros: {
        protein: Math.round(fallbackCalories * 0.30 / 4), // 30% protein, 4 cal/g
        carbs: Math.round(fallbackCalories * 0.50 / 4), // 50% carbs, 4 cal/g
        fat: Math.round(fallbackCalories * 0.20 / 9), // 20% fat, 9 cal/g
        proteinPercentage: 30,
        carbsPercentage: 50,
        fatPercentage: 20,
      },
      mealPlan: {
        breakfast: { 
          calories: Math.round(fallbackCalories * 0.25), 
          suggestions: ['Oatmeal with berries and nuts', 'Greek yogurt with granola', 'Scrambled eggs with toast', 'Smoothie bowl'] 
        },
        lunch: { 
          calories: Math.round(fallbackCalories * 0.35), 
          suggestions: ['Grilled chicken salad', 'Quinoa power bowl', 'Turkey and avocado wrap', 'Lentil soup with bread'] 
        },
        dinner: { 
          calories: Math.round(fallbackCalories * 0.30), 
          suggestions: ['Baked salmon with vegetables', 'Lean protein with brown rice', 'Vegetarian stir-fry', 'Grilled chicken with sweet potato'] 
        },
        snacks: { 
          calories: Math.round(fallbackCalories * 0.10), 
          suggestions: ['Apple with almond butter', 'Mixed nuts', 'Greek yogurt', 'Hummus with vegetables'] 
        },
      },
      keyRecommendations: [
        'Focus on whole, unprocessed foods',
        'Stay consistently hydrated throughout the day',
        'Eat regular meals to maintain stable energy',
        'Include protein with each meal',
        'Aim for 5-7 servings of fruits and vegetables daily'
      ],
      supplementation: [],
      hydration: { 
        dailyWaterIntake: 64, 
        tips: ['Drink water with each meal', 'Carry a water bottle', 'Add lemon for flavor'] 
      },
      timeline: { 
        weeklyGoals: ['Track all meals and snacks', 'Meet daily hydration targets'], 
        monthlyMilestones: ['Establish consistent meal routine', 'Notice improved energy levels'] 
      },
      adaptations: { 
        forHealthConditions: profile?.healthConditions || [], 
        forDietaryRestrictions: profile?.dietaryRestrictions || [] 
      },
      sources: [],
      summary: `Basic nutrition plan with ${fallbackCalories} daily calories. Enhanced recommendations temporarily unavailable, but this plan provides ${Math.round(fallbackCalories * 0.30 / 4)}g protein, ${Math.round(fallbackCalories * 0.50 / 4)}g carbs, and ${Math.round(fallbackCalories * 0.20 / 9)}g fat per day.`,
    }
    
    return NextResponse.json(fallbackResult)
  }
}

function calculateCalories(query: string): number {
  // Simple calorie calculation based on query parsing
  // In a real implementation, you'd use proper BMR formulas like Harris-Benedict or Mifflin-St Jeor

  const ageMatch = query.match(/(\d+)\s*year/i)
  const heightMatch = query.match(/(\d+)\s*inch/i)
  const weightMatch = query.match(/(\d+)\s*pound/i)
  const sexMatch = query.match(/\b(male|female)\b/i)
  const activityMatch = query.match(
    /\b(sedentary|light|moderate|active|very_active)\b/i
  )

  const age = ageMatch ? parseInt(ageMatch[1]) : 30
  const height = heightMatch ? parseInt(heightMatch[1]) : 68
  const weight = weightMatch ? parseInt(weightMatch[1]) : 150
  const sex = sexMatch ? sexMatch[1].toLowerCase() : 'male'
  const activity = activityMatch ? activityMatch[1].toLowerCase() : 'moderate'

  // Mifflin-St Jeor Equation
  let bmr: number
  if (sex === 'male') {
    bmr = 10 * (weight * 0.453592) + 6.25 * (height * 2.54) - 5 * age + 5
  } else {
    bmr = 10 * (weight * 0.453592) + 6.25 * (height * 2.54) - 5 * age - 161
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }

  const multiplier =
    activityMultipliers[activity as keyof typeof activityMultipliers] || 1.55
  const tdee = bmr * multiplier

  return Math.round(tdee)
}
