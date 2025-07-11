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
  const startTime = Date.now()
  console.log('🚀 Upload API started at:', new Date().toISOString())

  const { messages } = await req.json()

  try {
    // Get the latest message with image
    const latestMessage = messages[messages.length - 1]

    const searchStartTime = Date.now()
    console.log('🔍 Web search started at:', new Date().toISOString())

    const searchResults = await generateText({
      model: imageModel,
      system: `Your task is to analyze the user's message and the image and extract the most relevant information in order to generate the most accurate nutritional information.
          Search the web to find the most relevant information and increase the accuracy of the nutritional information.
          Only use reputable sources that are authoritative and trustworthy and relevant to the data you extracted.
          
          ex. If you see a Starbucks logo on a coffee your search query should include starbucks in it.`,
      messages: [latestMessage],
      tools: {
        webSearch: {
          description: `Search the web for nutrition information relevant to the user's message and the image.`,
          parameters: z.object({
            query: z.string(),
          }),
          execute: async ({ query }) => {
            console.log('Searching for:', query)
            const results = await tvly.search(query, {
              maxResults: 3,
              includeRawContent: 'markdown',
            })
            return {
              success: true,
              results,
            }
          },
        },
      },
    })

    const searchEndTime = Date.now()
    const searchDuration = searchEndTime - searchStartTime
    console.log('🔍 Web search completed in', searchDuration, 'ms')

    const objectStartTime = Date.now()
    console.log('🎯 Object generation started at:', new Date().toISOString())

    const result = await generateObject({
      model: objectModel,
      schema: nutritionSchema,
      system: `You are an expert nutritionist. Your task is to provide the most detailed and accurate nutritional information based on the user message content and the search results
      structured according to the schema provided.
        
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
        `,
      messages: [latestMessage],
    })

    const objectEndTime = Date.now()
    const objectDuration = objectEndTime - objectStartTime
    console.log('🎯 Object generation completed in', objectDuration, 'ms')

    const endTime = Date.now()
    const duration = endTime - startTime
    console.log('✅ Upload API completed successfully in', duration, 'ms')
    console.log(
      '📊 Performance breakdown - Search:',
      searchDuration,
      'ms, Object generation:',
      objectDuration,
      'ms'
    )
    console.log('🏁 Upload API ended at:', new Date().toISOString())

    return Response.json(result.object)
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    console.error('❌ Upload API failed after', duration, 'ms')
    console.error('Error generating structured nutrition data:', error)
    console.log('🏁 Upload API ended at:', new Date().toISOString())

    return Response.json(
      { error: 'Failed to analyze nutrition data' },
      { status: 500 }
    )
  }
}
