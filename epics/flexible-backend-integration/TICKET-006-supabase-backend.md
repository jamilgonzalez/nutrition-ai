# TICKET-006: Supabase Backend Implementation

**Priority**: Medium  
**Estimate**: 6-8 hours  
**Dependencies**: TICKET-001 (Data Access Interface), TICKET-002 (Core Types), TICKET-005 (Supabase Setup)  
**Assignee**: TBD  

## Description
Implement the Supabase backend that follows the `NutritionDataAccess` interface. This provides a scalable database solution with real-time capabilities and proper data relationships.

## Acceptance Criteria
- [ ] All interface methods implemented using Supabase
- [ ] Proper error handling and type safety
- [ ] Efficient queries with minimal database calls
- [ ] Real-time subscriptions for data updates
- [ ] Transaction support for data consistency
- [ ] Proper Clerk authentication integration

## Files to Create/Modify
- `src/lib/backends/SupabaseBackend.ts` (new)
- `src/lib/supabase/queries.ts` (new - query helpers)
- `src/lib/supabase/types.ts` (new - type mappings)

## Implementation Details

### 1. Main Supabase Backend Class
```typescript
// src/lib/backends/SupabaseBackend.ts
import { NutritionDataAccess } from '@/lib/interfaces/NutritionDataAccess'
import { 
  RecordedMeal, 
  NutritionTargets, 
  NutritionRecommendation,
  CoachingConversation,
  NutritionSummary,
  WeeklyNutritionSummary,
  NutritionTrend,
  BackendError
} from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
import { setSupabaseAuth, getCurrentUserId } from '@/lib/supabase/auth'
import { mapMealFromDB, mapMealToDB, mapRecommendationFromDB } from '@/lib/supabase/types'

export class SupabaseBackend implements NutritionDataAccess {
  constructor(private options?: { url?: string; anonKey?: string; serviceRoleKey?: string }) {
    // Options are mainly for testing - production uses environment variables
  }

  private async ensureAuth(): Promise<string> {
    await setSupabaseAuth()
    const userId = getCurrentUserId()
    
    if (!userId) {
      throw new BackendError('User not authenticated', 'AUTH_ERROR', 'ensureAuth')
    }
    
    return userId
  }

  // MEAL OPERATIONS
  async getTodaysMeals(userId: string): Promise<RecordedMeal[]> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data, error } = await supabase
        .from('recorded_meals')
        .select(`
          *,
          meal_sources (*)
        `)
        .eq('user_id', userId)
        .gte('timestamp', today.toISOString())
        .lt('timestamp', tomorrow.toISOString())
        .order('timestamp', { ascending: false })

      if (error) {
        throw new BackendError(`Failed to fetch today's meals: ${error.message}`, 'QUERY_ERROR', 'getTodaysMeals', error)
      }

      return (data || []).map(mapMealFromDB)
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error fetching meals', 'UNKNOWN_ERROR', 'getTodaysMeals', error as Error)
    }
  }

  async getMealsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<RecordedMeal[]> {
    try {
      const { data, error } = await supabase
        .from('recorded_meals')
        .select(`
          *,
          meal_sources (*)
        `)
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: false })

      if (error) {
        throw new BackendError(`Failed to fetch meals by date range: ${error.message}`, 'QUERY_ERROR', 'getMealsByDateRange', error)
      }

      return (data || []).map(mapMealFromDB)
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error fetching meals by date range', 'UNKNOWN_ERROR', 'getMealsByDateRange', error as Error)
    }
  }

  async saveMeal(userId: string, meal: Omit<RecordedMeal, 'id' | 'timestamp'>): Promise<RecordedMeal> {
    try {
      const mealData = mapMealToDB({ ...meal, id: '', timestamp: new Date() }, userId)
      
      // Start a transaction for meal and sources
      const { data: mealResult, error: mealError } = await supabase
        .from('recorded_meals')
        .insert([mealData])
        .select()
        .single()

      if (mealError) {
        throw new BackendError(`Failed to save meal: ${mealError.message}`, 'INSERT_ERROR', 'saveMeal', mealError)
      }

      // Save sources if they exist
      if (meal.fullNutritionData?.sources?.length) {
        const sourcesData = meal.fullNutritionData.sources.map(source => ({
          meal_id: mealResult.id,
          title: source.title,
          url: source.url,
          domain: source.domain,
          snippet: source.snippet,
          relevance: source.relevance,
          source_type: source.type
        }))

        const { error: sourcesError } = await supabase
          .from('meal_sources')
          .insert(sourcesData)

        if (sourcesError) {
          // Log error but don't fail the meal save
          console.error('Failed to save meal sources:', sourcesError)
        }
      }

      // Fetch the complete meal with sources
      const { data: completeMeal, error: fetchError } = await supabase
        .from('recorded_meals')
        .select(`
          *,
          meal_sources (*)
        `)
        .eq('id', mealResult.id)
        .single()

      if (fetchError) {
        throw new BackendError(`Failed to fetch saved meal: ${fetchError.message}`, 'QUERY_ERROR', 'saveMeal', fetchError)
      }

      return mapMealFromDB(completeMeal)
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error saving meal', 'UNKNOWN_ERROR', 'saveMeal', error as Error)
    }
  }

  async updateMeal(userId: string, mealId: string, updates: Partial<RecordedMeal>): Promise<RecordedMeal | null> {
    try {
      const updateData = mapMealToDB(updates as RecordedMeal, userId)
      
      const { data, error } = await supabase
        .from('recorded_meals')
        .update(updateData)
        .eq('id', mealId)
        .eq('user_id', userId)
        .select(`
          *,
          meal_sources (*)
        `)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw new BackendError(`Failed to update meal: ${error.message}`, 'UPDATE_ERROR', 'updateMeal', error)
      }

      return mapMealFromDB(data)
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error updating meal', 'UNKNOWN_ERROR', 'updateMeal', error as Error)
    }
  }

  async deleteMeal(userId: string, mealId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recorded_meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', userId)

      if (error) {
        throw new BackendError(`Failed to delete meal: ${error.message}`, 'DELETE_ERROR', 'deleteMeal', error)
      }

      return true
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error deleting meal', 'UNKNOWN_ERROR', 'deleteMeal', error as Error)
    }
  }

  // NUTRITION TARGETS
  async getNutritionTargets(userId: string): Promise<NutritionTargets | null> {
    try {
      const { data, error } = await supabase
        .from('nutrition_targets')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw new BackendError(`Failed to fetch nutrition targets: ${error.message}`, 'QUERY_ERROR', 'getNutritionTargets', error)
      }

      return {
        id: data.id,
        userId: data.user_id,
        dailyCalories: data.daily_calories,
        targetProtein: data.target_protein,
        targetCarbs: data.target_carbs,
        targetFat: data.target_fat,
        lastAdjustedBy: data.last_adjusted_by as 'user' | 'ai_recommendation',
        adjustmentReason: data.adjustment_reason,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error fetching nutrition targets', 'UNKNOWN_ERROR', 'getNutritionTargets', error as Error)
    }
  }

  async saveNutritionTargets(userId: string, targets: NutritionTargets): Promise<NutritionTargets> {
    try {
      const targetData = {
        user_id: userId,
        daily_calories: targets.dailyCalories,
        target_protein: targets.targetProtein,
        target_carbs: targets.targetCarbs,
        target_fat: targets.targetFat,
        last_adjusted_by: targets.lastAdjustedBy || 'user',
        adjustment_reason: targets.adjustmentReason
      }

      const { data, error } = await supabase
        .from('nutrition_targets')
        .upsert([targetData])
        .select()
        .single()

      if (error) {
        throw new BackendError(`Failed to save nutrition targets: ${error.message}`, 'UPSERT_ERROR', 'saveNutritionTargets', error)
      }

      return {
        id: data.id,
        userId: data.user_id,
        dailyCalories: data.daily_calories,
        targetProtein: data.target_protein,
        targetCarbs: data.target_carbs,
        targetFat: data.target_fat,
        lastAdjustedBy: data.last_adjusted_by as 'user' | 'ai_recommendation',
        adjustmentReason: data.adjustment_reason,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error saving nutrition targets', 'UNKNOWN_ERROR', 'saveNutritionTargets', error as Error)
    }
  }

  // AI COACHING METHODS
  async saveNutritionRecommendation(userId: string, recommendation: NutritionRecommendation): Promise<NutritionRecommendation> {
    try {
      const recData = {
        user_id: userId,
        conversation_id: recommendation.conversationId,
        type: recommendation.type,
        title: recommendation.title,
        description: recommendation.description,
        reasoning: recommendation.reasoning,
        current_targets: recommendation.currentTargets,
        proposed_targets: recommendation.proposedTargets,
        confidence: recommendation.confidence,
        status: recommendation.status,
        sources: recommendation.sources
      }

      const { data, error } = await supabase
        .from('nutrition_recommendations')
        .insert([recData])
        .select()
        .single()

      if (error) {
        throw new BackendError(`Failed to save recommendation: ${error.message}`, 'INSERT_ERROR', 'saveNutritionRecommendation', error)
      }

      return mapRecommendationFromDB(data)
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error saving recommendation', 'UNKNOWN_ERROR', 'saveNutritionRecommendation', error as Error)
    }
  }

  async getPendingRecommendations(userId: string): Promise<NutritionRecommendation[]> {
    try {
      const { data, error } = await supabase
        .from('nutrition_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        throw new BackendError(`Failed to fetch pending recommendations: ${error.message}`, 'QUERY_ERROR', 'getPendingRecommendations', error)
      }

      return (data || []).map(mapRecommendationFromDB)
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error fetching pending recommendations', 'UNKNOWN_ERROR', 'getPendingRecommendations', error as Error)
    }
  }

  async updateRecommendationStatus(userId: string, recommendationId: string, status: 'accepted' | 'rejected'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('nutrition_recommendations')
        .update({ 
          status, 
          responded_at: new Date().toISOString() 
        })
        .eq('id', recommendationId)
        .eq('user_id', userId)

      if (error) {
        throw new BackendError(`Failed to update recommendation status: ${error.message}`, 'UPDATE_ERROR', 'updateRecommendationStatus', error)
      }

      return true
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error updating recommendation status', 'UNKNOWN_ERROR', 'updateRecommendationStatus', error as Error)
    }
  }

  async saveCoachingConversation(userId: string, conversation: CoachingConversation): Promise<CoachingConversation> {
    try {
      const convData = {
        user_id: userId,
        user_message: conversation.userMessage,
        assistant_response: conversation.assistantResponse,
        context: conversation.context,
        sources: conversation.sources,
        response_time_ms: conversation.responseTimeMs,
        model_used: conversation.modelUsed
      }

      const { data, error } = await supabase
        .from('coaching_conversations')
        .insert([convData])
        .select()
        .single()

      if (error) {
        throw new BackendError(`Failed to save conversation: ${error.message}`, 'INSERT_ERROR', 'saveCoachingConversation', error)
      }

      return {
        id: data.id,
        userId: data.user_id,
        userMessage: data.user_message,
        assistantResponse: data.assistant_response,
        context: data.context,
        recommendations: conversation.recommendations,
        sources: data.sources,
        responseTimeMs: data.response_time_ms,
        modelUsed: data.model_used,
        timestamp: new Date(data.created_at)
      }
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error saving conversation', 'UNKNOWN_ERROR', 'saveCoachingConversation', error as Error)
    }
  }

  async getCoachingHistory(userId: string, limit = 10): Promise<CoachingConversation[]> {
    try {
      const { data, error } = await supabase
        .from('coaching_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new BackendError(`Failed to fetch coaching history: ${error.message}`, 'QUERY_ERROR', 'getCoachingHistory', error)
      }

      return (data || []).map(conv => ({
        id: conv.id,
        userId: conv.user_id,
        userMessage: conv.user_message,
        assistantResponse: conv.assistant_response,
        context: conv.context,
        sources: conv.sources,
        responseTimeMs: conv.response_time_ms,
        modelUsed: conv.model_used,
        timestamp: new Date(conv.created_at)
      }))
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error fetching coaching history', 'UNKNOWN_ERROR', 'getCoachingHistory', error as Error)
    }
  }

  // ANALYTICS/SUMMARY
  async getTodaysNutritionSummary(userId: string): Promise<NutritionSummary> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data, error } = await supabase
        .from('recorded_meals')
        .select('calories, protein, carbs, fat')
        .eq('user_id', userId)
        .gte('timestamp', today.toISOString())
        .lt('timestamp', tomorrow.toISOString())

      if (error) {
        throw new BackendError(`Failed to fetch nutrition summary: ${error.message}`, 'QUERY_ERROR', 'getTodaysNutritionSummary', error)
      }

      const summary = (data || []).reduce(
        (acc, meal) => ({
          calories: acc.calories + (meal.calories || 0),
          protein: acc.protein + (meal.protein || 0),
          carbs: acc.carbs + (meal.carbs || 0),
          fat: acc.fat + (meal.fat || 0)
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )

      return summary
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error fetching nutrition summary', 'UNKNOWN_ERROR', 'getTodaysNutritionSummary', error as Error)
    }
  }

  async getWeeklyNutritionSummary(userId: string): Promise<WeeklyNutritionSummary> {
    try {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const { data, error } = await supabase
        .from('recorded_meals')
        .select('calories, protein, carbs, fat, timestamp')
        .eq('user_id', userId)
        .gte('timestamp', weekAgo.toISOString())

      if (error) {
        throw new BackendError(`Failed to fetch weekly summary: ${error.message}`, 'QUERY_ERROR', 'getWeeklyNutritionSummary', error)
      }

      const summary = { calories: 0, protein: 0, carbs: 0, fat: 0 }
      const daysWithMeals = new Set<string>()

      ;(data || []).forEach(meal => {
        summary.calories += meal.calories || 0
        summary.protein += meal.protein || 0
        summary.carbs += meal.carbs || 0
        summary.fat += meal.fat || 0

        const dayKey = new Date(meal.timestamp).toDateString()
        daysWithMeals.add(dayKey)
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
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error fetching weekly summary', 'UNKNOWN_ERROR', 'getWeeklyNutritionSummary', error as Error)
    }
  }

  async getNutritionTrends(userId: string, days: number): Promise<NutritionTrend[]> {
    try {
      // Use the materialized view for better performance
      const { data, error } = await supabase
        .from('nutrition_trends')
        .select('*')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) {
        throw new BackendError(`Failed to fetch nutrition trends: ${error.message}`, 'QUERY_ERROR', 'getNutritionTrends', error)
      }

      return (data || []).map(trend => ({
        date: trend.date,
        calories: trend.total_calories,
        protein: trend.total_protein,
        carbs: trend.total_carbs,
        fat: trend.total_fat,
        adherenceScore: trend.adherence_score || 0,
        mealCount: trend.meal_count
      }))
    } catch (error) {
      if (error instanceof BackendError) throw error
      throw new BackendError('Unexpected error fetching nutrition trends', 'UNKNOWN_ERROR', 'getNutritionTrends', error as Error)
    }
  }
}
```

### 2. Type Mapping Helpers
```typescript
// src/lib/supabase/types.ts
import { RecordedMeal, NutritionRecommendation } from '@/lib/types'

export function mapMealFromDB(dbMeal: any): RecordedMeal {
  return {
    id: dbMeal.id,
    name: dbMeal.name,
    timestamp: new Date(dbMeal.timestamp),
    image: dbMeal.image_url,
    notes: dbMeal.notes,
    nutritionData: dbMeal.calories ? {
      calories: dbMeal.calories,
      protein: dbMeal.protein,
      carbs: dbMeal.carbs,
      fat: dbMeal.fat
    } : undefined,
    fullNutritionData: dbMeal.full_nutrition_data ? {
      ...dbMeal.full_nutrition_data,
      sources: dbMeal.meal_sources?.map((source: any) => ({
        title: source.title,
        url: source.url,
        domain: source.domain,
        snippet: source.snippet,
        relevance: source.relevance,
        type: source.source_type
      }))
    } : undefined
  }
}

export function mapMealToDB(meal: RecordedMeal, userId: string): any {
  return {
    user_id: userId,
    name: meal.name,
    timestamp: meal.timestamp.toISOString(),
    image_url: meal.image,
    notes: meal.notes,
    calories: meal.nutritionData?.calories,
    protein: meal.nutritionData?.protein,
    carbs: meal.nutritionData?.carbs,
    fat: meal.nutritionData?.fat,
    full_nutrition_data: meal.fullNutritionData
  }
}

export function mapRecommendationFromDB(dbRec: any): NutritionRecommendation {
  return {
    id: dbRec.id,
    userId: dbRec.user_id,
    type: dbRec.type,
    title: dbRec.title,
    description: dbRec.description,
    reasoning: dbRec.reasoning,
    currentTargets: dbRec.current_targets,
    proposedTargets: dbRec.proposed_targets,
    confidence: dbRec.confidence,
    status: dbRec.status,
    sources: dbRec.sources,
    createdAt: new Date(dbRec.created_at),
    respondedAt: dbRec.responded_at ? new Date(dbRec.responded_at) : undefined,
    conversationId: dbRec.conversation_id
  }
}
```

## Error Handling Strategy
- Custom `BackendError` class with operation context
- Graceful degradation for non-critical failures
- Proper logging for debugging
- User-friendly error messages

## Performance Optimizations
- Use materialized views for analytics
- Efficient query patterns with proper indexes
- Batch operations where possible
- Connection pooling via Supabase

## Testing Requirements
- Unit tests for all interface methods
- Integration tests with actual Supabase instance
- Error scenario testing
- Performance benchmarks
- Authentication flow testing

## Real-time Features (Future)
```typescript
// Subscribe to meal changes
const subscription = supabase
  .channel('meals')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'recorded_meals' },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe()
```

## Definition of Done
- [ ] All interface methods implemented
- [ ] Error handling comprehensive
- [ ] Type mappings working correctly
- [ ] Authentication integration tested
- [ ] Performance optimized
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Code review approved