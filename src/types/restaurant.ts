export interface Restaurant {
  id: string;
  name: string;
  address: string;
  distance: number;
  cuisine: string;
  rating?: number;
  priceLevel?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  restaurantId: string;
  restaurantName: string;
  estimatedDeliveryTime?: string;
  macroFitScore?: number;
}

export interface MacroTargets {
  calories: { min: number; max: number };
  protein: { min: number; max: number };
  carbs: { min: number; max: number };
  fat: { min: number; max: number };
}

export interface RestaurantSearchResult {
  menuItems: MenuItem[];
  searchQuery: string;
  location: string;
  timestamp: Date;
}