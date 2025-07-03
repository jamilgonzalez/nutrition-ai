import { generateObject } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { tavily } from '@tavily/core'
import { z } from 'zod'
import { NextResponse } from 'next/server'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
})

const model = openrouter.chat('openai/gpt-4o-mini')

// Define the restaurant search result schema
const restaurantSearchSchema = z.object({
  menuItems: z
    .array(
      z.object({
        id: z.string().describe('Unique identifier for the menu item'),
        name: z.string().describe('Name of the menu item'),
        description: z.string().describe('Description of the menu item'),
        price: z.number().optional().describe('Price in USD'),
        calories: z.number().describe('Calories in the menu item'),
        protein: z.number().describe('Protein content in grams'),
        carbs: z.number().describe('Carbohydrates content in grams'),
        fat: z.number().describe('Fat content in grams'),
        fiber: z.number().optional().describe('Fiber content in grams'),
        sugar: z.number().optional().describe('Sugar content in grams'),
        sodium: z.number().optional().describe('Sodium content in mg'),
        restaurantId: z.string().describe('Restaurant identifier'),
        restaurantName: z.string().describe('Name of the restaurant'),
        estimatedDeliveryTime: z
          .string()
          .optional()
          .describe('Estimated delivery time (e.g., "15-25 min")'),
      })
    )
    .describe('Array of menu items that match the macro targets'),
})

export async function POST(req: Request) {
  try {
    const { query, location, macroTargets } = await req.json()

    if (!query || !location || !macroTargets) {
      return NextResponse.json(
        {
          error:
            'Missing required parameters: query, location, or macroTargets',
        },
        { status: 400 }
      )
    }

    // Use Tavily to search for restaurant information
    const searchResults = await tvly.search(query)

    // Combine search results into a single context
    const searchContext = searchResults.results
      .map((result) => `${result.title}: ${result.content}`)
      .join('\n\n')

    // Use LLM to parse and structure the restaurant data
    const result = await generateObject({
      model,
      schema: restaurantSearchSchema,
      prompt: `
        You are a nutrition expert analyzing restaurant search results to find menu items that match specific macro targets.

        Search Results:
        ${searchContext}

        Location: ${location}
        
        Macro Targets:
        - Calories: ${macroTargets.calories.min}-${macroTargets.calories.max}
        - Protein: ${macroTargets.protein.min}-${macroTargets.protein.max}g
        - Carbs: ${macroTargets.carbs.min}-${macroTargets.carbs.max}g
        - Fat: ${macroTargets.fat.min}-${macroTargets.fat.max}g

        Please analyze the search results and extract menu items from restaurants that:
        1. Are likely available near ${location}
        2. Have nutrition information available
        3. Match or closely match the macro targets (within 20% tolerance)
        4. Are realistic meal options (not drinks, desserts, or supplements)

        For each menu item, provide:
        - A unique ID (restaurant-name-item-name format)
        - The exact item name
        - A brief description
        - Price if available
        - Detailed nutrition information (calories, protein, carbs, fat)
        - Additional nutrients if available (fiber, sugar, sodium)
        - Restaurant name and ID
        - Estimated delivery time if mentioned

        Focus on options that would satisfy someone looking for a meal that fits their macro targets.
        If no exact matches are found, include the closest options that are still reasonable.
        Let's also make sure to have a good mix of options from different restaurants.
        
        Return up to 10 menu items, prioritizing those that best match the macro targets.
      `,
    })

    return NextResponse.json({
      menuItems: result.object.menuItems,
      searchQuery: query,
      location,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Restaurant search error:', error)

    return NextResponse.json(
      {
        error: 'Failed to search restaurants',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
