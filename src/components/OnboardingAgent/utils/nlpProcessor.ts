import { UserProfile } from '../types'

interface ExtractedData {
  age?: number
  sex?: 'male' | 'female' | 'other'
  height?: number
  weight?: number
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goals?: string[]
  dietaryRestrictions?: string[]
}

export function extractMultipleDataPoints(input: string): ExtractedData {
  const normalizedInput = input.toLowerCase().trim()
  const extracted: ExtractedData = {}

  // Extract age
  const agePatterns = [
    /(?:i'm|i am|age|years old|year old)\s*(\d+)/i,
    /(\d+)\s*(?:years old|year old|years|yrs)/i,
    /(?:age|aged)\s*(\d+)/i,
  ]
  
  for (const pattern of agePatterns) {
    const match = normalizedInput.match(pattern)
    if (match) {
      const age = parseInt(match[1])
      if (age > 0 && age < 120) {
        extracted.age = age
        break
      }
    }
  }

  // Extract sex/gender
  const sexPatterns = [
    /(?:i'm|i am|gender|sex).*(?:male|man|boy)/i,
    /(?:i'm|i am|gender|sex).*(?:female|woman|girl)/i,
    /(?:male|man|boy)(?!\w)/i,
    /(?:female|woman|girl)(?!\w)/i,
  ]
  
  for (const pattern of sexPatterns) {
    const match = normalizedInput.match(pattern)
    if (match) {
      const matchedText = match[0].toLowerCase()
      if (matchedText.includes('male') || matchedText.includes('man') || matchedText.includes('boy')) {
        extracted.sex = 'male'
      } else if (matchedText.includes('female') || matchedText.includes('woman') || matchedText.includes('girl')) {
        extracted.sex = 'female'
      }
      break
    }
  }

  // Extract height
  const heightPatterns = [
    /(?:height|tall|high)\s*(?:is|am|'m)?\s*(\d+)?\s*(?:feet|ft|foot|')\s*(\d+)?\s*(?:inches|in|inch|")?/i,
    /(\d+)\s*(?:feet|ft|foot|')\s*(\d+)?\s*(?:inches|in|inch|")?/i,
    /(?:height|tall|high)\s*(?:is|am|'m)?\s*(\d+)\s*(?:inches|in|inch|")/i,
    /(\d+)\s*(?:inches|in|inch|")/i,
  ]
  
  for (const pattern of heightPatterns) {
    const match = normalizedInput.match(pattern)
    if (match) {
      let totalInches = 0
      const feet = parseInt(match[1] || '0')
      const inches = parseInt(match[2] || '0')
      
      if (feet > 0 && feet <= 8) { // reasonable feet range
        totalInches = feet * 12 + inches
      } else if (inches > 0 && inches <= 100) { // direct inches
        totalInches = inches
      }
      
      if (totalInches > 0) {
        extracted.height = totalInches
        break
      }
    }
  }

  // Extract weight
  const weightPatterns = [
    /(?:weight|weigh|pounds|lbs|lb)\s*(?:is|am|'m|about|around)?\s*(\d+)\s*(?:pounds|lbs|lb)?/i,
    /(\d+)\s*(?:pounds|lbs|lb)/i,
  ]
  
  for (const pattern of weightPatterns) {
    const match = normalizedInput.match(pattern)
    if (match) {
      const weight = parseInt(match[1])
      if (weight > 0 && weight <= 1000) { // reasonable weight range
        extracted.weight = weight
        break
      }
    }
  }

  // Extract activity level
  const activityPatterns = [
    { pattern: /(?:sedentary|sit|desk|office|no exercise|little exercise)/i, level: 'sedentary' },
    { pattern: /(?:light|1-3|once|twice|few times|lightly active)/i, level: 'light' },
    { pattern: /(?:moderate|3-5|several times|moderately active)/i, level: 'moderate' },
    { pattern: /(?:active|6-7|daily|every day|regularly)/i, level: 'active' },
    { pattern: /(?:very active|twice a day|very fit|athlete|intense)/i, level: 'very_active' },
  ]
  
  for (const activityPattern of activityPatterns) {
    if (normalizedInput.match(activityPattern.pattern)) {
      extracted.activityLevel = activityPattern.level as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
      break
    }
  }

  // Extract goals
  const goalKeywords = [
    'lose weight', 'weight loss', 'lose fat', 'fat loss', 'get lean',
    'gain weight', 'weight gain', 'build muscle', 'muscle gain', 'bulk up',
    'maintain weight', 'maintain', 'stay same',
    'get fit', 'fitness', 'get healthy', 'health', 'improve health',
    'tone up', 'toning', 'get stronger', 'strength',
    'endurance', 'stamina', 'energy',
  ]

  const goals: string[] = []
  for (const goalKeyword of goalKeywords) {
    if (normalizedInput.includes(goalKeyword)) {
      if (!goals.some(g => g.toLowerCase().includes(goalKeyword))) {
        goals.push(goalKeyword)
      }
    }
  }

  if (goals.length > 0) {
    extracted.goals = goals
  }

  // Extract dietary restrictions
  const dietaryKeywords = [
    'allergic to',
    'allergy to',
    'allergies to',
    'allergic',
    'allergy',
    'allergies',
    'intolerant to',
    'intolerance to',
    'can\'t eat',
    'cannot eat',
    'don\'t eat',
    'do not eat',
    'avoid',
    'avoiding',
    'vegetarian',
    'vegan',
    'gluten-free',
    'gluten free',
    'dairy-free',
    'dairy free',
    'lactose intolerant',
    'keto',
    'ketogenic',
    'paleo',
    'low carb',
    'low-carb',
  ]

  const commonAllergens = [
    'nuts', 'peanuts', 'tree nuts', 'almonds', 'walnuts', 'cashews',
    'dairy', 'milk', 'cheese', 'lactose',
    'gluten', 'wheat', 'bread',
    'eggs', 'egg',
    'fish', 'salmon', 'tuna', 'seafood',
    'shellfish', 'shrimp', 'crab', 'lobster',
    'soy', 'soybeans', 'soya',
    'sesame', 'sesame seeds',
  ]

  const dietaryRestrictions: string[] = []

  // Look for allergy/restriction patterns
  for (const keyword of dietaryKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i')
    if (normalizedInput.match(regex)) {
      // Extract what follows the keyword
      const afterKeyword = normalizedInput.split(new RegExp(`\\b${keyword}\\b`, 'i'))[1]
      if (afterKeyword) {
        for (const allergen of commonAllergens) {
          if (afterKeyword.includes(allergen)) {
            if (!dietaryRestrictions.includes(allergen)) {
              dietaryRestrictions.push(allergen)
            }
          }
        }
      }
      
      // Also check if the keyword itself is a dietary restriction
      if (['vegetarian', 'vegan', 'gluten-free', 'gluten free', 'dairy-free', 'dairy free', 'keto', 'ketogenic', 'paleo', 'low carb', 'low-carb'].includes(keyword)) {
        if (!dietaryRestrictions.includes(keyword)) {
          dietaryRestrictions.push(keyword)
        }
      }
    }
  }

  if (dietaryRestrictions.length > 0) {
    extracted.dietaryRestrictions = dietaryRestrictions
  }

  return extracted
}

export function mergeExtractedData(currentProfile: UserProfile, extractedData: ExtractedData): UserProfile {
  const updatedProfile = { ...currentProfile }

  if (extractedData.age !== undefined) {
    updatedProfile.age = extractedData.age
  }

  if (extractedData.sex !== undefined) {
    updatedProfile.sex = extractedData.sex
  }

  if (extractedData.height !== undefined) {
    updatedProfile.height = extractedData.height
  }

  if (extractedData.weight !== undefined) {
    updatedProfile.weight = extractedData.weight
  }

  if (extractedData.activityLevel !== undefined) {
    updatedProfile.activityLevel = extractedData.activityLevel
  }

  if (extractedData.goals !== undefined) {
    // Merge goals, avoiding duplicates
    const existingGoals = new Set(updatedProfile.goals.map(g => g.toLowerCase()))
    const newGoals = extractedData.goals.filter(g => !existingGoals.has(g.toLowerCase()))
    updatedProfile.goals = [...updatedProfile.goals, ...newGoals]
  }

  if (extractedData.dietaryRestrictions !== undefined) {
    // Merge dietary restrictions, avoiding duplicates
    const existingRestrictions = new Set(updatedProfile.dietaryRestrictions.map(r => r.toLowerCase()))
    const newRestrictions = extractedData.dietaryRestrictions.filter(r => !existingRestrictions.has(r.toLowerCase()))
    updatedProfile.dietaryRestrictions = [...updatedProfile.dietaryRestrictions, ...newRestrictions]
  }

  return updatedProfile
}