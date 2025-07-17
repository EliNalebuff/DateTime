'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, ArrowLeft, Calendar, MapPin, Clock, Users } from 'lucide-react';
import Button from '@/components/Button';
import StepHeader from '@/components/StepHeader';
import QuestionCard from '@/components/QuestionCard';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import MultiSelectChips from '@/components/MultiSelectChips';
import Toggle from '@/components/Toggle';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import DateCard from '@/components/DateCard';
import { PartnerBData, TimeRange, DateOption } from '@/types';
import Slider from '@/components/Slider';

const TOTAL_STEPS = 4;

export default function PartnerBPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExists, setSessionExists] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>('');

  const [proposedTimeRanges, setProposedTimeRanges] = useState<TimeRange[]>([]);
  const [formData, setFormData] = useState<PartnerBData>({
    email: '',
    selectedTimeRange: '',
    ageRange: '',
    budget: 100,
    splitCosts: true,
    includeFood: true,
    includeDrinks: true,
    dietaryRestrictions: '',
    lovedCuisines: [],
    dislikedCuisines: [],
    vibe: [],
    conversationImportant: true,
    dealbreakers: [],
    customDealbreaker: '',
    alcoholPreference: '',
    publicPrivate: 'public',
    indoorOutdoor: 'either',
    hobbiesInterests: [], // Changed to array
    customHobbies: '', // New field for custom hobbies
    // Personal information (optional)
    sportsTeams: '',
    workDescription: '',
    backgroundInfo: '',
    celebrityFans: '',
    siblings: '',
    roleModels: '',
    travelExperience: '',
    musicPreferences: '',
    culturalBackground: '',
    personalInsight: '',
  });

  const updateFormData = (field: keyof PartnerBData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate hobbies selection for Step 3
    if (currentStep === 3) {
      const customHobbiesCount = formData.customHobbies.trim() ? formData.customHobbies.split(',').filter(h => h.trim()).length : 0;
      const totalHobbiesCount = formData.hobbiesInterests.length + customHobbiesCount;
      
      if (totalHobbiesCount < 3) {
        setError('Please select or add at least 3 hobbies and interests to continue.');
        return;
      }
    }
    
    setError(null);
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const [showDateSelection, setShowDateSelection] = useState(false);
  const [dateOptions, setDateOptions] = useState<any[]>([]);
  const [selectedDateIds, setSelectedDateIds] = useState<string[]>([]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // First, submit Partner B data to generate date ideas
      const response = await fetch(`/api/respond/${uuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partnerBData: formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit response');
      }

      // Show date selection screen
      setDateOptions(data.dateOptions || []);
      setShowDateSelection(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateToggle = (dateId: string) => {
    if (selectedDateIds.includes(dateId)) {
      setSelectedDateIds(selectedDateIds.filter(id => id !== dateId));
    } else if (selectedDateIds.length < 2) {
      setSelectedDateIds([...selectedDateIds, dateId]);
    }
  };

  const handleSubmitSelection = async () => {
    if (selectedDateIds.length !== 2) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/respond/${uuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedDateIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit selection');
      }

      // Show success message
      router.push(`/date-selection-complete/${uuid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.email && formData.selectedTimeRange && formData.ageRange;
      case 2:
        return formData.budget > 0;
      case 3:
        return formData.vibe.length > 0 && formData.alcoholPreference && formData.publicPrivate && formData.indoorOutdoor;
      case 4:
        return true; // Personal info is optional
      default:
        return false;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`/api/date/${uuid}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Session not found');
        }

        if (data.status !== 'initiated') {
          throw new Error('This session has already been completed or is no longer available');
        }

        setSessionExists(true);
        setSessionStatus(data.status);
        setProposedTimeRanges(data.proposedTimeRanges || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setIsLoading(false);
      }
    };

    if (uuid) {
      checkSession();
    }
  }, [uuid]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-romantic flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-romantic flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <ErrorMessage
            message={error}
            onRetry={() => router.push('/')}
          />
        </div>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  // Show date selection screen after form completion
  if (showDateSelection) {
    return (
      <div className="min-h-screen bg-gradient-romantic">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-primary-500 mr-2" fill="currentColor" />
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                  Perfect Date Ideas!
                </h1>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Based on both of your preferences, we've created these amazing date ideas. 
                Choose your 2 favorites to share with your date partner!
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
            >
              {dateOptions.map((date: DateOption) => (
                <DateCard
                  key={date.id}
                  date={date}
                  selected={selectedDateIds.includes(date.id)}
                  onSelect={handleDateToggle}
                  showSelection={true}
                />
              ))}
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center"
            >
              <h3 className="text-lg font-semibold text-primary-800 mb-2">
                Select your 2 favorite date ideas
              </h3>
              <p className="text-primary-700 text-sm mb-4">
                Your partner will choose between these 2 options ({selectedDateIds.length}/2 selected)
              </p>
              
              <Button
                size="lg"
                onClick={handleSubmitSelection}
                disabled={selectedDateIds.length !== 2 || isSubmitting}
                loading={isSubmitting}
                className="w-full md:w-auto"
              >
                Send to Partner
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-primary-500 mr-2" fill="currentColor" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Your Date Invitation
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Someone special wants to plan a date with you! Share your preferences 
              and we'll create the perfect date ideas for both of you.
            </p>
          </motion.div>

          {/* Welcome Card - only show on first step */}
          {currentStep === 1 && (
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-white/20 mb-8"
            >
              <div className="flex items-center justify-center space-x-8 text-center">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary-500" />
                  <span className="text-sm font-medium text-gray-700">Date Planning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-accent-500" />
                  <span className="text-sm font-medium text-gray-700">AI Curated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-secondary-500" />
                  <span className="text-sm font-medium text-gray-700">Personalized</span>
                </div>
              </div>
            </motion.div>
          )}

          <StepHeader
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            title={getStepTitle(currentStep)}
            description={getStepDescription(currentStep)}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {currentStep === 1 && (
                <Step1TimeBasics
                  formData={formData}
                  updateFormData={updateFormData}
                  proposedTimeRanges={proposedTimeRanges}
                />
              )}
              {currentStep === 2 && (
                <Step2BudgetFood
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 3 && (
                <Step3VibePreferences
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 4 && (
                <Step4AboutYourself
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-between items-center mt-8"
          >
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {[...Array(TOTAL_STEPS)].map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index + 1 === currentStep
                      ? 'bg-primary-500'
                      : index + 1 < currentStep
                      ? 'bg-primary-300'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep < TOTAL_STEPS ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="flex items-center"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep) || isSubmitting}
                loading={isSubmitting}
                className="flex items-center"
              >
                Generate Our Date Ideas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return 'Time & Basics';
    case 2:
      return 'Budget & Food';
    case 3:
      return 'Vibe & Preferences';
    case 4:
      return 'About Yourself';
    default:
      return '';
  }
}

function getStepDescription(step: number): string {
  switch (step) {
    case 1:
      return 'Let us know when you\'re available and a bit about yourself';
    case 2:
      return 'Share your budget and food preferences';
    case 3:
      return 'Tell us about your ideal date vibe and preferences';
    case 4:
      return 'Share more about yourself for better date suggestions (optional)';
    default:
      return '';
  }
}

// Step Components
function Step1TimeBasics({ 
  formData, 
  updateFormData, 
  proposedTimeRanges 
}: { 
  formData: PartnerBData; 
  updateFormData: (field: keyof PartnerBData, value: any) => void;
  proposedTimeRanges: TimeRange[];
}) {
  const ageRangeOptions = ['20 and Under', '21-26', '27-32', '33-40', '40+'];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('email', e.target.value);
  };

  // Helper function to determine if a field should be highlighted as required
  const getInputClassName = (value: any, required: boolean = false) => {
    if (required && (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === ''))) {
      return 'form-input-required';
    }
    return 'form-input';
  };

  return (
    <div className="space-y-6">
      <QuestionCard question="What's your email address? *">
        <input
          type="email"
          value={formData.email}
          onChange={handleEmailChange}
          placeholder="you@example.com"
          className={getInputClassName(formData.email, true)}
        />
        <p className="text-xs text-gray-500 mt-1">
          We'll send you updates about your date plans
        </p>
      </QuestionCard>

      <QuestionCard question="Which of these times work for you?">
        <TimeRangeSelector
          proposedTimeRanges={proposedTimeRanges}
          selectedTimeRange={formData.selectedTimeRange}
          onChange={(selectedId) => updateFormData('selectedTimeRange', selectedId)}
        />
      </QuestionCard>

      <QuestionCard question="What's your age range?">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ageRangeOptions.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => updateFormData('ageRange', range)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                formData.ageRange === range
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </QuestionCard>
    </div>
  );
}

function Step2BudgetFood({ 
  formData, 
  updateFormData 
}: { 
  formData: PartnerBData; 
  updateFormData: (field: keyof PartnerBData, value: any) => void;
}) {
  const cuisineOptions = [
    'Italian', 'Mexican', 'Japanese', 'Chinese', 'Indian', 'French', 'Thai', 'Vietnamese', 
    'Korean', 'Mediterranean', 'American', 'Barbecue', 'Pizza', 'Seafood', 'Steakhouse', 'Sushi'
  ];

  return (
    <div className="space-y-6">
      <QuestionCard question="What's your budget for the date?">
        <Slider
          min={10}
          max={500}
          step={10}
          value={formData.budget}
          onChange={(value) => updateFormData('budget', value)}
          label="Estimated total cost"
          formatValue={(value) => `$${value}`}
        />
        <div className="mt-4">
          <Toggle
            checked={formData.splitCosts}
            onChange={(checked) => updateFormData('splitCosts', checked)}
            label="Are you open to splitting costs?"
          />
        </div>
      </QuestionCard>

      <QuestionCard question="Should the date include food or drinks?">
        <div className="space-y-3">
          <Toggle
            checked={formData.includeFood}
            onChange={(checked) => updateFormData('includeFood', checked)}
            label="Include food (e.g., a meal or snacks)"
          />
          <Toggle
            checked={formData.includeDrinks}
            onChange={(checked) => updateFormData('includeDrinks', checked)}
            label="Include drinks (can be alcoholic or non-alcoholic)"
          />
        </div>
      </QuestionCard>

      {formData.includeFood && (
        <>
          <QuestionCard question="Any dietary restrictions or allergies?">
            <input
              type="text"
              value={formData.dietaryRestrictions}
              onChange={(e) => updateFormData('dietaryRestrictions', e.target.value)}
              placeholder="e.g., vegetarian, gluten-free, nut allergy..."
              className="form-input"
            />
          </QuestionCard>

          <QuestionCard question="Which of these types of food do you love?">
            <MultiSelectChips
              options={cuisineOptions}
              selected={formData.lovedCuisines}
              onChange={(selected) => updateFormData('lovedCuisines', selected)}
              placeholder="Select your favorites"
            />
          </QuestionCard>

          <QuestionCard question="Any types of food you'd prefer to avoid?">
            <MultiSelectChips
              options={cuisineOptions}
              selected={formData.dislikedCuisines}
              onChange={(selected) => updateFormData('dislikedCuisines', selected)}
              placeholder="Select cuisines to avoid"
            />
          </QuestionCard>
        </>
      )}
    </div>
  );
}

function Step3VibePreferences({ 
  formData, 
  updateFormData 
}: { 
  formData: PartnerBData; 
  updateFormData: (field: keyof PartnerBData, value: any) => void;
}) {
  const vibeOptions = [
    'Active', 'Conversational', 'Creative', 'Nature', 'Cultural',
    'Interactive', 'Romantic', 'Adventurous', 'Relaxed', 'Unique'
  ];

  const hobbiesOptions = [
    'Reading', 'Writing', 'Photography', 'Cooking', 'Hiking', 'Running', 'Yoga', 'Dancing',
    'Gaming', 'Board Games', 'Music', 'Movies', 'Travel', 'Art', 'Sports', 'Wine Tasting',
    'Coffee', 'Fashion', 'Concerts', 'Museums'
  ];

  const dealbreakerOptions = [
    'No bars', 'No loud places', 'No outdoor walking', 'No crowds',
    'No alcohol', 'No physical activities', 'No late nights', 'No expensive places'
  ];

  return (
    <div className="space-y-6">
      <QuestionCard question="What kind of vibe are you in the mood for?">
        <MultiSelectChips
          options={vibeOptions}
          selected={formData.vibe}
          onChange={(selected) => updateFormData('vibe', selected)}
          maxSelections={3}
          placeholder="Pick 1-3 vibes that match your mood..."
        />
      </QuestionCard>

      <QuestionCard question="What are your hobbies and interests? (Required)">
        <MultiSelectChips
          options={hobbiesOptions}
          selected={formData.hobbiesInterests}
          onChange={(selected) => updateFormData('hobbiesInterests', selected)}
          placeholder="Select your hobbies and interests from the options below..."
        />
        <div className="mt-4">
          <input
            type="text"
            value={formData.customHobbies}
            onChange={(e) => updateFormData('customHobbies', e.target.value)}
            placeholder="Add your own hobbies/interests (comma-separated)..."
            className="form-input"
          />
          <p className="text-xs text-gray-500 mt-1">
            Don't see your hobby? Add it here! Use commas to separate multiple hobbies.
          </p>
        </div>
        {(() => {
          const customHobbiesCount = formData.customHobbies.trim() ? formData.customHobbies.split(',').filter(h => h.trim()).length : 0;
          const totalHobbiesCount = formData.hobbiesInterests.length + customHobbiesCount;
          
          if (totalHobbiesCount < 3) {
            return (
              <p className="text-sm text-red-600 mt-2">
                Please select/add at least 3 hobbies and interests (you have {totalHobbiesCount}/3)
              </p>
            );
          } else {
            return (
              <p className="text-sm text-green-600 mt-2">
                ✓ Great! You have {totalHobbiesCount} hobbies and interests selected
              </p>
            );
          }
        })()}
      </QuestionCard>

      <QuestionCard question="Conversation and atmosphere preferences">
        <div className="space-y-4">
          <Toggle
            checked={formData.conversationImportant}
            onChange={(checked) => updateFormData('conversationImportant', checked)}
            label="Is conversation important?"
            description="Should the setting be conducive to talking?"
          />
        </div>
      </QuestionCard>

      <QuestionCard question="Any absolute dealbreakers?">
        <MultiSelectChips
          options={dealbreakerOptions}
          selected={formData.dealbreakers}
          onChange={(selected) => updateFormData('dealbreakers', selected)}
          placeholder="Select any absolute no-gos..."
        />
        <div className="mt-4">
          <input
            type="text"
            value={formData.customDealbreaker}
            onChange={(e) => updateFormData('customDealbreaker', e.target.value)}
            placeholder="Any other dealbreakers not listed above?"
            className="form-input"
          />
        </div>
      </QuestionCard>

      <QuestionCard question="Alcohol preference?">
        <div className="grid grid-cols-3 gap-3">
          {['Yes, please', 'No, thanks', 'Don\'t mind'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateFormData('alcoholPreference', option)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                formData.alcoholPreference === option
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </QuestionCard>

      <QuestionCard question="Setting preferences">
        <div className="space-y-4">
          <div>
            <label className="form-label">Public or private setting?</label>
            <div className="grid grid-cols-2 gap-3">
              {['Public', 'Private'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateFormData('publicPrivate', option.toLowerCase())}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    formData.publicPrivate === option.toLowerCase()
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Indoor or outdoor?</label>
            <div className="grid grid-cols-3 gap-3">
              {['Indoor', 'Outdoor', 'Either'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateFormData('indoorOutdoor', option.toLowerCase())}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    formData.indoorOutdoor === option.toLowerCase()
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </QuestionCard>
    </div>
  );
}

function Step4AboutYourself({ 
  formData, 
  updateFormData 
}: { 
  formData: PartnerBData; 
  updateFormData: (field: keyof PartnerBData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      {/* About Yourself Section */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center mb-6">
        <h3 className="text-lg font-semibold text-primary-800 mb-2">
          Tell us about yourself (Optional but Recommended!)
        </h3>
        <p className="text-primary-700 text-sm">
          This information helps us create more personalized and engaging date suggestions. 
          Feel free to skip any questions you're not comfortable answering.
        </p>
      </div>

      <QuestionCard question="Do you root for any sports teams? If so, which ones?">
        <input
          type="text"
          value={formData.sportsTeams || ''}
          onChange={(e) => updateFormData('sportsTeams', e.target.value)}
          placeholder="e.g., Lakers, Yankees, Manchester United..."
          className="form-input"
        />
      </QuestionCard>

      <QuestionCard question="What do you do for work?">
        <input
          type="text"
          value={formData.workDescription || ''}
          onChange={(e) => updateFormData('workDescription', e.target.value)}
          placeholder="e.g., Software engineer, Teacher, Student..."
          className="form-input"
        />
      </QuestionCard>

      <QuestionCard question="Where are you from? Where did you go to high school and/or college?">
        <textarea
          value={formData.backgroundInfo || ''}
          onChange={(e) => updateFormData('backgroundInfo', e.target.value)}
          placeholder="Tell us about your hometown, schools, etc..."
          className="form-input min-h-[80px]"
          rows={3}
        />
      </QuestionCard>

      <QuestionCard question="Which celebrities are you a fan of and why?">
        <textarea
          value={formData.celebrityFans || ''}
          onChange={(e) => updateFormData('celebrityFans', e.target.value)}
          placeholder="Share who you admire and what you appreciate about them..."
          className="form-input min-h-[80px]"
          rows={3}
        />
      </QuestionCard>

      <QuestionCard question="Do you have any siblings? How many? Are they younger or older?">
        <input
          type="text"
          value={formData.siblings || ''}
          onChange={(e) => updateFormData('siblings', e.target.value)}
          placeholder="e.g., 2 older brothers, 1 younger sister..."
          className="form-input"
        />
      </QuestionCard>

      <QuestionCard question="Do you have any role models? If so, who are they and why?">
        <textarea
          value={formData.roleModels || ''}
          onChange={(e) => updateFormData('roleModels', e.target.value)}
          placeholder="Tell us about people who inspire you..."
          className="form-input min-h-[80px]"
          rows={3}
        />
      </QuestionCard>

      <QuestionCard question="Do you enjoy traveling? If so, where have you been and where was your favorite place?">
        <textarea
          value={formData.travelExperience || ''}
          onChange={(e) => updateFormData('travelExperience', e.target.value)}
          placeholder="Share your travel experiences and favorite destinations..."
          className="form-input min-h-[80px]"
          rows={3}
        />
      </QuestionCard>

      <QuestionCard question="What kind of music do you like to listen to? Who are your favorite artists?">
        <textarea
          value={formData.musicPreferences || ''}
          onChange={(e) => updateFormData('musicPreferences', e.target.value)}
          placeholder="Tell us about your music taste and favorite artists..."
          className="form-input min-h-[80px]"
          rows={3}
        />
      </QuestionCard>



      <QuestionCard question="What is your ethnic/cultural background?">
        <input
          type="text"
          value={formData.culturalBackground || ''}
          onChange={(e) => updateFormData('culturalBackground', e.target.value)}
          placeholder="e.g., Italian-American, Nigerian, Mixed heritage..."
          className="form-input"
        />
      </QuestionCard>

      <QuestionCard question="What is something about yourself you feel like people don't know or appreciate?">
        <textarea
          value={formData.personalInsight || ''}
          onChange={(e) => updateFormData('personalInsight', e.target.value)}
          placeholder="Share something unique or special about yourself..."
          className="form-input min-h-[80px]"
          rows={3}
        />
      </QuestionCard>
    </div>
  );
} 