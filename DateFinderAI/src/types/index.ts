export interface PartnerAData {
  location: string;
  availableDays: string[];
  preferredTime: string;
  dateDuration: string;
  travelDistance: number;
  budget: number;
  splitCosts: boolean;
  includeFood: boolean;
  includeDrinks: boolean;
  dietaryRestrictions: string;
  cuisinePreferences: string[];
  vibe: string[];
  physicalTouch: string;
  conversationImportant: boolean;
  alcoholAvailable: boolean;
  dealbreakers: string[];
  publicPrivate: string;
  indoorOutdoor: string;
}

export interface PartnerBData {
  availableDays: string[];
  preferredTime: string;
  dietaryRestrictions: string;
  cuisinePreferences: string[];
  vibe: string[];
  dealbreakers: string[];
  alcoholPreference: string;
  publicPrivate: string;
  indoorOutdoor: string;
}

export interface DateOption {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  cost: string;
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