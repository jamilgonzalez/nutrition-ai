import z from 'zod'

// Define the nutrition data schema
export const nutritionSchema = z.object({
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
  sources: z
    .array(
      z.object({
        title: z.string().describe('Title of the source'),
        url: z.string().url().describe('URL of the source'),
        domain: z.string().describe('Domain name of the source (e.g., "healthline.com")'),
        snippet: z.string().optional().describe('Brief excerpt from the source'),
        relevance: z.enum(['high', 'medium', 'low']).describe('Relevance to the nutrition analysis')
      })
    )
    .describe('Web sources used for nutrition analysis'),
})
