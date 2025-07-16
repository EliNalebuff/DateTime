export interface TimeSlot {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // Time string (HH:MM)
  displayText: string; // Human-readable format like "Tuesday, July 15th at 7:00 PM"
}

export interface TimeRange {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // Time string (HH:MM)
  endTime: string; // Time string (HH:MM)
  startPeriod: 'AM' | 'PM';
  endPeriod: 'AM' | 'PM';
  displayText: string; // Human-readable format like "Tuesday, July 15th from 7:00 PM to 9:00 PM"
}

export interface PartnerAData {
  phone: string;
  location: string;
  proposedTimeRanges: TimeRange[]; // Up to 5 specific date/time ranges
  dateDuration: string;
  ageRange: string;
  travelDistance: number;
  budget: number;
  splitCosts: boolean;
  includeFood: boolean;
  includeDrinks: boolean;
  dietaryRestrictions: string;
  lovedCuisines: string[];
  dislikedCuisines: string[];
  vibe: string[];
  conversationImportant: boolean;
  alcoholAvailable: boolean;
  dealbreakers: string[];
  customDealbreaker: string;
  publicPrivate: string;
  indoorOutdoor: string;
  hobbiesInterests: string[]; // Moved from optional to required
  customHobbies: string; // Custom hobbies not in the predefined list
  // Personal information (optional/skippable section)
  sportsTeams?: string;
  workDescription?: string;
  backgroundInfo?: string;
  celebrityFans?: string;
  siblings?: string;
  roleModels?: string;
  travelExperience?: string;
  musicPreferences?: string;
  culturalBackground?: string;
  personalInsight?: string;
}

export interface PartnerBData {
  phone: string;
  selectedTimeRanges: string[]; // IDs of time ranges that work for Person B
  ageRange: string;
  budget: number;
  splitCosts: boolean;
  includeFood: boolean;
  includeDrinks: boolean;
  dietaryRestrictions: string;
  lovedCuisines: string[];
  dislikedCuisines: string[];
  vibe: string[];
  conversationImportant: boolean;
  dealbreakers: string[];
  customDealbreaker: string;
  alcoholPreference: string;
  publicPrivate: string;
  indoorOutdoor: string;
  hobbiesInterests: string[]; // Moved from optional to required
  customHobbies: string; // Custom hobbies not in the predefined list
  // Personal information (optional/skippable section)
  sportsTeams?: string;
  workDescription?: string;
  backgroundInfo?: string;
  celebrityFans?: string;
  siblings?: string;
  roleModels?: string;
  travelExperience?: string;
  musicPreferences?: string;
  culturalBackground?: string;
  personalInsight?: string;
}

export interface DateVenue {
  name: string;
  address: string;
  role: string; // "dinner", "activity", "drinks", etc.
  phoneNumber?: string;
  website?: string;
  mapsUrl?: string;
  estimatedCostForThis?: string;
  distanceFromPrevious?: string;
}

export interface DateOption {
  id: string;
  title: string;
  description: string;
  venues: DateVenue[];
  duration: string;
  estimatedCost: string;
  vibe: string[];
  includesFood: boolean;
  includesDrinks: boolean;
  indoor: boolean;
  public: boolean;
}

export interface DateSession {
  uuid: string;
  partnerA: PartnerAData;
  partnerB?: PartnerBData;
  dateOptions: DateOption[];
  selectedOptions: string[];
  finalChoice?: string;
  status: 'initiated' | 'partner_b_responded' | 'partner_a_selected' | 'finalized';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  uuid?: string;
  shareUrl?: string;
  dateOptions?: DateOption[];
  resultsUrl?: string;
  finalDate?: DateOption;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'toggle' | 'slider' | 'chips' | 'radio' | 'checkbox';
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
}

export interface StepHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description?: string;
}

export interface QuestionCardProps {
  question: string;
  children: any;
  className?: string;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: any;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface MultiSelectChipsProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
}

export interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  formatValue?: (value: number) => string;
}

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export interface DayPickerProps {
  selectedDays: string[];
  onChange: (days: string[]) => void;
  maxSelections?: number;
}

export interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  useLocationButton?: boolean;
}

export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export interface DateCardProps {
  date: DateOption;
  selected?: boolean;
  onSelect?: (dateId: string) => void;
  showSelection?: boolean;
  className?: string;
}

// Icebreaker Game Types
export interface IcebreakerQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  targetPerson: 'A' | 'B';
  askedBy: 'A' | 'B';
  category: string;
  round: number;
  isCustom?: boolean;
}

export interface IcebreakerAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredBy: 'A' | 'B';
  answeredAt: Date;
}

export interface IcebreakerCustomQuestion {
  questionText: string;
  askedBy: 'A' | 'B';
  answeredBy: 'A' | 'B';
  answer: string;
  round: number;
}

export interface IcebreakerFunFact {
  aboutPerson: 'A' | 'B';
  fact: string;
  category: string;
}

export interface IcebreakerGame {
  id: string;
  dateSessionUuid: string;
  gameState: 'scheduled' | 'active' | 'completed' | 'cancelled';
  currentRound: number;
  currentPlayer: 'A' | 'B';
  isCustomQuestionRound: boolean;
  isBonusRound: boolean;
  questions: IcebreakerQuestion[];
  answers: IcebreakerAnswer[];
  customQuestions: IcebreakerCustomQuestion[];
  funFacts: IcebreakerFunFact[];
  scoreA: number;
  scoreB: number;
  scheduledFor?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

// Form validation types
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

// API endpoint types
export interface InitiateResponse {
  success: boolean;
  uuid: string;
  shareUrl: string;
}

export interface RespondResponse {
  success: boolean;
  dateOptions: DateOption[];
  resultsUrl: string;
}

export interface ResultsResponse {
  success: boolean;
  dateOptions: DateOption[];
  selectedOptions: string[];
  finalChoice?: string;
  status: string;
}

export interface SessionResponse {
  success: boolean;
  exists: boolean;
  status: string;
  createdAt: Date;
} 