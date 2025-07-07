# Location-Based Meal Suggestions Feature

## Overview
Enhance the current meal suggestion system to provide two types of recommendations:
1. **Homecooked meals** - Generic macro-based suggestions (current functionality)
2. **Nearby restaurant meals** - Location-aware fast food/restaurant options that fit user's macros

## Feature Requirements

### Core Functionality
- Detect user's current location (with permission)
- Search for nearby restaurants/fast food chains
- Filter menu items based on macro requirements
- Present both homecooked and restaurant options side-by-side

### User Experience
- Toggle between homecooked and restaurant suggestions
- Display restaurant name, distance, and estimated delivery time
- Show nutritional information for restaurant items
- Provide ordering links or directions to restaurant

## Implementation Plan

### 1. Location Services
```typescript
// services/location.ts
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export async function getCurrentLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }),
      reject,
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
```

### 2. LLM-Based Restaurant Search
```typescript
// services/restaurantSearch.ts
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  distance: number;
  cuisine: string;
  rating: number;
  priceLevel: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  restaurantId: string;
}

export async function searchNearbyRestaurants(
  location: UserLocation,
  cityName: string,
  macroTargets: MacroTargets
): Promise<MenuItem[]> {
  // Use LLM web search to find restaurants and menu items
  const searchQuery = `restaurants near ${cityName} with healthy options calories ${macroTargets.calories.min}-${macroTargets.calories.max} protein ${macroTargets.protein.min}g+ nutrition information menu`;
  
  const response = await fetch(`/api/llm-search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: searchQuery,
      context: `Find restaurants and specific menu items with nutrition information that fit these macro targets: ${JSON.stringify(macroTargets)}`
    })
  });
  
  const searchResults = await response.json();
  return parseRestaurantResults(searchResults, macroTargets);
}

function parseRestaurantResults(searchResults: string, macroTargets: MacroTargets): MenuItem[] {
  // Parse LLM response into structured menu items
  // This would extract restaurant names, menu items, and nutrition info
  // from the search results
  return [];
}
```

### 3. Macro-Based Filtering
```typescript
// services/macroMatching.ts
export interface MacroTargets {
  calories: { min: number; max: number };
  protein: { min: number; max: number };
  carbs: { min: number; max: number };
  fat: { min: number; max: number };
}

export function filterMenuItemsByMacros(
  items: MenuItem[],
  targets: MacroTargets,
  tolerance: number = 0.15
): MenuItem[] {
  return items.filter(item => {
    const caloriesMatch = item.calories >= targets.calories.min * (1 - tolerance) &&
                         item.calories <= targets.calories.max * (1 + tolerance);
    const proteinMatch = item.protein >= targets.protein.min * (1 - tolerance) &&
                        item.protein <= targets.protein.max * (1 + tolerance);
    const carbsMatch = item.carbs >= targets.carbs.min * (1 - tolerance) &&
                      item.carbs <= targets.carbs.max * (1 + tolerance);
    const fatMatch = item.fat >= targets.fat.min * (1 - tolerance) &&
                    item.fat <= targets.fat.max * (1 + tolerance);
    
    return caloriesMatch && proteinMatch && carbsMatch && fatMatch;
  });
}
```

### 4. UI Components
```typescript
// components/MealSuggestions.tsx
export default function MealSuggestions({ userMacros }: { userMacros: MacroTargets }) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'homecooked' | 'restaurant'>('homecooked');

  useEffect(() => {
    getCurrentLocation().then(setLocation);
  }, []);

  useEffect(() => {
    if (location) {
      searchNearbyRestaurants(location).then(setRestaurants);
    }
  }, [location]);

  return (
    <div className="meal-suggestions">
      <div className="tabs">
        <button 
          className={selectedTab === 'homecooked' ? 'active' : ''}
          onClick={() => setSelectedTab('homecooked')}
        >
          Homecooked
        </button>
        <button 
          className={selectedTab === 'restaurant' ? 'active' : ''}
          onClick={() => setSelectedTab('restaurant')}
        >
          Nearby Restaurants
        </button>
      </div>
      
      {selectedTab === 'homecooked' ? (
        <HomecookedSuggestions macros={userMacros} />
      ) : (
        <RestaurantSuggestions 
          restaurants={restaurants} 
          macros={userMacros}
          location={location}
        />
      )}
    </div>
  );
}
```

## Current Implementation: LLM Web Search

### LLM Search API
- Use web search to find restaurants and menu items near user location
- Search for specific nutrition information that matches macro targets
- Parse results to extract structured restaurant and menu data
- Simple to implement, no API keys or rate limits initially

### Benefits of LLM Approach
- **Quick to implement** - No need for multiple API integrations
- **Comprehensive coverage** - Can find information from any publicly available source
- **Flexible queries** - Can search for specific macro combinations
- **Cost-effective** - No additional API costs beyond LLM usage

## TODO: Future API Integrations

### Phase 2: Direct API Integration
- **Google Places API** - Restaurant search by location
- **Nutritionix API** - Comprehensive nutrition database  
- **Spoonacular API** - Restaurant menu items with nutrition
- **Yelp Fusion API** - Restaurant data and basic menu info

### Phase 3: Web Scraping Fallback
For chains without API access:
- McDonald's, Burger King, Subway nutrition pages
- Cache results to avoid repeated requests
- Update data periodically

## Example User Flow

1. User opens meal suggestions
2. App requests location permission
3. User sees two tabs: "Homecooked" and "Nearby Restaurants"
4. Homecooked tab shows current generic suggestions
5. Restaurant tab shows:
   - "McDonald's - 0.3 miles" with Big Mac (fits macros)
   - "Chipotle - 0.8 miles" with custom bowl suggestion
   - "Subway - 1.2 miles" with specific sandwich combo

## Data Structure Examples

### Restaurant Menu Item
```json
{
  "id": "mcdonalds-big-mac",
  "name": "Big Mac",
  "restaurant": {
    "name": "McDonald's",
    "address": "123 Main St",
    "distance": 0.3,
    "estimatedDelivery": "15-25 min"
  },
  "nutrition": {
    "calories": 550,
    "protein": 25,
    "carbs": 45,
    "fat": 31,
    "fiber": 3,
    "sugar": 9
  },
  "price": 5.99,
  "macroFit": {
    "score": 0.85,
    "reasoning": "High protein, moderate carbs, fits daily targets"
  }
}
```

### Macro Matching Result
```json
{
  "targetMacros": {
    "calories": { "min": 500, "max": 650 },
    "protein": { "min": 20, "max": 35 },
    "carbs": { "min": 30, "max": 60 },
    "fat": { "min": 15, "max": 35 }
  },
  "matches": [
    {
      "item": "Big Mac",
      "fitScore": 0.85,
      "deviations": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0
      }
    }
  ]
}
```

## Technical Considerations

### Privacy & Permissions
- Request location permission explicitly
- Allow manual location entry as fallback
- Store location preferences securely
- Clear location data option

### Performance
- Cache LLM search results locally
- Debounce location updates
- Lazy load menu items
- Optimize search queries for better results

### Error Handling
- Graceful fallback when location unavailable
- Handle LLM search failures
- Offline mode with cached suggestions
- User-friendly error messages

## Future Enhancements

### Phase 2: Advanced API Integration
1. **Google Places API Integration** - More accurate restaurant locations and details
2. **Nutritionix API Integration** - Comprehensive nutrition database access
3. **Spoonacular API Integration** - Detailed menu items with nutrition
4. **Yelp Fusion API Integration** - Restaurant ratings and reviews

### Phase 3: Web Scraping Implementation
1. **Fast Food Chain Scraping** - McDonald's, Burger King, Subway nutrition pages
2. **Data Caching Strategy** - Store scraped data locally with periodic updates
3. **Rate Limiting** - Implement proper delays to avoid being blocked

### Phase 4: User Experience Enhancements
1. **Dietary Restrictions** - Filter by vegetarian, gluten-free, etc.
2. **Price Filtering** - Budget-conscious suggestions
3. **Delivery Integration** - Direct ordering through DoorDash/Uber Eats
4. **Favorites** - Save preferred restaurants and menu items
5. **Social Features** - Share meal suggestions with friends
6. **ML Recommendations** - Learn user preferences over time