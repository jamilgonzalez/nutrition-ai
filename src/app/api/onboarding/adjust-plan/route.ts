import { generateObject } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { z } from 'zod'
import { GeneratedPlan, PlanAdjustmentRequest } from '@/types/onboarding'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const model = openrouter.chat('openai/gpt-4o-mini')

const adjustedPlanSchema = z.object({
  calories: z.number().min(1000).max(5000).describe('Adjusted daily calorie target'),
  macros: z.object({
    protein: z.number().min(50).max(300).describe('Adjusted daily protein in grams'),
    carbs: z.number().min(50).max(500).describe('Adjusted daily carbohydrates in grams'),
    fat: z.number().min(30).max(200).describe('Adjusted daily fat in grams'),
    fiber: z.number().min(20).max(50).describe('Adjusted daily fiber in grams'),
  }),
  explanation: z.string().describe('Original plan explanation'),
  methodology: z.string().describe('Original methodology'),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    domain: z.string(),
    relevance: z.enum(['high', 'medium', 'low'])
  })).describe('Original sources'),
  adjustments: z.object({
    calories: z.number().nullable().optional(),
    protein: z.number().nullable().optional(),
    carbs: z.number().nullable().optional(),
    fat: z.number().nullable().optional(),
    adjustmentReason: z.string(),
  }).describe('The adjustments made'),
  adjustmentExplanation: z.string().describe('Explanation of the adjustments and how they affect the plan'),
})

export async function POST(req: Request) {
  try {
    const { originalPlan, adjustments }: { 
      originalPlan: GeneratedPlan, 
      adjustments: PlanAdjustmentRequest 
    } = await req.json()
    
    // Validate input
    if (!originalPlan || !adjustments || !adjustments.adjustmentReason) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate adjusted plan
    const result = await generateObject({
      model,
      schema: adjustedPlanSchema,
      system: `You are an expert nutritionist helping to adjust a personalized nutrition plan based on user preferences.

      Your task is to:
      1. Take the user's requested adjustments and apply them thoughtfully
      2. Ensure the adjusted plan maintains nutritional balance
      3. Adjust other macros proportionally if needed to maintain calorie balance
      4. Explain the impact of these changes
      5. Warn if any adjustments might be problematic

      Rules for adjustments:
      - Calories: 1 gram protein = 4 calories, 1 gram carbs = 4 calories, 1 gram fat = 9 calories
      - If calories are adjusted but macros aren't, distribute the change proportionally
      - If macros are adjusted but calories aren't, recalculate calories to match
      - Maintain nutritional adequacy (minimum protein, essential fats, etc.)
      - Flag any potentially unhealthy adjustments in your explanation

      IMPORTANT: In the adjustments object, only include the actual numeric values that were changed. For fields that weren't adjusted, omit them entirely from the adjustments object (don't set them to null).

      Keep the original explanation, methodology, and sources unchanged. Only add the adjustment explanation.`,
      messages: [
        {
          role: 'user',
          content: `Original Plan:
          - Calories: ${originalPlan.calories}
          - Protein: ${originalPlan.macros.protein}g
          - Carbs: ${originalPlan.macros.carbs}g
          - Fat: ${originalPlan.macros.fat}g
          - Fiber: ${originalPlan.macros.fiber}g
          
          Requested Adjustments:
          - Calories: ${adjustments.calories || 'no change'}
          - Protein: ${adjustments.protein || 'no change'}
          - Carbs: ${adjustments.carbs || 'no change'}
          - Fat: ${adjustments.fat || 'no change'}
          - Reason: ${adjustments.adjustmentReason}
          
          Please apply these adjustments while maintaining nutritional balance.`
        }
      ],
      maxRetries: 3,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error('Error adjusting nutrition plan:', error)
    return Response.json(
      { error: 'Failed to adjust nutrition plan' },
      { status: 500 }
    )
  }
}