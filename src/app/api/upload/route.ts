import { streamText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const imageModel = openrouter.chat('openai/gpt-4o')

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: imageModel,
    system: `You are a helpful nutritionist. You are given a picture of a meal and you need to analyze the meal and provide a detailed analysis of the meal.
      
    Please provide a detailed breakdown including:
    - Estimated total calories
    - Protein content (grams)
    - Carbohydrates content (grams) 
    - Fat content (grams)
    - Key ingredients you can identify
    - Any nutritional insights or recommendations
    
    Format your response in a clear, structured way that's easy to read and keep it short and concise.`,
    messages,
  })

  return result.toDataStreamResponse()
}
