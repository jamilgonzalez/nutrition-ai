import { streamText, generateObject } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { tavily } from '@tavily/core'
import { z } from 'zod'
import { nutritionSchema } from './types'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
})

const imageModel = openrouter.chat('openai/gpt-4o-mini')

export async function POST(req: Request) {
  const { messages, structured = false } = await req.json()

  // If structured output is requested, use generateObject
  if (structured) {
    try {
      // Get the latest message with image
      const latestMessage = messages[messages.length - 1]

      // Search for additional nutrition info
      const searchQuery = `Nutrition facts, calories, protein, carbs and fat analysis for ${latestMessage.content}`
      const searchResults = await tvly.search(searchQuery, {
        searchDepth: 'advanced',
        topic: 'general',
      })

      const result = await generateObject({
        model: imageModel,
        schema: nutritionSchema,
        system: `You are an expert nutritionist. Analyze the meal image and provide detailed nutritional information.
        
        Use the following search results to enhance your analysis: ${JSON.stringify(
          searchResults.results.slice(0, 5)
        )}
        
        Be as accurate as possible with your estimates. Consider:
        - Portion sizes visible in the image
        - Cooking methods that might affect nutritional content
        - Common nutritional values for similar foods
        - Provide realistic estimates based on what you can see
        
        For the health score, consider nutritional balance, processing level, and overall healthiness.
        
        IMPORTANT: In your response, include a 'sources' array with the most relevant and trustworthy sources from the search results. Select 2-3 high-quality sources that directly support your nutritional analysis. For each source, provide:
        - title: The title of the article/page
        - url: The full URL
        - domain: Just the domain name (e.g., "healthline.com")
        - snippet: A brief relevant excerpt if available
        - relevance: Rate as 'high', 'medium', or 'low' based on how directly it supports your analysis
        
        Prioritize sources from reputable nutrition and health websites like Healthline, Mayo Clinic, WebMD, USDA, or similar authoritative sources.`,
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
