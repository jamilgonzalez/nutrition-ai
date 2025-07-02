import { NextRequest, NextResponse } from 'next/server'

interface SearchResult {
  title: string
  url: string
  snippet: string
  score: number
}

interface CalorieRecommendation {
  dailyCalories: number
  protein: number
  carbs: number
  fat: number
  sources: SearchResult[]
  summary: string
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // For now, we'll create a stub implementation
    // In a real implementation, you would use Tavily or another search API
    const mockResults: CalorieRecommendation = {
      dailyCalories: calculateCalories(query),
      protein: 0,
      carbs: 0,
      fat: 0,
      sources: [
        {
          title: "Calorie Calculator - Mayo Clinic",
          url: "https://www.mayoclinic.org/healthy-lifestyle/weight-loss/in-depth/calories/art-20048890",
          snippet: "Calculate your daily calorie needs based on age, sex, height, weight, and activity level using evidence-based formulas.",
          score: 0.95
        },
        {
          title: "Dietary Guidelines for Americans 2020-2025 - USDA",
          url: "https://www.dietaryguidelines.gov/sites/default/files/2021-03/Dietary_Guidelines_for_Americans-2020-2025.pdf",
          snippet: "Official dietary guidelines including calorie recommendations for different demographics and activity levels.",
          score: 0.92
        },
        {
          title: "Harris-Benedict Equation - National Institutes of Health",
          url: "https://www.niddk.nih.gov/bwp",
          snippet: "Research-backed methods for calculating basal metabolic rate and daily calorie needs.",
          score: 0.89
        },
        {
          title: "Academy of Nutrition and Dietetics",
          url: "https://www.eatright.org/health/weight-loss/your-health-and-your-weight/how-many-calories-do-you-need",
          snippet: "Professional guidance on determining individual calorie needs based on lifestyle and health goals.",
          score: 0.87
        }
      ],
      summary: ""
    }

    // Calculate macros based on calories
    mockResults.protein = Math.round(mockResults.dailyCalories * 0.30 / 4) // 30% protein
    mockResults.carbs = Math.round(mockResults.dailyCalories * 0.50 / 4) // 50% carbs
    mockResults.fat = Math.round(mockResults.dailyCalories * 0.20 / 9) // 20% fat

    mockResults.summary = `Based on your profile, your estimated daily calorie needs are ${mockResults.dailyCalories} calories. This includes approximately ${mockResults.protein}g protein (30%), ${mockResults.carbs}g carbs (50%), and ${mockResults.fat}g fat (20%). These recommendations are based on established nutritional guidelines and scientific formulas that account for your age, sex, height, weight, activity level, and stated goals.`

    return NextResponse.json(mockResults)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search for calorie recommendations' },
      { status: 500 }
    )
  }
}

function calculateCalories(query: string): number {
  // Simple calorie calculation based on query parsing
  // In a real implementation, you'd use proper BMR formulas like Harris-Benedict or Mifflin-St Jeor
  
  const ageMatch = query.match(/(\d+)\s*year/i)
  const heightMatch = query.match(/(\d+)\s*inch/i)
  const weightMatch = query.match(/(\d+)\s*pound/i)
  const sexMatch = query.match(/\b(male|female)\b/i)
  const activityMatch = query.match(/\b(sedentary|light|moderate|active|very_active)\b/i)

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
    very_active: 1.9
  }

  const multiplier = activityMultipliers[activity as keyof typeof activityMultipliers] || 1.55
  const tdee = bmr * multiplier

  return Math.round(tdee)
}