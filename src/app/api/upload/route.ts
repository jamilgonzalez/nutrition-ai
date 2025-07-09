import { generateObject, generateText } from 'ai'
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

const imageModel = openrouter.chat('openai/gpt-4.1')

const objectModel = openrouter.chat('openai/gpt-4o-mini')

export async function POST(req: Request) {
  const { messages } = await req.json()

  try {
    // Get the latest message with image
    const latestMessage = messages[messages.length - 1]

    const searchResults = await generateText({
      model: imageModel,
      messages: [latestMessage],
      maxSteps: 2,
      tools: {
        webSearch: {
          description: 'Search the web for information',
          parameters: z.object({
            query: z.string(),
          }),
          execute: async ({ query }) => {
            console.log('Searching for:', query)
            const results = await tvly.search(query)
            return {
              success: true,
              results,
            }
          },
        },
      },
    })

    const result = await generateObject({
      model: objectModel,
      schema: nutritionSchema,
      system: `You are an expert nutritionist. Your task is to provide the most detailed and accurate nutritional information based on the user message content and the search results.
        
        Use the following search results to enhance your analysis: ${JSON.stringify(
          searchResults
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
      maxRetries: 3,
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
