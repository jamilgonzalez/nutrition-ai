# Nutrition Data Architecture & Display Strategy

## Overview
This document outlines a comprehensive strategy for storing, displaying, and making accessible the rich nutrition data returned by our enhanced search API. The goal is to create a seamless experience for users while providing the LLM with context-rich data for personalized recommendations.

## 📊 Data Structure Analysis

### Current API Response Schema
```typescript
interface NutritionPlan {
  // Core Metrics
  dailyCalories: number
  macros: {
    protein: number        // grams
    carbs: number         // grams  
    fat: number           // grams
    proteinPercentage: number
    carbsPercentage: number
    fatPercentage: number
  }
  
  // Detailed Meal Planning
  mealPlan: {
    breakfast: { calories: number; suggestions: string[] }
    lunch: { calories: number; suggestions: string[] }
    dinner: { calories: number; suggestions: string[] }
    snacks: { calories: number; suggestions: string[] }
  }
  
  // Actionable Insights
  keyRecommendations: string[]     // 5-7 personalized tips
  supplementation: string[]        // Evidence-based supplements
  
  // Lifestyle Integration
  hydration: {
    dailyWaterIntake: number      // ounces
    tips: string[]
  }
  
  // Progress Planning
  timeline: {
    weeklyGoals: string[]
    monthlyMilestones: string[]
  }
  
  // Health Adaptations
  adaptations: {
    forHealthConditions: string[]
    forDietaryRestrictions: string[]
  }
  
  // Source References
  sources: SearchResult[]
  summary: string
}
```

## 🗄️ Data Storage Strategy

### 1. User Profile Integration
```typescript
interface EnhancedUserProfile {
  // Existing profile data
  id: string
  age: number
  sex: string
  height: number
  weight: number
  activityLevel: string
  goals: string[]
  healthConditions: string[]
  dietaryRestrictions: string[]
  
  // New nutrition plan storage
  currentNutritionPlan?: NutritionPlan
  nutritionPlanHistory: {
    id: string
    plan: NutritionPlan
    createdAt: Date
    isActive: boolean
    userFeedback?: {
      rating: number
      comments: string
      adjustmentRequests: string[]
    }
  }[]
  
  // Plan customizations
  customizations: {
    preferredMealTimes: string[]
    dislikedFoods: string[]
    favoriteRecipes: string[]
    budgetConstraints?: string
    cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced'
  }
}
```

### 2. Database Schema Design

#### Table: `nutrition_plans`
```sql
CREATE TABLE nutrition_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_data JSONB NOT NULL,           -- Full NutritionPlan object
  generated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  adjustments_made JSONB DEFAULT '[]',
  INDEX idx_user_plans (user_id, is_active),
  INDEX idx_generation_date (generated_at)
);
```

#### Table: `daily_nutrition_tracking`
```sql
CREATE TABLE daily_nutrition_tracking (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  target_calories INTEGER,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fat INTEGER,
  actual_calories INTEGER DEFAULT 0,
  actual_protein INTEGER DEFAULT 0,
  actual_carbs INTEGER DEFAULT 0,
  actual_fat INTEGER DEFAULT 0,
  meals_logged INTEGER DEFAULT 0,
  hydration_target INTEGER,
  hydration_actual INTEGER DEFAULT 0,
  daily_goals_met JSONB DEFAULT '[]',
  notes TEXT,
  UNIQUE(user_id, date)
);
```

#### Table: `meal_plan_feedback`
```sql
CREATE TABLE meal_plan_feedback (
  id UUID PRIMARY KEY,
  nutrition_plan_id UUID REFERENCES nutrition_plans(id),
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snacks'),
  suggestion_index INTEGER,
  user_action ENUM('tried', 'liked', 'disliked', 'modified', 'skipped'),
  feedback_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Local Storage Strategy
```typescript
// Enhanced meal storage with plan context
interface RecordedMealEnhanced {
  id: string
  name: string
  timestamp: Date
  image?: string
  notes: string
  nutritionData?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  
  // New plan integration fields
  planContext?: {
    nutritionPlanId: string
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
    wasPlannedMeal: boolean
    followedRecommendation?: string  // Which suggestion was followed
    deviationReason?: string         // Why user deviated from plan
  }
  
  // Enhanced tracking
  satisfaction: {
    taste: number      // 1-5 scale
    satiety: number    // 1-5 scale
    convenience: number // 1-5 scale
  }
}
```

## 🎨 User Interface Design Strategy

### 1. Nutrition Dashboard Redesign

#### Main Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│                 📊 Today's Nutrition                    │
├─────────────────────────────────────────────────────────┤
│  🔥 1,847 / 2,200 cal    💧 48 / 64 oz water          │
│  ████████████░░░░ 84%    ████████░░░░ 75%              │
├─────────────────────────────────────────────────────────┤
│  🥩 142g protein  🌾 185g carbs  🥑 67g fat            │
│  ██████████████░░ 84%  ████████████░░ 74%  ███████████░░ 86% │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│            🍽️ Today's Meal Suggestions                  │
├─────────────────────────────────────────────────────────┤
│  Breakfast (550 cal) ✅ Completed                      │
│  • Greek yogurt with berries ⭐ Highly recommended     │
│                                                         │
│  Lunch (770 cal) 🕒 Coming up                         │
│  • Grilled chicken salad 👍 Tried before              │
│  • Quinoa power bowl ✨ New suggestion                 │
│  • Turkey avocado wrap 🔄 Customize                    │
│                                                         │
│  [ View Full Meal Plan ] [ Adjust Preferences ]        │
└─────────────────────────────────────────────────────────┘
```

#### Expanded Nutrition Plan View
```
┌─────────────────────────────────────────────────────────┐
│               🎯 Your Personalized Plan                 │
├─────────────────────────────────────────────────────────┤
│  📅 Generated: March 15, 2024                          │
│  🎯 Goal: Weight loss + muscle gain                     │
│  ⏱️ Duration: 4-week plan                              │
│                                                         │
│  💡 Key Recommendations:                               │
│  • Prioritize protein with each meal (35g target)      │
│  • Stay hydrated: 64oz water daily                     │
│  • Time carbs around workouts for energy               │
│  • Include omega-3 rich foods 3x per week              │
│                                                         │
│  📈 Weekly Goals:                                      │
│  Week 1: ✅ Track all meals, establish routine         │
│  Week 2: 🔄 Hit protein targets 6/7 days              │
│  Week 3: ⏳ Incorporate meal prep strategies           │
│  Week 4: ⏳ Evaluate and adjust plan                   │
│                                                         │
│  [ 💊 Supplements ] [ 🏥 Health Adaptations ] [ 📚 Sources ] │
└─────────────────────────────────────────────────────────┘
```

### 2. Interactive Meal Planning

#### Smart Meal Suggestions
```
┌─────────────────────────────────────────────────────────┐
│                🍳 Breakfast Suggestions                 │
├─────────────────────────────────────────────────────────┤
│  Based on your goals: High protein, moderate carbs     │
│                                                         │
│  🥣 Greek Yogurt Bowl (520 cal)         [🍽️ Log This] │
│     • 35g protein • 42g carbs • 18g fat                │
│     ⭐⭐⭐⭐⭐ Perfect macro fit                        │
│     💭 "High protein, keeps you full until lunch"      │
│                                                         │
│  🍳 Veggie Scramble (480 cal)          [🍽️ Log This]  │
│     • 28g protein • 15g carbs • 32g fat                │
│     ⭐⭐⭐⭐☆ Good protein, lower carbs                 │
│     💭 "Great for keto-friendly approach"               │
│                                                         │
│  🥞 Protein Pancakes (540 cal)         [🍽️ Log This]  │
│     • 30g protein • 52g carbs • 16g fat                │
│     ⭐⭐⭐☆☆ Balanced, higher carbs                     │
│     💭 "Perfect pre-workout fuel"                       │
│                                                         │
│  [ 🔄 More Options ] [ 🎯 Customize ] [ 💾 Save Favorite ] │
└─────────────────────────────────────────────────────────┘
```

### 3. Progress Tracking & Analytics

#### Weekly Nutrition Report
```
┌─────────────────────────────────────────────────────────┐
│                📈 Weekly Progress Report                │
├─────────────────────────────────────────────────────────┤
│  March 11-17, 2024                                     │
│                                                         │
│  🎯 Goals Met:                                         │
│  • Calorie targets: 6/7 days ✅                       │
│  • Protein goals: 7/7 days ✅                         │
│  • Hydration: 5/7 days ⚠️                             │
│  • Meal logging: 100% ✅                              │
│                                                         │
│  📊 Trends:                                            │
│  • Average calories: 2,156 (target: 2,200)            │
│  • Protein consistency improved 15%                    │
│  • Weekend adherence needs attention                   │
│                                                         │
│  💡 This Week's Insights:                             │
│  • You prefer higher protein breakfasts               │
│  • Dinner portions tend to be larger on weekends      │
│  • Hydration dips on busy workdays                    │
│                                                         │
│  🎯 Next Week's Focus:                                │
│  • Set hydration reminders                            │
│  • Prep weekend meals in advance                      │
│  • Try new lunch variety                              │
│                                                         │
│  [ 🔄 Update Plan ] [ 💬 Get Coaching ] [ 📱 Set Reminders ] │
└─────────────────────────────────────────────────────────┘
```

## 🤖 LLM Integration Patterns

### 1. Context-Aware Meal Analysis
```typescript
// Enhanced meal recording with plan context
async function analyzeRecordedMeal(
  mealData: RecordedMealEnhanced,
  currentPlan: NutritionPlan,
  userHistory: MealHistory[]
) {
  const context = {
    userPlan: currentPlan,
    mealType: mealData.planContext?.mealType,
    recentMeals: userHistory.slice(-10),
    dayProgress: await getDayNutritionProgress(),
    preferences: await getUserPreferences(),
  }
  
  return await llm.analyze({
    prompt: `Analyze this meal in context of the user's nutrition plan and provide personalized feedback.`,
    context,
    response_format: 'structured_feedback'
  })
}
```

### 2. Dynamic Plan Adjustments
```typescript
interface PlanAdjustmentRequest {
  type: 'calories' | 'macros' | 'meal_timing' | 'food_preferences'
  change: string
  reason: string
  userFeedback: {
    currentSatisfaction: number
    specificConcerns: string[]
    preferredChanges: string[]
  }
  performanceData: {
    adherenceRate: number
    goalProgress: number
    recentTrends: string[]
  }
}

async function adjustNutritionPlan(
  currentPlan: NutritionPlan,
  adjustmentRequest: PlanAdjustmentRequest,
  userProfile: EnhancedUserProfile
) {
  const enhancedContext = {
    originalPlan: currentPlan,
    userProfile,
    adjustmentRequest,
    mealHistory: await getMealHistory(userProfile.id, 30), // Last 30 days
    progressData: await getProgressMetrics(userProfile.id),
    seasonalFactors: getCurrentSeasonalFactors(),
  }
  
  return await llm.generateObject({
    schema: nutritionPlanSchema,
    prompt: `Adjust the nutrition plan based on user feedback and performance data.`,
    context: enhancedContext
  })
}
```

### 3. Intelligent Meal Suggestions
```typescript
async function generateContextualMealSuggestions(
  mealType: MealType,
  remainingDayTargets: MacroTargets,
  userProfile: EnhancedUserProfile,
  currentPlan: NutritionPlan
) {
  const context = {
    mealType,
    remainingTargets: remainingDayTargets,
    userPreferences: userProfile.customizations,
    recentMeals: await getRecentMeals(userProfile.id, 7),
    pantryItems: await getPantryInventory(userProfile.id), // Future feature
    schedulingConstraints: await getTodaysSchedule(userProfile.id), // Future feature
    weatherContext: await getWeatherContext(), // Comfort food adjustments
    currentPlan: currentPlan.mealPlan[mealType],
  }
  
  return await llm.generateMealSuggestions({
    context,
    count: 4,
    includeInstructions: true,
    adaptToPreferences: true
  })
}
```

## 🔄 Data Flow Architecture

### 1. User Journey Data Flow
```
User Profile Creation
        ↓
Initial Nutrition Plan Generation (LLM + Research)
        ↓
Plan Storage (Database + Local)
        ↓
Daily Meal Logging with Plan Context
        ↓
Progress Tracking & Analytics
        ↓
LLM Analysis of Adherence & Results
        ↓
Automatic Plan Adjustments + User Feedback
        ↓
Refined Personalized Recommendations
```

### 2. Real-time Adaptation System
```typescript
class NutritionPlanOrchestrator {
  async updatePlanBasedOnProgress(userId: string) {
    const progressData = await this.analyzeProgress(userId)
    
    if (progressData.shouldAdjust) {
      const adjustments = await this.generateAdjustments(progressData)
      const updatedPlan = await this.applyAdjustments(adjustments)
      
      await this.notifyUser(updatedPlan, adjustments.reasoning)
      return updatedPlan
    }
  }
  
  async generateDailyMealSuggestions(userId: string) {
    const [currentPlan, dayProgress, preferences] = await Promise.all([
      this.getCurrentPlan(userId),
      this.getDayProgress(userId),
      this.getUserPreferences(userId)
    ])
    
    return await this.llm.generateSuggestions({
      plan: currentPlan,
      progress: dayProgress,
      preferences,
      context: 'daily_suggestions'
    })
  }
}
```

## 📱 Mobile-First Design Considerations

### 1. Quick Actions Interface
```
┌─────────────────────────────┐
│     Today's Quick Stats     │
├─────────────────────────────┤
│ 🔥 1,847/2,200 cal ████░    │
│ 💧 48/64 oz water ████░     │
│ 🥩 142g protein ████████░   │
├─────────────────────────────┤
│ 📸 Log Meal                 │
│ 🍽️ See Suggestions         │
│ 💧 Add Water               │
│ 📊 View Progress           │
└─────────────────────────────┘
```

### 2. Smart Notifications
- **Meal Timing**: "🍽️ Time for lunch! Try the quinoa bowl from your plan"
- **Hydration**: "💧 Halfway through your day - remember to drink water!"
- **Progress**: "🎯 You're 23g away from your protein goal. Add some Greek yogurt?"
- **Insights**: "📈 You've been crushing your protein goals this week!"

## 🚀 Future Enhancement Opportunities

### 1. Advanced Features
- **AI Grocery Lists**: Generate shopping lists based on meal plans
- **Recipe Integration**: Full cooking instructions with nutritional breakdowns
- **Social Features**: Share successes, meal photos, and tips
- **Integration APIs**: Connect with fitness trackers, smart scales, grocery delivery
- **Seasonal Adaptation**: Adjust recommendations based on available produce

### 2. Predictive Analytics
- **Adherence Prediction**: Predict likelihood of sticking to plan
- **Success Forecasting**: Estimate timeline for reaching goals
- **Risk Assessment**: Identify potential nutritional deficiencies
- **Behavior Pattern Recognition**: Learn individual eating patterns

### 3. Advanced LLM Features
- **Natural Language Plan Queries**: "Show me low-carb dinner options under 500 calories"
- **Conversational Adjustments**: Chat-based plan modifications
- **Contextual Recipe Generation**: Create recipes based on available ingredients
- **Health Integration**: Factor in sleep, stress, and activity data

## 💾 Implementation Priority

### Phase 1: Foundation (Month 1-2)
- [ ] Enhanced user profile storage
- [ ] Basic nutrition plan persistence
- [ ] Improved meal logging with plan context
- [ ] Simple progress tracking

### Phase 2: Intelligence (Month 3-4)
- [ ] LLM-powered plan adjustments
- [ ] Smart meal suggestions
- [ ] Progress analytics and insights
- [ ] Mobile-optimized interfaces

### Phase 3: Automation (Month 5-6)
- [ ] Automatic plan updates
- [ ] Predictive recommendations
- [ ] Advanced integrations
- [ ] Social and sharing features

This architecture provides a solid foundation for making the rich nutrition data truly useful and actionable for users while enabling the LLM to provide increasingly personalized and effective recommendations.