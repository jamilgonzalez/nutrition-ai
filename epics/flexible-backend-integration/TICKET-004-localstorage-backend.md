# TICKET-004: LocalStorage Backend Migration

**Priority**: High  
**Estimate**: 4-6 hours  
**Dependencies**: TICKET-001 (Data Access Interface), TICKET-002 (Core Types)  
**Assignee**: TBD  

## Description
Migrate the existing localStorage-based meal storage system to implement the new `NutritionDataAccess` interface. This maintains backward compatibility while preparing for the flexible backend architecture.

## Acceptance Criteria
- [ ] Existing localStorage functionality preserved
- [ ] All interface methods implemented
- [ ] Backward compatibility with existing meal data
- [ ] New AI coaching methods implemented (with localStorage storage)
- [ ] No data loss during migration
- [ ] Performance maintained or improved

## Files to Create/Modify
- `src/lib/backends/LocalStorageBackend.ts` (new)
- Update `src/lib/mealStorage.ts` to use new backend (gradual migration)
- Migration utility for existing data format

## Implementation Details

### 1. Create LocalStorage Backend Class
```typescript
// src/lib/backends/LocalStorageBackend.ts
import { NutritionDataAccess } from '@/lib/interfaces/NutritionDataAccess'
import { 
  RecordedMeal, 
  NutritionTargets, 
  NutritionRecommendation,
  CoachingConversation,
  NutritionSummary,
  WeeklyNutritionSummary,
  NutritionTrend 
} from '@/lib/types'

export class LocalStorageBackend implements NutritionDataAccess {
  private readonly storageKeys = {
    meals: 'recorded_meals',
    targets: 'nutrition_targets',
    recommendations: 'nutrition_recommendations',
    conversations: 'coaching_conversations'
  }

  constructor(private options?: { storagePrefix?: string; maxStorageDays?: number }) {
    // Apply prefix to storage keys if provided
    if (options?.storagePrefix) {
      Object.keys(this.storageKeys).forEach(key => {
        this.storageKeys[key] = `${options.storagePrefix}${this.storageKeys[key]}`
      })
    }
  }

  // MEAL OPERATIONS (migrate existing functionality)
  async getTodaysMeals(userId: string): Promise<RecordedMeal[]> {
    const meals = this.getAllMeals()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return meals.filter(meal => {
      const mealDate = new Date(meal.timestamp)
      mealDate.setHours(0, 0, 0, 0)
      return mealDate.getTime() === today.getTime()
    })
  }

  async getMealsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<RecordedMeal[]> {
    const meals = this.getAllMeals()
    return meals.filter(meal => {
      const mealDate = new Date(meal.timestamp)
      return mealDate >= startDate && mealDate <= endDate
    })
  }

  async saveMeal(userId: string, meal: Omit<RecordedMeal, 'id' | 'timestamp'>): Promise<RecordedMeal> {
    const newMeal: RecordedMeal = {
      ...meal,
      id: Date.now().toString(),
      timestamp: new Date()
    }

    const meals = this.getAllMeals()
    meals.push(newMeal)
    
    // Cleanup old meals
    this.cleanupOldMeals(meals)
    this.saveMeals(meals)
    
    return newMeal
  }

  async updateMeal(userId: string, mealId: string, updates: Partial<RecordedMeal>): Promise<RecordedMeal | null> {
    const meals = this.getAllMeals()
    const mealIndex = meals.findIndex(meal => meal.id === mealId)
    
    if (mealIndex === -1) return null
    
    const updatedMeal = { ...meals[mealIndex], ...updates }
    meals[mealIndex] = updatedMeal
    this.saveMeals(meals)
    
    return updatedMeal
  }

  async deleteMeal(userId: string, mealId: string): Promise<boolean> {
    const meals = this.getAllMeals()
    const filteredMeals = meals.filter(meal => meal.id !== mealId)
    
    if (filteredMeals.length === meals.length) return false
    
    this.saveMeals(filteredMeals)
    return true
  }

  // NUTRITION TARGETS
  async getNutritionTargets(userId: string): Promise<NutritionTargets | null> {
    try {
      const stored = localStorage.getItem(this.storageKeys.targets)
      if (!stored) return null
      
      const targets = JSON.parse(stored)
      return {
        ...targets,
        createdAt: targets.createdAt ? new Date(targets.createdAt) : undefined,
        updatedAt: targets.updatedAt ? new Date(targets.updatedAt) : undefined
      }
    } catch (error) {
      console.error('Error loading nutrition targets:', error)
      return null
    }
  }

  async saveNutritionTargets(userId: string, targets: NutritionTargets): Promise<NutritionTargets> {
    const targetsToSave = {
      ...targets,
      userId,
      updatedAt: new Date()
    }

    localStorage.setItem(this.storageKeys.targets, JSON.stringify(targetsToSave))
    return targetsToSave
  }

  // AI COACHING METHODS (new functionality)
  async saveNutritionRecommendation(userId: string, recommendation: NutritionRecommendation): Promise<NutritionRecommendation> {
    const recommendations = this.getAllRecommendations()
    const newRecommendation = {
      ...recommendation,
      id: Date.now().toString(),
      userId,
      createdAt: new Date()
    }
    
    recommendations.push(newRecommendation)
    this.saveRecommendations(recommendations)
    
    return newRecommendation
  }

  async getPendingRecommendations(userId: string): Promise<NutritionRecommendation[]> {
    const recommendations = this.getAllRecommendations()
    return recommendations
      .filter(rec => rec.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  async updateRecommendationStatus(userId: string, recommendationId: string, status: 'accepted' | 'rejected'): Promise<boolean> {
    const recommendations = this.getAllRecommendations()
    const recIndex = recommendations.findIndex(rec => rec.id === recommendationId)
    
    if (recIndex === -1) return false
    
    recommendations[recIndex] = {
      ...recommendations[recIndex],
      status,
      respondedAt: new Date()
    }
    
    this.saveRecommendations(recommendations)
    return true
  }

  async saveCoachingConversation(userId: string, conversation: CoachingConversation): Promise<CoachingConversation> {
    const conversations = this.getAllConversations()
    const newConversation = {
      ...conversation,
      id: Date.now().toString(),
      userId,
      timestamp: new Date()
    }
    
    conversations.push(newConversation)
    
    // Keep only last 50 conversations to prevent storage bloat
    if (conversations.length > 50) {
      conversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      conversations.splice(50)
    }
    
    this.saveConversations(conversations)
    return newConversation
  }

  async getCoachingHistory(userId: string, limit = 10): Promise<CoachingConversation[]> {
    const conversations = this.getAllConversations()
    return conversations
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  // ANALYTICS/SUMMARY
  async getTodaysNutritionSummary(userId: string): Promise<NutritionSummary> {
    const todaysMeals = await this.getTodaysMeals(userId)
    
    return todaysMeals.reduce(
      (summary, meal) => {
        if (meal.nutritionData) {
          summary.calories += meal.nutritionData.calories
          summary.protein += meal.nutritionData.protein
          summary.carbs += meal.nutritionData.carbs
          summary.fat += meal.nutritionData.fat
        }
        return summary
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  async getWeeklyNutritionSummary(userId: string): Promise<WeeklyNutritionSummary> {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const weekMeals = await this.getMealsByDateRange(userId, weekAgo, new Date())
    const summary = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    let daysWithMeals = new Set<string>()
    
    weekMeals.forEach(meal => {
      if (meal.nutritionData) {
        summary.calories += meal.nutritionData.calories
        summary.protein += meal.nutritionData.protein
        summary.carbs += meal.nutritionData.carbs
        summary.fat += meal.nutritionData.fat
        
        const dayKey = new Date(meal.timestamp).toDateString()
        daysWithMeals.add(dayKey)
      }
    })
    
    const daysLogged = daysWithMeals.size
    
    return {
      totalCalories: summary.calories,
      avgCaloriesPerDay: daysLogged > 0 ? summary.calories / daysLogged : 0,
      totalProtein: summary.protein,
      totalCarbs: summary.carbs,
      totalFat: summary.fat,
      avgAdherenceScore: 0, // TODO: Calculate based on targets
      daysLogged
    }
  }

  async getNutritionTrends(userId: string, days: number): Promise<NutritionTrend[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const meals = await this.getMealsByDateRange(userId, startDate, new Date())
    const dailyData = new Map<string, { calories: number; protein: number; carbs: number; fat: number; count: number }>()
    
    meals.forEach(meal => {
      if (meal.nutritionData) {
        const dateKey = new Date(meal.timestamp).toISOString().split('T')[0]
        const existing = dailyData.get(dateKey) || { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
        
        dailyData.set(dateKey, {
          calories: existing.calories + meal.nutritionData.calories,
          protein: existing.protein + meal.nutritionData.protein,
          carbs: existing.carbs + meal.nutritionData.carbs,
          fat: existing.fat + meal.nutritionData.fat,
          count: existing.count + 1
        })
      }
    })
    
    return Array.from(dailyData.entries()).map(([date, data]) => ({
      date,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      adherenceScore: 0, // TODO: Calculate based on targets
      mealCount: data.count
    }))
  }

  // PRIVATE HELPER METHODS
  private getAllMeals(): RecordedMeal[] {
    try {
      const stored = localStorage.getItem(this.storageKeys.meals)
      if (!stored) return []
      
      return JSON.parse(stored).map(meal => ({
        ...meal,
        timestamp: new Date(meal.timestamp)
      }))
    } catch (error) {
      console.error('Error loading meals:', error)
      return []
    }
  }

  private saveMeals(meals: RecordedMeal[]): void {
    localStorage.setItem(this.storageKeys.meals, JSON.stringify(meals))
  }

  private getAllRecommendations(): NutritionRecommendation[] {
    try {
      const stored = localStorage.getItem(this.storageKeys.recommendations)
      if (!stored) return []
      
      return JSON.parse(stored).map(rec => ({
        ...rec,
        createdAt: new Date(rec.createdAt),
        respondedAt: rec.respondedAt ? new Date(rec.respondedAt) : undefined
      }))
    } catch (error) {
      console.error('Error loading recommendations:', error)
      return []
    }
  }

  private saveRecommendations(recommendations: NutritionRecommendation[]): void {
    localStorage.setItem(this.storageKeys.recommendations, JSON.stringify(recommendations))
  }

  private getAllConversations(): CoachingConversation[] {
    try {
      const stored = localStorage.getItem(this.storageKeys.conversations)
      if (!stored) return []
      
      return JSON.parse(stored).map(conv => ({
        ...conv,
        timestamp: new Date(conv.timestamp)
      }))
    } catch (error) {
      console.error('Error loading conversations:', error)
      return []
    }
  }

  private saveConversations(conversations: CoachingConversation[]): void {
    localStorage.setItem(this.storageKeys.conversations, JSON.stringify(conversations))
  }

  private cleanupOldMeals(meals: RecordedMeal[]): void {
    const maxDays = this.options?.maxStorageDays || 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - maxDays)
    
    const filteredMeals = meals.filter(meal => new Date(meal.timestamp) > cutoffDate)
    if (filteredMeals.length !== meals.length) {
      console.log(`Cleaned up ${meals.length - filteredMeals.length} old meals`)
      meals.splice(0, meals.length, ...filteredMeals)
    }
  }
}
```

## Migration Strategy
1. **Phase 1**: Create new backend alongside existing code
2. **Phase 2**: Update components to use hook (TICKET-008)
3. **Phase 3**: Remove old direct localStorage calls

## Data Compatibility
- Existing meal data format should work without changes
- New fields (like sources) are optional
- Handle missing fields gracefully
- Provide sensible defaults

## Testing Requirements
- Test all interface methods
- Verify existing data compatibility
- Test error handling for corrupted localStorage
- Performance tests for large datasets
- Browser compatibility tests

## Error Handling
- Graceful degradation when localStorage is full
- Handle JSON parsing errors
- Provide fallbacks for missing data
- Log errors appropriately

## Performance Considerations
- Lazy loading for large datasets
- Efficient date filtering
- Minimal localStorage read/writes
- Memory management for large meal histories

## Definition of Done
- [ ] All interface methods implemented
- [ ] Existing functionality preserved
- [ ] New AI coaching methods work
- [ ] No data loss during migration
- [ ] Performance tests pass
- [ ] Error handling tested
- [ ] Code review approved