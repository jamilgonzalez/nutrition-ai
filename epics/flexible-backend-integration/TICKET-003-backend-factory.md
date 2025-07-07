# TICKET-003: Backend Factory

**Priority**: High  
**Estimate**: 2-3 hours  
**Dependencies**: TICKET-001 (Data Access Interface), TICKET-002 (Core Types)  
**Assignee**: TBD  

## Description
Create a factory pattern that instantiates the correct backend implementation based on environment configuration. This enables one-line backend switching and provides a clean abstraction layer.

## Acceptance Criteria
- [ ] Factory creates backend instances based on environment variables
- [ ] Type-safe backend instantiation
- [ ] Graceful fallback to localStorage if Supabase fails
- [ ] Configuration validation
- [ ] Error handling for invalid backend types
- [ ] Support for future backend additions

## Files to Create/Modify
- `src/lib/BackendFactory.ts` (new)
- `src/lib/config/backend.ts` (new)
- Update environment variable types

## Implementation Details

### 1. Create Configuration Handler
```typescript
// src/lib/config/backend.ts
import { BackendType, BackendConfig } from '@/lib/types/backend'

export const getBackendConfig = (): BackendConfig => {
  const backendType = (process.env.NEXT_PUBLIC_BACKEND_TYPE as BackendType) || 'localStorage'
  
  // Validate backend type
  if (!['localStorage', 'supabase'].includes(backendType)) {
    console.warn(`Invalid backend type: ${backendType}, falling back to localStorage`)
    return { type: 'localStorage' }
  }
  
  const config: BackendConfig = {
    type: backendType,
    options: {}
  }
  
  // Add type-specific configuration
  if (backendType === 'supabase') {
    config.options = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    }
    
    // Validate required Supabase environment variables
    if (!config.options.url || !config.options.anonKey) {
      console.error('Missing Supabase configuration, falling back to localStorage')
      return { type: 'localStorage' }
    }
  }
  
  if (backendType === 'localStorage') {
    config.options = {
      storagePrefix: 'nutrition_app_',
      maxStorageDays: 30
    }
  }
  
  return config
}

// Current backend type for easy access
export const CURRENT_BACKEND_TYPE = getBackendConfig().type
```

### 2. Create Backend Factory
```typescript
// src/lib/BackendFactory.ts
import { NutritionDataAccess } from '@/lib/interfaces/NutritionDataAccess'
import { BackendType, BackendConfig } from '@/lib/types/backend'
import { getBackendConfig } from '@/lib/config/backend'

// Import backend implementations (these will be created in other tickets)
import { LocalStorageBackend } from '@/lib/backends/LocalStorageBackend'
// import { SupabaseBackend } from '@/lib/backends/SupabaseBackend' // TICKET-006

export class BackendFactory {
  private static instance: NutritionDataAccess | null = null
  private static currentConfig: BackendConfig | null = null

  /**
   * Get the configured backend instance (singleton pattern)
   * @returns The active backend implementation
   */
  static getInstance(): NutritionDataAccess {
    const config = getBackendConfig()
    
    // Return existing instance if configuration hasn't changed
    if (this.instance && this.currentConfig?.type === config.type) {
      return this.instance
    }
    
    // Create new instance
    this.instance = this.createBackend(config)
    this.currentConfig = config
    
    return this.instance
  }

  /**
   * Create a new backend instance (mainly for testing)
   * @param type Backend type to create
   * @returns New backend instance
   */
  static create(type: BackendType): NutritionDataAccess {
    const config: BackendConfig = { type }
    return this.createBackend(config)
  }

  /**
   * Force recreation of backend instance (useful for config changes)
   */
  static reset(): void {
    this.instance = null
    this.currentConfig = null
  }

  private static createBackend(config: BackendConfig): NutritionDataAccess {
    try {
      switch (config.type) {
        case 'localStorage':
          return new LocalStorageBackend(config.options)
          
        case 'supabase':
          // TODO: Uncomment when TICKET-006 is complete
          // return new SupabaseBackend(config.options)
          
          // Temporary fallback until Supabase backend is implemented
          console.warn('Supabase backend not yet implemented, falling back to localStorage')
          return new LocalStorageBackend(config.options)
          
        default:
          throw new Error(`Unsupported backend type: ${config.type}`)
      }
    } catch (error) {
      console.error(`Failed to create ${config.type} backend:`, error)
      
      // Fallback to localStorage on any error
      console.warn('Falling back to localStorage backend')
      return new LocalStorageBackend({ storagePrefix: 'nutrition_app_' })
    }
  }

  /**
   * Test if a backend type is available
   * @param type Backend type to test
   * @returns Promise resolving to availability status
   */
  static async isBackendAvailable(type: BackendType): Promise<boolean> {
    try {
      const backend = this.create(type)
      
      // Test basic functionality
      if (type === 'supabase') {
        // TODO: Add Supabase connectivity test when implemented
        return false // Not yet implemented
      }
      
      if (type === 'localStorage') {
        // Test localStorage availability
        const testKey = 'backend_test'
        localStorage.setItem(testKey, 'test')
        localStorage.removeItem(testKey)
        return true
      }
      
      return false
    } catch (error) {
      console.error(`Backend ${type} is not available:`, error)
      return false
    }
  }
}

// Convenience export for the current configured backend
export const getCurrentBackend = () => BackendFactory.getInstance()
```

### 3. Environment Variables Type Safety
```typescript
// Update next-env.d.ts or create types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_BACKEND_TYPE: 'localStorage' | 'supabase'
    NEXT_PUBLIC_SUPABASE_URL?: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
    SUPABASE_SERVICE_ROLE_KEY?: string
  }
}
```

## Error Handling Requirements
- Graceful fallback to localStorage if primary backend fails
- Clear error messages for configuration issues
- Logging for backend selection decisions
- Validation of environment variables

## Testing Requirements
- Unit tests for factory creation logic
- Test fallback mechanisms
- Test with different environment configurations
- Test singleton behavior
- Test backend availability checking

## Integration Notes
- This factory will be used by TICKET-007 (useNutritionData hook)
- Backend implementations (TICKET-004, TICKET-006) will be instantiated here
- Configuration should be testable and mockable

## Stub Implementation for Other Developers
If backend implementations aren't ready:

```typescript
// Temporary stub backend
class StubBackend implements NutritionDataAccess {
  async getTodaysMeals(): Promise<RecordedMeal[]> {
    console.log('Using stub backend - replace when real backends are ready')
    return []
  }
  // ... other required methods
}
```

## Environment Setup Example
```bash
# .env.local
NEXT_PUBLIC_BACKEND_TYPE=localStorage

# For Supabase (when ready)
# NEXT_PUBLIC_BACKEND_TYPE=supabase
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Configuration Validation
- Validate all required environment variables are present
- Provide helpful error messages for missing configuration
- Log the selected backend type on application startup
- Warn about fallbacks to localStorage

## Future Extensibility
- Design allows easy addition of new backend types
- Configuration system supports backend-specific options
- Factory pattern supports different initialization parameters

## Definition of Done
- [ ] Factory creates correct backend instances
- [ ] Environment-based configuration works
- [ ] Fallback to localStorage on errors
- [ ] Type-safe environment variables
- [ ] Configuration validation implemented
- [ ] Error handling tested
- [ ] No TypeScript compilation errors
- [ ] Code review approved