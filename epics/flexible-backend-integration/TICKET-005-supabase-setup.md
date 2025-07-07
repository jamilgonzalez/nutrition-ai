# TICKET-005: Supabase Setup & Schema

**Priority**: Medium  
**Estimate**: 3-4 hours  
**Dependencies**: TICKET-002 (Core Types)  
**Assignee**: TBD  

## Description
Set up Supabase project, configure authentication integration with Clerk, and create the database schema for nutrition data and AI coaching features.

## Acceptance Criteria
- [ ] Supabase project created and configured
- [ ] Database schema implemented with all tables
- [ ] Row Level Security (RLS) policies configured
- [ ] Clerk JWT integration working
- [ ] Environment variables documented
- [ ] Database migrations created
- [ ] Indexes optimized for performance

## Files to Create/Modify
- `supabase/migrations/` (new directory with migration files)
- `src/lib/supabase/client.ts` (new)
- `src/lib/supabase/auth.ts` (new)
- Update environment variable documentation

## Implementation Details

### 1. Supabase Project Setup
```bash
# Install Supabase CLI and dependencies
npm install @supabase/supabase-js
npm install -D supabase

# Initialize Supabase project (run locally)
npx supabase init
npx supabase start
```

### 2. Create Database Schema Migration
```sql
-- supabase/migrations/001_initial_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table is handled by Supabase Auth, we'll reference auth.users.id
-- No additional user table needed due to Clerk integration

-- Nutrition targets table
CREATE TABLE nutrition_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR NOT NULL, -- Clerk user ID
  daily_calories INTEGER NOT NULL DEFAULT 2000,
  target_protein INTEGER NOT NULL DEFAULT 150,
  target_carbs INTEGER NOT NULL DEFAULT 200,
  target_fat INTEGER NOT NULL DEFAULT 65,
  
  -- Metadata
  last_adjusted_by VARCHAR(20) DEFAULT 'user' CHECK (last_adjusted_by IN ('user', 'ai_recommendation')),
  adjustment_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Recorded meals table
CREATE TABLE recorded_meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR NOT NULL, -- Clerk user ID
  name VARCHAR NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  image_url VARCHAR,
  notes TEXT,
  
  -- Basic nutrition data (for quick queries and aggregations)
  calories INTEGER,
  protein NUMERIC(5,2),
  carbs NUMERIC(5,2),
  fat NUMERIC(5,2),
  
  -- Full nutrition data (JSON for flexibility)
  full_nutrition_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal sources table (normalized for better querying)
CREATE TABLE meal_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID REFERENCES recorded_meals(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  domain VARCHAR NOT NULL,
  snippet TEXT,
  relevance VARCHAR(10) CHECK (relevance IN ('high', 'medium', 'low')),
  source_type VARCHAR(20) DEFAULT 'research' CHECK (source_type IN ('research', 'guideline', 'expert_opinion')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coaching conversations table
CREATE TABLE coaching_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR NOT NULL, -- Clerk user ID
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  
  -- Context data at time of conversation (JSONB for flexibility)
  context JSONB NOT NULL,
  sources JSONB, -- Array of sources used in response
  
  -- Metadata
  response_time_ms INTEGER,
  model_used VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition recommendations table
CREATE TABLE nutrition_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR NOT NULL, -- Clerk user ID
  conversation_id UUID REFERENCES coaching_conversations(id) ON DELETE SET NULL,
  
  type VARCHAR(20) NOT NULL CHECK (type IN ('target_adjustment', 'meal_suggestion', 'lifestyle_change')),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  
  -- Target changes (JSONB for flexibility)
  current_targets JSONB,
  proposed_targets JSONB,
  
  -- Metadata
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  sources JSONB, -- Array of NutritionSource objects
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_nutrition_targets_user_id ON nutrition_targets(user_id);

CREATE INDEX idx_recorded_meals_user_timestamp ON recorded_meals(user_id, timestamp DESC);
CREATE INDEX idx_recorded_meals_user_date ON recorded_meals(user_id, DATE(timestamp));
CREATE INDEX idx_recorded_meals_timestamp ON recorded_meals(timestamp DESC);

CREATE INDEX idx_meal_sources_meal_id ON meal_sources(meal_id);
CREATE INDEX idx_meal_sources_domain ON meal_sources(domain);

CREATE INDEX idx_coaching_conversations_user_created ON coaching_conversations(user_id, created_at DESC);

CREATE INDEX idx_nutrition_recommendations_user_status ON nutrition_recommendations(user_id, status);
CREATE INDEX idx_nutrition_recommendations_user_created ON nutrition_recommendations(user_id, created_at DESC);
CREATE INDEX idx_nutrition_recommendations_conversation ON nutrition_recommendations(conversation_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_nutrition_targets_updated_at BEFORE UPDATE ON nutrition_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_recorded_meals_updated_at BEFORE UPDATE ON recorded_meals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Row Level Security Policies
```sql
-- supabase/migrations/002_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE nutrition_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recorded_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_recommendations ENABLE ROW LEVEL SECURITY;

-- Nutrition targets policies
CREATE POLICY "Users can manage their own nutrition targets" ON nutrition_targets
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

-- Recorded meals policies
CREATE POLICY "Users can manage their own meals" ON recorded_meals
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

-- Meal sources policies (access through meals)
CREATE POLICY "Users can manage their own meal sources" ON meal_sources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM recorded_meals 
            WHERE id = meal_sources.meal_id 
            AND user_id = auth.jwt() ->> 'sub'
        )
    );

-- Coaching conversations policies
CREATE POLICY "Users can manage their own conversations" ON coaching_conversations
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

-- Nutrition recommendations policies
CREATE POLICY "Users can manage their own recommendations" ON nutrition_recommendations
    FOR ALL USING (auth.jwt() ->> 'sub' = user_id);
```

### 4. Materialized View for Analytics
```sql
-- supabase/migrations/003_analytics_views.sql

-- Nutrition trends materialized view for performance
CREATE MATERIALIZED VIEW nutrition_trends AS
SELECT 
    user_id,
    DATE(timestamp) as date,
    SUM(calories) as total_calories,
    SUM(protein) as total_protein,
    SUM(carbs) as total_carbs,
    SUM(fat) as total_fat,
    COUNT(*) as meal_count,
    -- Calculate adherence score based on targets
    CASE 
        WHEN nt.daily_calories > 0 THEN 
            LEAST(100, GREATEST(0, (SUM(calories)::float / nt.daily_calories * 100)))
        ELSE NULL 
    END as adherence_score
FROM recorded_meals rm
LEFT JOIN nutrition_targets nt ON rm.user_id = nt.user_id
WHERE rm.timestamp >= CURRENT_DATE - INTERVAL '90 days'
    AND rm.calories IS NOT NULL
GROUP BY user_id, DATE(timestamp), nt.daily_calories, nt.target_protein, nt.target_carbs, nt.target_fat
ORDER BY user_id, date DESC;

-- Index for the materialized view
CREATE INDEX idx_nutrition_trends_user_date ON nutrition_trends(user_id, date DESC);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_nutrition_trends()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY nutrition_trends;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (if using pg_cron extension)
-- SELECT cron.schedule('refresh-nutrition-trends', '0 2 * * *', 'SELECT refresh_nutrition_trends();');
```

### 5. Supabase Client Configuration
```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/supabase' // Generated types

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable Supabase auth since we're using Clerk
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

// Create client with service role for server-side operations
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)
```

### 6. Clerk Integration for JWT
```typescript
// src/lib/supabase/auth.ts
import { auth } from '@clerk/nextjs'
import { supabase } from './client'

/**
 * Set Supabase auth token from Clerk JWT
 * Call this before making Supabase queries on the server
 */
export async function setSupabaseAuth() {
  const { getToken } = auth()
  
  try {
    const token = await getToken({ template: 'supabase' })
    
    if (token) {
      supabase.auth.setSession({
        access_token: token,
        refresh_token: '',
        expires_in: 3600,
        token_type: 'bearer',
        user: null
      })
    }
  } catch (error) {
    console.error('Failed to set Supabase auth:', error)
  }
}

/**
 * Get current user ID from Clerk
 */
export function getCurrentUserId(): string | null {
  const { userId } = auth()
  return userId
}
```

## Environment Variables Setup
```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Clerk Supabase Integration
1. Create custom JWT template in Clerk Dashboard
2. Add Supabase project details to Clerk
3. Configure JWT claims for RLS

## Testing Requirements
- Test database connection
- Verify RLS policies work correctly
- Test Clerk JWT integration
- Validate schema constraints
- Performance test with sample data

## Performance Considerations
- Proper indexing for common queries
- Materialized view for analytics
- Connection pooling configuration
- Query optimization

## Security Checklist
- [ ] RLS enabled on all tables
- [ ] Policies restrict access to user's own data
- [ ] Service role key secured (server-side only)
- [ ] Input validation for all user data
- [ ] SQL injection prevention

## Migration Commands
```bash
# Run migrations
npx supabase db reset

# Generate TypeScript types
npx supabase gen types typescript --local > src/lib/types/supabase.ts

# Deploy to production
npx supabase db push
```

## Definition of Done
- [ ] Supabase project created and configured
- [ ] All database tables created with proper schema
- [ ] RLS policies implemented and tested
- [ ] Clerk JWT integration working
- [ ] Database types generated
- [ ] Environment variables documented
- [ ] Performance indexes created
- [ ] Security review completed