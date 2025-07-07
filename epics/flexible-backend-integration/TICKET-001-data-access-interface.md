# TICKET-001: Create Data Access Interface

**Priority**: High  
**Estimate**: 2-4 hours  
**Dependencies**: None  
**Assignee**: TBD  

## Description
Create the core Data Access Interface (DAI) that all backend implementations must follow. This interface ensures type safety and compatibility across LocalStorage, Supabase, and future backends.

## Acceptance Criteria
- [ ] Create `NutritionDataAccess` interface with all required methods
- [ ] Define TypeScript types for all parameters and return values
- [ ] Add comprehensive JSDoc documentation
- [ ] All methods are strongly typed
- [ ] Interface supports both existing and new AI coaching features

## Files to Create/Modify
- `src/lib/interfaces/NutritionDataAccess.ts` (new)
- Update existing type imports where needed

## Implementation Details

### 1. Create Interface File
```typescript
// src/lib/interfaces/NutritionDataAccess.ts
export interface NutritionDataAccess {
  // Meal Operations
  getTodaysMeals(userId: string): Promise<RecordedMeal[]>
  getMealsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<RecordedMeal[]>
  saveMeal(userId: string, meal: Omit<RecordedMeal, 'id' | 'timestamp'>): Promise<RecordedMeal>
  updateMeal(userId: string, mealId: string, updates: Partial<RecordedMeal>): Promise<RecordedMeal | null>
  deleteMeal(userId: string, mealId: string): Promise<boolean>
  
  // Nutrition Targets
  getNutritionTargets(userId: string): Promise<NutritionTargets | null>
  saveNutritionTargets(userId: string, targets: NutritionTargets): Promise<NutritionTargets>
  
  // AI Nutrition Coaching
  saveNutritionRecommendation(userId: string, recommendation: NutritionRecommendation): Promise<NutritionRecommendation>
  getPendingRecommendations(userId: string): Promise<NutritionRecommendation[]>
  updateRecommendationStatus(userId: string, recommendationId: string, status: 'accepted' | 'rejected'): Promise<boolean>
  
  // Conversation History
  saveCoachingConversation(userId: string, conversation: CoachingConversation): Promise<CoachingConversation>
  getCoachingHistory(userId: string, limit?: number): Promise<CoachingConversation[]>
  
  // Analytics/Summary
  getTodaysNutritionSummary(userId: string): Promise<NutritionSummary>
  getWeeklyNutritionSummary(userId: string): Promise<WeeklyNutritionSummary>
  getNutritionTrends(userId: string, days: number): Promise<NutritionTrend[]>
}
```

### 2. Documentation Requirements
- Each method must have JSDoc with:
  - Purpose description
  - Parameter documentation
  - Return value description
  - Example usage
  - Possible errors/exceptions

### 3. Method Specifications

#### Core Methods (Existing)
- `getTodaysMeals`: Return meals for current day in user's timezone
- `saveMeal`: Create new meal, auto-generate ID and timestamp
- `updateMeal`: Partial updates allowed, return null if meal not found
- `deleteMeal`: Return true if deleted, false if not found

#### New Methods (AI Coaching)
- `saveNutritionRecommendation`: Store AI-generated recommendations
- `getPendingRecommendations`: Get recommendations awaiting user approval
- `updateRecommendationStatus`: Accept/reject recommendations
- `saveCoachingConversation`: Store chat conversations with context
- `getNutritionTrends`: Calculate adherence scores and patterns

## Testing Requirements

### Unit Tests Required
Based on acceptance criteria, create comprehensive tests:

1. **Interface Structure Tests**
   - [ ] Test that interface exports correctly
   - [ ] Test all method signatures are present
   - [ ] Test parameter types match specification
   - [ ] Test return types match specification

2. **TypeScript Compilation Tests**
   - [ ] Test interface compiles without errors
   - [ ] Test interface can be imported in other files
   - [ ] Test interface can be implemented by classes
   - [ ] Test generic type constraints work correctly

3. **Documentation Tests**
   - [ ] Test JSDoc comments exist for all methods
   - [ ] Test parameter documentation is complete
   - [ ] Test return value documentation is complete
   - [ ] Test example usage is provided

4. **Mock Implementation Tests**
   - [ ] Test stub implementation compiles
   - [ ] Test stub can be instantiated
   - [ ] Test all interface methods throw appropriate errors
   - [ ] Test stub follows interface contract

```typescript
// Example test structure
describe('NutritionDataAccess Interface', () => {
  it('should export the interface', () => {
    expect(typeof NutritionDataAccess).toBe('object')
  })

  it('should have all required methods', () => {
    const requiredMethods = [
      'getTodaysMeals',
      'getMealsByDateRange', 
      'saveMeal',
      'updateMeal',
      'deleteMeal',
      'getNutritionTargets',
      'saveNutritionTargets',
      'saveNutritionRecommendation',
      'getPendingRecommendations',
      'updateRecommendationStatus',
      'saveCoachingConversation',
      'getCoachingHistory',
      'getTodaysNutritionSummary',
      'getWeeklyNutritionSummary',
      'getNutritionTrends'
    ]
    
    // Test implementation class has all methods
    requiredMethods.forEach(method => {
      expect(StubBackend.prototype[method]).toBeDefined()
    })
  })

  it('should compile with TypeScript', () => {
    // This test passes if the file compiles without errors
    expect(true).toBe(true)
  })
})
```

### Test Files to Create
- `src/lib/interfaces/__tests__/NutritionDataAccess.test.ts`
- `src/lib/interfaces/__tests__/interface-validation.test.ts`

### Test Coverage Requirements
- 100% coverage of interface structure
- All method signatures validated
- All JSDoc documentation validated
- TypeScript compilation verified

## Notes for Implementation
- Focus on the interface contract, not implementation
- All methods should be async (return Promises)
- Use existing types where possible from current codebase
- Consider error handling patterns (some methods return null vs throw)
- userId should always be the first parameter for consistency

## Stub Implementation for Other Developers
If other tickets need this interface before completion, create a stub:

```typescript
// Temporary stub - replace with real implementation
export class StubBackend implements NutritionDataAccess {
  async getTodaysMeals(userId: string): Promise<RecordedMeal[]> {
    throw new Error('Not implemented - waiting for TICKET-001')
  }
  // ... other methods
}
```

## Definition of Done
- [ ] Interface file created with all methods
- [ ] All methods have proper TypeScript types
- [ ] JSDoc documentation is complete
- [ ] No TypeScript compilation errors
- [ ] Interface can be imported in other files
- [ ] **All tests written and passing (100% coverage)**
- [ ] **Test files created and documented**
- [ ] **TypeScript compilation tests pass**
- [ ] **Interface validation tests pass**
- [ ] Code review approved