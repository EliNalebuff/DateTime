export interface DateAnswers {
  // Step 1: Location & Timing
  location: string;
  availableDays: string[];
  preferredTime: 'Morning' | 'Afternoon' | 'Evening' | 'Late Night';
  duration: '1-2 hrs' | '2-4 hrs' | 'full evening';
  travelDistance: number; // miles
  
  // Step 2: Budget & Food
  budget: number;
  splitCosts: boolean;
  includeFood: boolean;
  includeDrinks: boolean;
  dietaryRestrictions: string;
  cuisinePreferences: string[];
  
  // Step 3: Date Preferences
  dateTypes: string[]; // Active, Conversational, Interactive, Creative, Nature, Cultural
  physicalTouch: 'Yes' | 'No' | 'Unsure';
  conversationImportant: boolean;
  alcoholAvailable: boolean;
  dealbreakers: string[];
  settingPreference: 'Public' | 'Private';
  indoorOutdoor: 'Indoor' | 'Outdoor' | 'Either';
}

export interface NavigationProps {
  navigation: any;
  route: any;
} 