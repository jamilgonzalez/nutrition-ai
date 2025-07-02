import { streamText, generateObject } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { tavily } from '@tavily/core'
import { z } from 'zod'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
})

const imageModel = openrouter.chat('openai/gpt-4o-mini')

// Define the nutrition data schema
const nutritionSchema = z.object({
  mealName: z.string().describe('Name or description of the meal'),
  totalCalories: z.number().describe('Estimated total calories'),
  macros: z.object({
    protein: z.number().describe('Protein content in grams'),
    carbohydrates: z.number().describe('Carbohydrates content in grams'),
    fat: z.number().describe('Fat content in grams'),
    fiber: z.number().describe('Fiber content in grams'),
    sugar: z.number().describe('Sugar content in grams'),
  }),
  micronutrients: z.object({
    sodium: z.number().optional().describe('Sodium content in mg'),
    potassium: z.number().optional().describe('Potassium content in mg'),
    vitaminC: z.number().optional().describe('Vitamin C content in mg'),
    calcium: z.number().optional().describe('Calcium content in mg'),
    iron: z.number().optional().describe('Iron content in mg'),
  }),
  ingredients: z.array(z.string()).describe('List of identified ingredients'),
  healthScore: z.number().min(1).max(10).describe('Health score from 1-10'),
  recommendations: z
    .array(z.string())
    .describe('Nutritional recommendations or insights'),
  portionSize: z.string().describe('Estimated portion size'),
  mealType: z
    .enum(['breakfast', 'lunch', 'dinner', 'snack', 'other'])
    .describe('Type of meal'),
})

export async function POST(req: Request) {
  const { messages, structured = false } = await req.json()

  // If structured output is requested, use generateObject
  if (structured) {
    try {
      // Get the latest message with image
      const latestMessage = messages[messages.length - 1]

      // Search for additional nutrition info
      const searchQuery =
        'nutrition facts calories protein carbs fat analysis meal'
      const searchResults = await tvly.search(searchQuery)

      const result = await generateObject({
        model: imageModel,
        schema: nutritionSchema,
        system: `You are an expert nutritionist. Analyze the meal image and provide detailed nutritional information.
        
        Use the following search results to enhance your analysis: ${JSON.stringify(
          searchResults.results.slice(0, 3)
        )}
        
        Be as accurate as possible with your estimates. Consider:
        - Portion sizes visible in the image
        - Cooking methods that might affect nutritional content
        - Common nutritional values for similar foods
        - Provide realistic estimates based on what you can see
        
        For the health score, consider nutritional balance, processing level, and overall healthiness.`,
        messages: [latestMessage],
      })

      return Response.json(result.object)
    } catch (error) {
      console.error('Error generating structured nutrition data:', error)
      return Response.json(
        { error: 'Failed to analyze nutrition data' },
        { status: 500 }
      )
    }
  }

  // Original streaming response for conversational interface
  const result = await streamText({
    model: imageModel,
    system: `You are a helpful nutritionist. You are given a picture of a meal and you need to analyze the meal and provide a detailed analysis of the meal.
      
    Please provide a detailed breakdown including:
    - Estimated total calories
    - Protein content (grams)
    - Carbohydrates content (grams) 
    - Fat content (grams)
    - Sugars content (grams)
    - Key ingredients you can identify
    - Any nutritional insights or recommendations

    Use the webSearch tool to enhance your analysis and nutrition knowledge.
    
    Format your response in a clear, structured way that's easy to read and keep it short and concise.`,
    messages,
    tools: {
      webSearch: {
        description: 'Search the web for information',
        parameters: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => {
          const results = await tvly.search(query)
          return {
            success: true,
            results,
          }
        },
      },
    },
    maxSteps: 10,
  })

  return result.toDataStreamResponse()
}
