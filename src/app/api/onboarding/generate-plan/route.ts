import { generateObject, generateText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { tavily } from '@tavily/core'
import { z } from 'zod'
import { SimpleOnboardingData } from '@/types/onboarding'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
})

const model = openrouter.chat('openai/gpt-4o-mini')

const planSchema = z.object({
  calories: z.number().min(1000).max(5000).describe('Daily calorie target'),
  macros: z.object({
    protein: z.number().min(50).max(300).describe('Daily protein in grams'),
    carbs: z.number().min(50).max(500).describe('Daily carbohydrates in grams'),
    fat: z.number().min(30).max(200).describe('Daily fat in grams'),
    fiber: z.number().min(20).max(50).describe('Daily fiber in grams'),
  }),
  explanation: z.string().describe('Clear explanation of why this plan works for the user'),
  methodology: z.string().describe('Detailed explanation of calculations and methodology used'),
  sources: z.array(z.object({
    title: z.string().describe('Title of the source'),
    url: z.string().url().describe('URL of the source'),
    domain: z.string().describe('Domain name of the source'),
    relevance: z.enum(['high', 'medium', 'low']).describe('Relevance to the nutrition analysis')
  })).describe('Web sources used for nutrition analysis'),
})

export async function POST(req: Request) {
  try {
    const data: SimpleOnboardingData = await req.json()
    
    // Validate input
    if (!data.age || !data.gender || !data.height || !data.weight || !data.activityLevel || !data.goals) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate web search query for current nutrition guidelines
    const searchQuery = `nutrition guidelines ${data.gender} ${data.age} years old ${data.goals} ${data.activityLevel} calorie requirements protein carbs fat macros 2024`
    
    console.log('Searching for:', searchQuery)
    const searchResults = await tvly.search(searchQuery)

    // Generate personalized nutrition plan
    const result = await generateObject({
      model,
      schema: planSchema,
      system: `You are an expert nutritionist and dietitian. Your task is to create a personalized nutrition plan based on the user's information and current scientific evidence.

      Use the following search results for the latest nutrition guidelines: ${JSON.stringify(searchResults)}

      Calculate the plan using these steps:
      1. Calculate BMR using Mifflin-St Jeor equation:
         - Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
         - Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
      2. Calculate TDEE using activity multipliers:
         - Sedentary: BMR × 1.2
         - Lightly active: BMR × 1.375
         - Moderately active: BMR × 1.55
         - Very active: BMR × 1.725
         - Extremely active: BMR × 1.9
      3. Adjust calories based on goals:
         - Weight loss: TDEE - 500 calories (1 lb/week)
         - Weight gain: TDEE + 500 calories (1 lb/week)
         - Maintenance: TDEE
      4. Set macros:
         - Protein: 0.8-1.2g per lb bodyweight (higher for muscle building)
         - Fat: 20-35% of total calories
         - Carbs: Fill remaining calories
         - Fiber: 25-35g per day

      Consider dietary restrictions: ${data.dietaryRestrictions || 'None specified'}

      IMPORTANT: Include 2-3 high-quality sources from the search results that directly support your recommendations. Prioritize sources from reputable nutrition organizations, research institutions, or health websites.`,
      messages: [
        {
          role: 'user',
          content: `Create a personalized nutrition plan for:
          - Age: ${data.age}
          - Gender: ${data.gender}
          - Height: ${data.height} inches
          - Weight: ${data.weight} pounds
          - Activity Level: ${data.activityLevel}
          - Goals: ${data.goals}
          - Dietary Restrictions: ${data.dietaryRestrictions || 'None'}
          
          Provide specific calorie and macro targets with clear explanations.`
        }
      ],
      maxRetries: 3,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error('Error generating nutrition plan:', error)
    return Response.json(
      { error: 'Failed to generate nutrition plan' },
      { status: 500 }
    )
  }
}