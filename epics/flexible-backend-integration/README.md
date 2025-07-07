# Epic: Flexible Backend Integration with AI Nutrition Coaching

## Overview
This epic implements a flexible backend architecture that allows seamless switching between LocalStorage and Supabase, while adding AI-powered nutrition coaching capabilities that can dynamically adjust user nutrition targets based on conversational feedback.

## Goals
1. **Flexible Backend Architecture**: Enable one-line backend switching via environment variables
2. **AI Nutrition Coaching**: Add conversational coaching that can recommend and update nutrition targets
3. **Type Safety**: Maintain compile-time safety across all backend implementations
4. **Zero Downtime Migration**: Users can migrate from localStorage to Supabase seamlessly
5. **Scalable Foundation**: Support for future backends (Firebase, MongoDB, etc.)

## Success Criteria
- [ ] Backend can be switched by changing one environment variable
- [ ] All existing functionality preserved during migration
- [ ] AI can analyze user concerns and recommend target adjustments
- [ ] Users can approve/reject recommendations with clear UI
- [ ] All data operations are type-safe across backends
- [ ] Performance is maintained or improved

## Architecture Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Hook     │    │  Data Interface │    │  Backend Impl   │
│  useNutrition   │ -> │  NutritionDAI   │ -> │  LocalStorage   │
│  Data()         │    │                 │    │  or Supabase    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                   │
                              ┌─────────────────┐
                              │  AI Coaching    │
                              │  Intent Routing │
                              └─────────────────┘
```

## Tickets

### Foundation (Can be worked in parallel)
- [x] [TICKET-001: Create Data Access Interface](./TICKET-001-data-access-interface.md) - **Priority: High**
- [x] [TICKET-002: Define Core Types](./TICKET-002-core-types.md) - **Priority: High**
- [x] [TICKET-003: Backend Factory](./TICKET-003-backend-factory.md) - **Priority: High**

### Backend Implementations (Parallel after Foundation)
- [x] [TICKET-004: LocalStorage Backend Migration](./TICKET-004-localstorage-backend.md) - **Priority: High**
- [x] [TICKET-005: Supabase Setup & Schema](./TICKET-005-supabase-setup.md) - **Priority: Medium**
- [x] [TICKET-006: Supabase Backend Implementation](./TICKET-006-supabase-backend.md) - **Priority: Medium**

### React Integration (Depends on Foundation)
- [x] [TICKET-007: useNutritionData Hook](./TICKET-007-nutrition-data-hook.md) - **Priority: High**
- [x] [TICKET-008: Component Migration](./TICKET-008-component-migration.md) - **Priority: Medium**

### AI Coaching System (Can be worked in parallel)
- [x] [TICKET-009: LLM Intent Classification](./TICKET-009-intent-classification.md) - **Priority: Medium**
- [x] [TICKET-010: Nutrition Coach API](./TICKET-010-nutrition-coach-api.md) - **Priority: Medium**
- [x] [TICKET-011: Recommendation System](./TICKET-011-recommendation-system.md) - **Priority: Medium**

### UI Components (Depends on React Integration)
- [x] [TICKET-012: Recommendation UI Components](./TICKET-012-recommendation-ui.md) - **Priority: Low**
- [x] [TICKET-013: Enhanced Chat Interface](./TICKET-013-enhanced-chat.md) - **Priority: Low**

### Testing & Migration (Final phase)
- [x] [TICKET-014: Backend Switching Tests](./TICKET-014-backend-tests.md) - **Priority: Low**
- [x] [TICKET-015: Data Migration Utility](./TICKET-015-data-migration.md) - **Priority: Low**

## Work Phases

### Phase 1: Foundation (Week 1)
- TICKET-001, TICKET-002, TICKET-003 (can be parallel)
- TICKET-004 (depends on 001-003)

### Phase 2: Backend & Hook (Week 2)
- TICKET-005, TICKET-006 (parallel)
- TICKET-007 (depends on 001-003)

### Phase 3: AI Coaching (Week 2-3)
- TICKET-009, TICKET-010, TICKET-011 (can be parallel)

### Phase 4: UI & Integration (Week 3)
- TICKET-008 (depends on 007)
- TICKET-012, TICKET-013 (depends on 008, 011)

### Phase 5: Testing & Migration (Week 4)
- TICKET-014, TICKET-015

## Dependencies Graph
```
TICKET-001 ──┐
TICKET-002 ──┼─→ TICKET-004 ──┐
TICKET-003 ──┘                ├─→ TICKET-007 ──→ TICKET-008 ──→ TICKET-012
                              │                               └─→ TICKET-013
TICKET-005 ──→ TICKET-006 ────┘
                              
TICKET-009 ──┐
TICKET-010 ──┼─→ TICKET-011 ──→ TICKET-012
TICKET-011 ──┘               └─→ TICKET-013

All ──────────────────────────→ TICKET-014
All ──────────────────────────→ TICKET-015
```

## Environment Configuration
```bash
# Backend Selection
NEXT_PUBLIC_BACKEND_TYPE=localStorage # or 'supabase'

# Supabase (when using Supabase backend)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Notes for Developers
1. **Stub Dependencies**: If your ticket depends on another, create stub implementations to unblock your work
2. **Type Safety**: Always maintain TypeScript types - the interface ensures compatibility
3. **Testing**: Test your implementation with the existing functionality
4. **Documentation**: Update component documentation as you migrate them
5. **Performance**: Monitor that changes don't degrade performance

## Questions & Support
- Check existing tickets for similar implementations
- Reference the main [backend-integration-plan.md](../../backend-integration-plan.md) for detailed technical specs
- Use the interface definitions as your contract - don't break the API