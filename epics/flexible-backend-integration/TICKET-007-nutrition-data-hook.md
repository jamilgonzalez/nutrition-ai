# TICKET-007: useNutritionData Hook

**Priority**: High  
**Estimate**: 4-6 hours  
**Dependencies**: TICKET-001 (Data Access Interface), TICKET-003 (Backend Factory)  
**Assignee**: TBD  

## Description
Create a React hook that provides a clean, type-safe interface for all nutrition data operations. This hook abstracts the backend complexity and provides optimistic updates, caching, and error handling for the UI components.

## Acceptance Criteria
- [ ] Hook provides all nutrition data operations
- [ ] Optimistic updates for better UX
- [ ] Loading states and error handling
- [ ] Automatic data refresh capabilities
- [ ] Type-safe operations throughout
- [ ] Real-time data synchronization
- [ ] Cache management for performance

## Files to Create/Modify
- `src/hooks/useNutritionData.ts` (new)
- `src/lib/utils/optimisticUpdates.ts` (new)
- `src/contexts/NutritionContext.tsx` (new - optional for global state)

## Implementation Details

### 1. Core Hook Implementation
```typescript
// src/hooks/useNutritionData.ts
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { getCurrentBackend } from '@/lib/BackendFactory'
import { 
  RecordedMeal, 
  NutritionTargets, 
  NutritionRecommendation,
  CoachingConversation,
  NutritionSummary,
  BackendError 
} from '@/lib/types'

interface UseNutritionDataReturn {
  // Data
  todaysMeals: RecordedMeal[]
  nutritionTargets: NutritionTargets | null
  pendingRecommendations: NutritionRecommendation[]
  todaysSummary: NutritionSummary
  
  // Loading states
  isLoading: boolean
  isSavingMeal: boolean
  isUpdatingTargets: boolean
  
  // Error states
  error: BackendError | null
  
  // Meal operations
  saveMeal: (meal: Omit<RecordedMeal, 'id' | 'timestamp'>) => Promise<RecordedMeal>
  updateMeal: (mealId: string, updates: Partial<RecordedMeal>) => Promise<void>
  deleteMeal: (mealId: string) => Promise<void>
  
  // Target operations
  updateNutritionTargets: (targets: NutritionTargets) => Promise<void>
  
  // Recommendation operations
  acceptRecommendation: (recommendationId: string) => Promise<void>
  rejectRecommendation: (recommendationId: string) => Promise<void>
  
  // Utility functions
  refreshData: () => Promise<void>
  clearError: () => void
}

export function useNutritionData(): UseNutritionDataReturn {
  const { user } = useUser()
  const backend = useMemo(() => getCurrentBackend(), [])
  
  // Data state
  const [todaysMeals, setTodaysMeals] = useState<RecordedMeal[]>([])
  const [nutritionTargets, setNutritionTargets] = useState<NutritionTargets | null>(null)
  const [pendingRecommendations, setPendingRecommendations] = useState<NutritionRecommendation[]>([])
  const [todaysSummary, setTodaysSummary] = useState<NutritionSummary>({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingMeal, setIsSavingMeal] = useState(false)
  const [isUpdatingTargets, setIsUpdatingTargets] = useState(false)
  
  // Error state
  const [error, setError] = useState<BackendError | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Initial data loading
  const loadInitialData = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      setError(null)

      const [meals, targets, recommendations, summary] = await Promise.all([
        backend.getTodaysMeals(user.id),
        backend.getNutritionTargets(user.id),
        backend.getPendingRecommendations(user.id),
        backend.getTodaysNutritionSummary(user.id)
      ])

      setTodaysMeals(meals)
      setNutritionTargets(targets)
      setPendingRecommendations(recommendations)
      setTodaysSummary(summary)
    } catch (err) {
      setError(err as BackendError)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, backend])

  // Refresh data function
  const refreshData = useCallback(async () => {
    await loadInitialData()
  }, [loadInitialData])

  // Load data on mount and user change
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // Meal operations with optimistic updates
  const saveMeal = useCallback(async (meal: Omit<RecordedMeal, 'id' | 'timestamp'>): Promise<RecordedMeal> => {
    if (!user?.id) throw new Error('User not authenticated')

    setIsSavingMeal(true)
    setError(null)

    // Optimistic update
    const optimisticMeal: RecordedMeal = {
      ...meal,
      id: `temp_${Date.now()}`,
      timestamp: new Date()
    }
    
    setTodaysMeals(prev => [optimisticMeal, ...prev])
    
    // Update summary optimistically
    if (meal.nutritionData) {
      setTodaysSummary(prev => ({
        calories: prev.calories + meal.nutritionData!.calories,
        protein: prev.protein + meal.nutritionData!.protein,
        carbs: prev.carbs + meal.nutritionData!.carbs,
        fat: prev.fat + meal.nutritionData!.fat
      }))
    }

    try {
      const savedMeal = await backend.saveMeal(user.id, meal)
      
      // Replace optimistic update with real data
      setTodaysMeals(prev => prev.map(m => 
        m.id === optimisticMeal.id ? savedMeal : m
      ))
      
      return savedMeal
    } catch (err) {
      // Revert optimistic update
      setTodaysMeals(prev => prev.filter(m => m.id !== optimisticMeal.id))
      
      if (meal.nutritionData) {
        setTodaysSummary(prev => ({
          calories: prev.calories - meal.nutritionData!.calories,
          protein: prev.protein - meal.nutritionData!.protein,
          carbs: prev.carbs - meal.nutritionData!.carbs,
          fat: prev.fat - meal.nutritionData!.fat
        }))
      }
      
      setError(err as BackendError)
      throw err
    } finally {
      setIsSavingMeal(false)
    }
  }, [user?.id, backend])

  const updateMeal = useCallback(async (mealId: string, updates: Partial<RecordedMeal>) => {
    if (!user?.id) throw new Error('User not authenticated')

    setError(null)

    // Optimistic update
    const originalMeal = todaysMeals.find(m => m.id === mealId)
    if (!originalMeal) return

    const updatedMeal = { ...originalMeal, ...updates }
    setTodaysMeals(prev => prev.map(m => m.id === mealId ? updatedMeal : m))

    try {
      const result = await backend.updateMeal(user.id, mealId, updates)
      if (result) {
        setTodaysMeals(prev => prev.map(m => m.id === mealId ? result : m))
      }
      
      // Refresh summary after update
      const summary = await backend.getTodaysNutritionSummary(user.id)
      setTodaysSummary(summary)
    } catch (err) {
      // Revert optimistic update
      setTodaysMeals(prev => prev.map(m => m.id === mealId ? originalMeal : m))
      setError(err as BackendError)
      throw err
    }
  }, [user?.id, backend, todaysMeals])

  const deleteMeal = useCallback(async (mealId: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    setError(null)

    // Optimistic update
    const mealToDelete = todaysMeals.find(m => m.id === mealId)
    if (!mealToDelete) return

    setTodaysMeals(prev => prev.filter(m => m.id !== mealId))
    
    // Update summary optimistically
    if (mealToDelete.nutritionData) {
      setTodaysSummary(prev => ({
        calories: prev.calories - mealToDelete.nutritionData!.calories,
        protein: prev.protein - mealToDelete.nutritionData!.protein,
        carbs: prev.carbs - mealToDelete.nutritionData!.carbs,
        fat: prev.fat - mealToDelete.nutritionData!.fat
      }))
    }

    try {
      const success = await backend.deleteMeal(user.id, mealId)
      if (!success) {
        throw new Error('Failed to delete meal')
      }
    } catch (err) {
      // Revert optimistic update
      setTodaysMeals(prev => [...prev, mealToDelete].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ))
      
      if (mealToDelete.nutritionData) {
        setTodaysSummary(prev => ({
          calories: prev.calories + mealToDelete.nutritionData!.calories,
          protein: prev.protein + mealToDelete.nutritionData!.protein,
          carbs: prev.carbs + mealToDelete.nutritionData!.carbs,
          fat: prev.fat + mealToDelete.nutritionData!.fat
        }))
      }
      
      setError(err as BackendError)
      throw err
    }
  }, [user?.id, backend, todaysMeals])

  // Target operations
  const updateNutritionTargets = useCallback(async (targets: NutritionTargets) => {
    if (!user?.id) throw new Error('User not authenticated')

    setIsUpdatingTargets(true)
    setError(null)

    // Optimistic update
    const previousTargets = nutritionTargets
    setNutritionTargets(targets)

    try {
      const updatedTargets = await backend.saveNutritionTargets(user.id, targets)
      setNutritionTargets(updatedTargets)
    } catch (err) {
      // Revert optimistic update
      setNutritionTargets(previousTargets)
      setError(err as BackendError)
      throw err
    } finally {
      setIsUpdatingTargets(false)
    }
  }, [user?.id, backend, nutritionTargets])

  // Recommendation operations
  const acceptRecommendation = useCallback(async (recommendationId: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    setError(null)

    // Find the recommendation
    const recommendation = pendingRecommendations.find(r => r.id === recommendationId)
    if (!recommendation) return

    // Optimistic update - remove from pending
    setPendingRecommendations(prev => prev.filter(r => r.id !== recommendationId))

    try {
      await backend.updateRecommendationStatus(user.id, recommendationId, 'accepted')
      
      // If it's a target adjustment, update the targets
      if (recommendation.type === 'target_adjustment' && recommendation.proposedTargets) {
        await updateNutritionTargets({
          ...recommendation.proposedTargets,
          lastAdjustedBy: 'ai_recommendation',
          adjustmentReason: recommendation.title
        })
      }
    } catch (err) {
      // Revert optimistic update
      setPendingRecommendations(prev => [...prev, recommendation])
      setError(err as BackendError)
      throw err
    }
  }, [user?.id, backend, pendingRecommendations, updateNutritionTargets])

  const rejectRecommendation = useCallback(async (recommendationId: string) => {
    if (!user?.id) throw new Error('User not authenticated')

    setError(null)

    // Optimistic update
    const recommendation = pendingRecommendations.find(r => r.id === recommendationId)
    if (!recommendation) return

    setPendingRecommendations(prev => prev.filter(r => r.id !== recommendationId))

    try {
      await backend.updateRecommendationStatus(user.id, recommendationId, 'rejected')
    } catch (err) {
      // Revert optimistic update
      setPendingRecommendations(prev => [...prev, recommendation])
      setError(err as BackendError)
      throw err
    }
  }, [user?.id, backend, pendingRecommendations])

  // Listen for external data changes (like from chat)
  useEffect(() => {
    const handleMealSaved = () => {
      refreshData()
    }

    const handleNewRecommendations = () => {
      // Refresh recommendations
      if (user?.id) {
        backend.getPendingRecommendations(user.id).then(setPendingRecommendations)
      }
    }

    window.addEventListener('mealSaved', handleMealSaved)
    window.addEventListener('newRecommendations', handleNewRecommendations)

    return () => {
      window.removeEventListener('mealSaved', handleMealSaved)
      window.removeEventListener('newRecommendations', handleNewRecommendations)
    }
  }, [refreshData, user?.id, backend])

  return {
    // Data
    todaysMeals,
    nutritionTargets,
    pendingRecommendations,
    todaysSummary,
    
    // Loading states
    isLoading,
    isSavingMeal,
    isUpdatingTargets,
    
    // Error state
    error,
    
    // Operations
    saveMeal,
    updateMeal,
    deleteMeal,
    updateNutritionTargets,
    acceptRecommendation,
    rejectRecommendation,
    
    // Utilities
    refreshData,
    clearError
  }
}
```

### 2. Optimistic Updates Utility
```typescript
// src/lib/utils/optimisticUpdates.ts
export interface OptimisticUpdate<T> {
  id: string
  type: 'create' | 'update' | 'delete'
  data: T
  originalData?: T
  timestamp: number
}

export class OptimisticUpdateManager<T> {
  private updates = new Map<string, OptimisticUpdate<T>>()

  addUpdate(update: OptimisticUpdate<T>): void {
    this.updates.set(update.id, update)
  }

  removeUpdate(id: string): void {
    this.updates.delete(id)
  }

  getUpdate(id: string): OptimisticUpdate<T> | undefined {
    return this.updates.get(id)
  }

  applyUpdates(items: T[], getId: (item: T) => string): T[] {
    let result = [...items]

    for (const update of this.updates.values()) {
      switch (update.type) {
        case 'create':
          result = [update.data, ...result]
          break
        case 'update':
          result = result.map(item => 
            getId(item) === update.id ? update.data : item
          )
          break
        case 'delete':
          result = result.filter(item => getId(item) !== update.id)
          break
      }
    }

    return result
  }

  revertUpdate(id: string, items: T[], getId: (item: T) => string): T[] {
    const update = this.updates.get(id)
    if (!update) return items

    this.removeUpdate(id)

    switch (update.type) {
      case 'create':
        return items.filter(item => getId(item) !== id)
      case 'update':
        if (update.originalData) {
          return items.map(item => 
            getId(item) === id ? update.originalData! : item
          )
        }
        return items
      case 'delete':
        if (update.originalData) {
          return [...items, update.originalData]
        }
        return items
      default:
        return items
    }
  }

  clear(): void {
    this.updates.clear()
  }
}
```

### 3. Context Provider (Optional)
```typescript
// src/contexts/NutritionContext.tsx (optional for global state)
import React, { createContext, useContext, ReactNode } from 'react'
import { useNutritionData, UseNutritionDataReturn } from '@/hooks/useNutritionData'

const NutritionContext = createContext<UseNutritionDataReturn | undefined>(undefined)

export function NutritionProvider({ children }: { children: ReactNode }) {
  const nutritionData = useNutritionData()

  return (
    <NutritionContext.Provider value={nutritionData}>
      {children}
    </NutritionContext.Provider>
  )
}

export function useNutritionContext() {
  const context = useContext(NutritionContext)
  if (context === undefined) {
    throw new Error('useNutritionContext must be used within a NutritionProvider')
  }
  return context
}
```

## Performance Optimizations
- Memoized backend instance
- Debounced API calls for rapid updates
- Efficient state updates with useCallback
- Selective re-renders with useMemo

## Error Handling
- Optimistic updates with automatic rollback
- User-friendly error messages
- Retry mechanisms for failed operations
- Graceful degradation for offline scenarios

## Testing Requirements
- Unit tests for all hook functions
- Test optimistic updates and rollbacks
- Mock backend implementations for testing
- Error scenario testing
- Performance testing for large datasets

## Integration Notes
- This hook will replace direct backend calls in components
- TICKET-008 will migrate components to use this hook
- Provides foundation for real-time features

## Cache Strategy
- In-memory caching for current session
- Automatic cache invalidation on updates
- Smart refresh triggers based on user actions

## Definition of Done
- [ ] Hook provides all required operations
- [ ] Optimistic updates working correctly
- [ ] Error handling comprehensive
- [ ] Loading states managed properly
- [ ] Type safety maintained throughout
- [ ] Performance optimized
- [ ] Unit tests passing
- [ ] Code review approved