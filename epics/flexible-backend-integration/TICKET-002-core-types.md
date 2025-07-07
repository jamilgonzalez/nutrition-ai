# TICKET-002: Define Core Types

**Priority**: High  
**Estimate**: 3-4 hours  
**Dependencies**: None (can work in parallel with TICKET-001)  
**Assignee**: TBD  

## Description
Define all TypeScript types and interfaces needed for the flexible backend system and AI coaching features. This establishes the data contracts that all components will use.

## Acceptance Criteria
- [ ] Update existing types to support new backend architecture
- [ ] Create new types for AI coaching features
- [ ] All types are properly exported and documented
- [ ] Types support both localStorage and Supabase backends
- [ ] Backward compatibility with existing meal data

## Files to Create/Modify
- `src/lib/types/nutrition.ts` (modify existing)
- `src/lib/types/coaching.ts` (new)
- `src/lib/types/backend.ts` (new)

## Implementation Details

### 1. Extend Existing Nutrition Types
```typescript
// src/lib/types/nutrition.ts - extend existing types

// Add sources to existing RecordedMeal interface
export interface RecordedMeal {
  // ... existing fields
  fullNutritionData?: {
    // ... existing fields
    sources?: NutritionSource[] // ADD THIS
  }
}

// Extend NutritionTargets to support coaching
export interface NutritionTargets {
  id?: string // For database backends
  userId: string
  dailyCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  createdAt?: Date
  updatedAt?: Date
  // Coaching metadata
  lastAdjustedBy?: 'user' | 'ai_recommendation'
  adjustmentReason?: string
}

// Add nutrition summary types
export interface NutritionSummary {
  calories: number
  protein: number
  carbs: number
  fat: number
  adherenceScore?: number // 0-100
}

export interface WeeklyNutritionSummary {
  totalCalories: number
  avgCaloriesPerDay: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  avgAdherenceScore: number
  daysLogged: number
}

export interface NutritionTrend {
  date: string // YYYY-MM-DD format
  calories: number
  protein: number
  carbs: number
  fat: number
  adherenceScore: number
  mealCount: number
}

export interface NutritionSource {
  title: string
  url: string
  domain: string
  snippet?: string
  relevance: 'high' | 'medium' | 'low'
  type: 'research' | 'guideline' | 'expert_opinion'
}
```

### 2. Create Coaching Types
```typescript
// src/lib/types/coaching.ts - new file

export interface NutritionRecommendation {
  id: string
  userId: string
  type: 'target_adjustment' | 'meal_suggestion' | 'lifestyle_change'
  title: string
  description: string
  reasoning: string
  
  // Target changes
  currentTargets?: NutritionTargets
  proposedTargets?: NutritionTargets
  
  // Metadata
  confidence: number // 0-100
  status: 'pending' | 'accepted' | 'rejected'
  sources?: NutritionSource[]
  
  // Timestamps
  createdAt: Date
  respondedAt?: Date
  
  // Foreign keys
  conversationId?: string
}

export interface CoachingConversation {
  id: string
  userId: string
  userMessage: string
  assistantResponse: string
  
  // Context at time of conversation
  context: {
    recentMeals: RecordedMeal[]
    currentTargets: NutritionTargets | null
    nutritionSummary: NutritionSummary
    trends?: NutritionTrend[]
  }
  
  // Generated content
  recommendations?: NutritionRecommendation[]
  sources?: NutritionSource[]
  
  // Metadata
  responseTimeMs?: number
  modelUsed?: string
  timestamp: Date
}

// Intent classification types
export type MessageIntent = 'meal_analysis' | 'coaching' | 'general'

export interface IntentClassification {
  intent: MessageIntent
  confidence: number
  reasoning?: string
}

// Coaching response types
export interface CoachingResponse {
  response: string
  needsTargetAdjustment: boolean
  recommendations: NutritionRecommendation[]
  sources: NutritionSource[]
}
```

### 3. Create Backend Types
```typescript
// src/lib/types/backend.ts - new file

export type BackendType = 'localStorage' | 'supabase'

export interface BackendConfig {
  type: BackendType
  options?: {
    // LocalStorage options
    storagePrefix?: string
    maxStorageDays?: number
    
    // Supabase options
    url?: string
    anonKey?: string
    serviceRoleKey?: string
  }
}

// Error types for backend operations
export class BackendError extends Error {
  constructor(
    message: string,
    public code: string,
    public operation: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'BackendError'
  }
}

// Operation result types
export interface OperationResult<T> {
  success: boolean
  data?: T
  error?: BackendError
}

// Migration types
export interface MigrationStatus {
  isComplete: boolean
  totalRecords: number
  migratedRecords: number
  errors: string[]
  startedAt: Date
  completedAt?: Date
}
```

### 4. Update Existing Type Exports
```typescript
// Ensure all types are properly exported
// Update existing imports in components

// Create index file for easy imports
// src/lib/types/index.ts
export * from './nutrition'
export * from './coaching'
export * from './backend'
```

## Type Validation Requirements
- All types should support both database IDs (UUID) and localStorage IDs (string timestamps)
- Dates should be properly typed as Date objects, not strings
- Optional fields should be marked with `?`
- Array types should be properly specified
- Union types should be exhaustive

## Migration Considerations
- New fields should be optional to support existing data
- Default values should be considered for new required fields
- Types should work with JSON serialization/deserialization

## Testing Requirements

### Unit Tests Required
Based on acceptance criteria, create comprehensive tests:

1. **Type Definition Tests**
   - [ ] Test all types export correctly
   - [ ] Test type properties match specifications
   - [ ] Test optional vs required properties
   - [ ] Test type unions and discriminated unions

2. **Zod Schema Validation Tests**
   - [ ] Test schema validates correct data
   - [ ] Test schema rejects invalid data
   - [ ] Test schema error messages are helpful
   - [ ] Test schema handles edge cases (empty, null, undefined)

3. **Data Transformation Tests**
   - [ ] Test serialization to/from JSON
   - [ ] Test type guards work correctly
   - [ ] Test data migrations between versions
   - [ ] Test compatibility with existing data

4. **Integration Tests**
   - [ ] Test types work with NutritionDataAccess interface
   - [ ] Test types compile with all backend implementations
   - [ ] Test types work in React components
   - [ ] Test types work with API endpoints

```typescript
// Example test structure
describe('Core Types', () => {
  describe('NutritionTargets', () => {
    it('should validate correct targets', () => {
      const validTargets = {
        dailyCalories: 2000,
        targetProtein: 150,
        targetCarbs: 200,
        targetFat: 78
      }
      expect(() => nutritionTargetsSchema.parse(validTargets)).not.toThrow()
    })

    it('should reject invalid targets', () => {
      const invalidTargets = {
        dailyCalories: -100,
        targetProtein: 'invalid',
        targetCarbs: null
      }
      expect(() => nutritionTargetsSchema.parse(invalidTargets)).toThrow()
    })
  })

  describe('RecordedMeal', () => {
    it('should handle meal with nutrition data', () => {
      const meal: RecordedMeal = {
        id: 'test-id',
        name: 'Test Meal',
        timestamp: new Date(),
        nutritionData: {
          calories: 500,
          protein: 25,
          carbs: 50,
          fat: 20
        }
      }
      expect(recordedMealSchema.parse(meal)).toEqual(meal)
    })
  })
})
```

### Test Files to Create
- `src/lib/types/__tests__/index.test.ts`
- `src/lib/types/__tests__/zod-schemas.test.ts`
- `src/lib/types/__tests__/type-guards.test.ts`
- `src/lib/types/__tests__/integration.test.ts`

### Test Coverage Requirements
- 100% coverage of all type definitions
- All Zod schemas validated with positive and negative cases
- All type guards tested
- Integration with interface verified

## Notes for Implementation
- Reference existing `src/lib/mealStorage.ts` for current types
- Maintain backward compatibility
- Consider database constraints (e.g., VARCHAR lengths)
- Use branded types for IDs if needed for type safety

## Stub Types for Other Developers
If other tickets need these types before completion:

```typescript
// Temporary types - replace with real implementation
export interface StubNutritionRecommendation {
  id: string
  // Add minimal fields as needed
}
```

## Integration Points
- These types will be used by TICKET-001 (Data Access Interface)
- Backend implementations (TICKET-004, TICKET-006) will implement these types
- React components will consume these types via the hook (TICKET-007)

## Definition of Done
- [ ] All types are defined and documented
- [ ] Types support both localStorage and Supabase backends
- [ ] Backward compatibility with existing data
- [ ] All types are properly exported
- [ ] No TypeScript compilation errors
- [ ] Types work with JSON serialization
- [ ] **All tests written and passing (100% coverage)**
- [ ] **Type validation tests pass**
- [ ] **Zod schema tests pass**
- [ ] **Integration tests with interface pass**
- [ ] **Backward compatibility tests pass**
- [ ] Code review approved