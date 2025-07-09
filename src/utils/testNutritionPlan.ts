import DatabaseStub from '@/lib/database'

// Utility function to test nutrition plan persistence
export async function testNutritionPlanPersistence(userId: string) {
  try {
    console.log('=== Testing Nutrition Plan Persistence ===')
    
    // Test saving nutrition targets
    const testTargets = {
      dailyCalories: 2200,
      targetProtein: 165,
      targetCarbs: 275,
      targetFat: 73,
    }
    
    console.log('Saving test nutrition targets:', testTargets)
    await DatabaseStub.saveNutritionTargets(userId, testTargets)
    
    // Test loading nutrition targets
    console.log('Loading nutrition targets...')
    const loadedTargets = await DatabaseStub.getNutritionTargets(userId)
    
    console.log('Loaded nutrition targets:', loadedTargets)
    
    // Test user profile with nutrition data
    const testProfile = {
      name: 'Test User',
      age: 25,
      sex: 'male' as const,
      height: 72,
      weight: 180,
      activityLevel: 'moderately_active' as const,
      goals: ['Build muscle', 'Maintain weight'],
      healthConditions: [],
      dietaryRestrictions: [],
      dailyCalories: 2200,
      targetProtein: 165,
      targetCarbs: 275,
      targetFat: 73,
    }
    
    console.log('Saving test user profile:', testProfile)
    await DatabaseStub.saveUserProfile(userId, testProfile)
    
    console.log('Loading user profile...')
    const loadedProfile = await DatabaseStub.getUserProfile(userId)
    
    console.log('Loaded user profile:', loadedProfile)
    
    console.log('=== Test Complete ===')
    
    return {
      success: true,
      targets: loadedTargets,
      profile: loadedProfile
    }
  } catch (error) {
    console.error('Error testing nutrition plan persistence:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}