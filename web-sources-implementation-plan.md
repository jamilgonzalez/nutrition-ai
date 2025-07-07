# Web Sources Implementation Plan

## Overview
This document outlines the proposed changes to add web sources to the nutrition AI responses, providing users with clickable source links and icons for trustworthy information verification.

## Current Implementation Analysis

### API Response Structure (`src/app/api/upload/route.ts`)
Currently, the API uses Tavily search results to enhance nutrition analysis but doesn't expose the sources to the client:

- **Line 29-33**: Search results are fetched from Tavily
- **Line 40-42**: Search results are included in the system prompt but not returned to client
- **Line 54**: Only the analyzed nutrition object is returned via `result.object`

### Client Components (`src/app/page.tsx` & `src/components/NutritionDisplay/`)
The client displays structured nutrition data through:

- **`NutritionDisplay`**: Main component that renders nutrition cards
- **`NutritionHeader`**: Displays meal name and overview
- **`MacronutrientCard`**: Shows macros (protein, carbs, fat)
- **`MicronutrientCard`**: Shows micronutrients 
- **`IngredientsCard`**: Lists identified ingredients
- **`RecommendationsCard`**: Shows health recommendations

## Proposed Changes

### 1. API Response Schema Updates (`src/app/api/upload/types.ts`)

Add a new `sources` field to the nutrition schema:

```typescript
export const nutritionSchema = z.object({
  // ... existing fields
  sources: z.array(z.object({
    title: z.string().describe('Title of the source'),
    url: z.string().url().describe('URL of the source'),
    domain: z.string().describe('Domain name of the source (e.g., "healthline.com")'),
    snippet: z.string().optional().describe('Brief excerpt from the source'),
    relevance: z.enum(['high', 'medium', 'low']).describe('Relevance to the nutrition analysis')
  })).describe('Web sources used for nutrition analysis')
})
```

### 2. API Route Updates (`src/app/api/upload/route.ts`)

Modify the structured response to include sources:

```typescript
// After line 33, store search results for later use
const searchResults = await tvly.search(searchQuery, {
  maxResults: 5, // Increase for more source options
  searchDepth: 'advanced',
  topic: 'general',
})

// Modify the system prompt to instruct the AI to include sources
const systemPrompt = `You are an expert nutritionist. Analyze the meal image and provide detailed nutritional information.

Use the following search results to enhance your analysis: ${JSON.stringify(searchResults.results)}

IMPORTANT: In your response, include a 'sources' array with the most relevant and trustworthy sources from the search results. Select 2-3 high-quality sources that directly support your nutritional analysis. For each source, provide:
- title: The title of the article/page
- url: The full URL
- domain: Just the domain name (e.g., "healthline.com")
- snippet: A brief relevant excerpt (optional)
- relevance: Rate as 'high', 'medium', or 'low' based on how directly it supports your analysis

Prioritize sources from reputable nutrition and health websites.`

// The generateObject call will now include sources in the response
```

### 3. Client Component Updates

#### A. New Source Icon Component (`src/components/SourceIcon.tsx`)
Create a reusable component for displaying source icons:

```typescript
interface SourceIconProps {
  domain: string
  title: string
  url: string
  size?: 'sm' | 'md' | 'lg'
}

export function SourceIcon({ domain, title, url, size = 'md' }: SourceIconProps) {
  const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
      title={`Source: ${title}`}
    >
      <img
        src={iconUrl}
        alt={`${domain} icon`}
        className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'} rounded-sm`}
        onError={(e) => {
          // Fallback to a generic link icon
          (e.target as HTMLImageElement).src = '/icons/link.svg'
        }}
      />
      <span className="text-sm font-medium">{domain}</span>
    </a>
  )
}
```

#### B. New Sources Card Component (`src/components/NutritionDisplay/organisms/SourcesCard.tsx`)
Create a dedicated card for displaying sources:

```typescript
import { SourceIcon } from '../../SourceIcon'

interface SourcesCardProps {
  sources: Array<{
    title: string
    url: string
    domain: string
    snippet?: string
    relevance: 'high' | 'medium' | 'low'
  }>
}

export default function SourcesCard({ sources }: SourcesCardProps) {
  // Sort sources by relevance (high first)
  const sortedSources = sources.sort((a, b) => {
    const relevanceOrder = { high: 0, medium: 1, low: 2 }
    return relevanceOrder[a.relevance] - relevanceOrder[b.relevance]
  })

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5z" />
          <path d="M7.414 15.414a2 2 0 01-2.828-2.828l3-3a2 2 0 012.828 0 1 1 0 001.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 00-1.414-1.414l-1.5 1.5z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Sources</h3>
      </div>
      
      <div className="space-y-3">
        {sortedSources.map((source, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <SourceIcon
              domain={source.domain}
              title={source.title}
              url={source.url}
              size="md"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{source.title}</h4>
              {source.snippet && (
                <p className="text-xs text-gray-600 mt-1">{source.snippet}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  source.relevance === 'high' ? 'bg-green-100 text-green-800' :
                  source.relevance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {source.relevance} relevance
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

#### C. Update NutritionDisplay Component
Add the SourcesCard to the main display:

```typescript
// In src/components/NutritionDisplay/NutritionDisplay.tsx
import SourcesCard from './organisms/SourcesCard'

export default function NutritionDisplay({ data, onSaveEntry }: NutritionDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <NutritionHeader data={data} />
      <MacronutrientCard macros={data.macros} />
      <MicronutrientCard micronutrients={data.micronutrients} />
      <IngredientsCard ingredients={data.ingredients} />
      <RecommendationsCard recommendations={data.recommendations} />
      
      {/* Add sources card */}
      {data.sources && data.sources.length > 0 && (
        <SourcesCard sources={data.sources} />
      )}

      {onSaveEntry && (
        <div className="text-center pt-4">
          <button
            onClick={onSaveEntry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Save to My Nutrition Log
          </button>
        </div>
      )}
    </div>
  )
}
```

#### D. Update TypeScript Types
Update the `NutritionData` type to include sources:

```typescript
// In src/components/NutritionDisplay/types.ts
export interface NutritionData {
  // ... existing fields
  sources?: Array<{
    title: string
    url: string
    domain: string
    snippet?: string
    relevance: 'high' | 'medium' | 'low'
  }>
}
```

### 4. Optional: Inline Source Citations

For even better user experience, add small source indicators next to specific nutrition facts:

```typescript
// Example in MacronutrientCard
<div className="flex items-center gap-2">
  <span className="text-2xl font-bold text-gray-900">{macros.protein}g</span>
  <span className="text-sm text-gray-600">Protein</span>
  {/* Small source indicator */}
  <SourceIcon domain="healthline.com" title="Protein content reference" url="..." size="sm" />
</div>
```

## Implementation Benefits

1. **Trust & Transparency**: Users can verify nutrition information from reputable sources
2. **Educational Value**: Users learn about nutrition from authoritative websites
3. **Compliance**: Helps with regulatory compliance by providing source attribution
4. **User Experience**: Clean, intuitive display with clickable source links
5. **Credibility**: Builds trust in the AI's recommendations

## Technical Considerations

- **Performance**: Favicon loading is cached by browsers, minimal impact
- **Fallback**: Generic link icon when favicons fail to load
- **Accessibility**: Proper alt text and screen reader support
- **Responsive**: Icons and layout work well on mobile devices
- **Security**: External links open in new tabs with proper security attributes

This implementation provides a robust foundation for displaying trustworthy sources while maintaining the clean, user-friendly interface of the nutrition AI application.