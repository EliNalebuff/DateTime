'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Copy, Check, ExternalLink } from 'lucide-react';
import Button from '@/components/Button';
import StepHeader from '@/components/StepHeader';
import QuestionCard from '@/components/QuestionCard';
import LocationInput from '@/components/LocationInput';
import TimeRangePicker from '@/components/TimeRangePicker';
import MultiSelectChips from '@/components/MultiSelectChips';
import Toggle from '@/components/Toggle';
import Slider from '@/components/Slider';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { PartnerAData } from '@/types';

const TOTAL_STEPS = 5;

export default function PlanPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<PartnerAData>({
    email: '',
    location: '',
    proposedTimeRanges: [],
    dateDuration: '',
    ageRange: '',
    travelDistance: 10,
    budget: 100,
    splitCosts: true,
    includeFood: true,
    includeDrinks: true,
    dietaryRestrictions: '',
    lovedCuisines: [],
    dislikedCuisines: [],
    vibe: [],
    conversationImportant: true,
    alcoholAvailable: true,
    dealbreakers: [],
    customDealbreaker: '',
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

  const updateFormData = (field: keyof PartnerAData, value: any) => {
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch('/api/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create date session');
      }

      setShareUrl(data.shareUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.email && formData.location && formData.proposedTimeRanges.length > 0 && formData.dateDuration && formData.ageRange;
      case 2:
        return formData.budget > 0;
      case 3:
        return formData.vibe.length > 0;
      case 4:
        return true; // Review step is always valid
      case 5:
        return true; // About yourself step is optional, so always valid
      default:
        return true;
    }
  };

  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  };

  if (shareUrl) {
    return (
      <div className="min-h-screen bg-gradient-romantic flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Link Created Successfully!
            </h1>
            <p className="text-gray-600 mb-8">
              Send this link to your date partner to get their input and generate your perfect date ideas.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
                />
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex items-center space-x-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                onClick={handleCopyLink}
                className="w-full"
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy Link to Share
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/')}
                className="w-full"
              >
                Create Another Date
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
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
                <Step1LocationTime
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 2 && (
                <Step2BudgetFood
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 3 && (
                <Step3Preferences
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 4 && (
                <Step4Review
                  formData={formData}
                />
              )}
              {currentStep === 5 && (
                <Step5AboutYourself
                  formData={formData}
                  updateFormData={updateFormData}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  error={error}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? () => router.push('/') : handlePrevious}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Back to Home' : 'Previous'}
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                Generate Link
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return 'Location & Timing';
    case 2:
      return 'Budget & Food';
    case 3:
      return 'Preferences & Vibe';
    case 4:
      return 'Review Your Info';
    case 5:
      return 'About Yourself';
    default:
      return '';
  }
}

function getStepDescription(step: number): string {
  switch (step) {
    case 1:
      return 'Tell us where and when you\'d like to meet';
    case 2:
      return 'Set your budget and food preferences';
    case 3:
      return 'Share your ideal date vibe and preferences';
    case 4:
      return 'Review your answers before the final step';
    case 5:
      return 'Share more about yourself for better date suggestions (optional)';
    default:
      return '';
  }
}

// Step Components
function Step1LocationTime({ formData, updateFormData }: { formData: PartnerAData; updateFormData: (field: keyof PartnerAData, value: any) => void }) {
  const durationOptions = ['1-2 hours', '2-3 hours', '3-4 hours', '4+ hours'];
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
      <QuestionCard 
        question="What's your email address? *"
        required={true}
        isEmpty={!formData.email?.trim()}
      >
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

      <QuestionCard 
        question="Where should we plan the date? *"
        required={true}
        isEmpty={!formData.location?.trim()}
      >
        <LocationInput
          value={formData.location}
          onChange={(value) => updateFormData('location', value)}
          placeholder="Enter city, neighborhood, or address..."
          useLocationButton
          required={true}
          isEmpty={!formData.location?.trim()}
        />
      </QuestionCard>

      <QuestionCard 
        question="What's your age range? *"
        required={true}
        isEmpty={!formData.ageRange}
      >
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
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

      <QuestionCard 
        question="When are you available for this date? *"
        required={true}
        isEmpty={formData.proposedTimeRanges.length === 0}
      >
        <TimeRangePicker
          selectedRanges={formData.proposedTimeRanges}
          onChange={(ranges) => updateFormData('proposedTimeRanges', ranges)}
          maxRanges={5}
        />
      </QuestionCard>

      <QuestionCard 
        question="How long should the date last? *"
        required={true}
        isEmpty={!formData.dateDuration}
      >
        <div className="grid grid-cols-2 gap-3">
          {durationOptions.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => updateFormData('dateDuration', duration)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                formData.dateDuration === duration
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {duration}
            </button>
          ))}
        </div>
      </QuestionCard>

      <QuestionCard question="How far would you travel?">
        <Slider
          min={5}
          max={50}
          step={5}
          value={formData.travelDistance}
          onChange={(value) => updateFormData('travelDistance', value)}
          label="Maximum distance"
          formatValue={(value) => `${value} miles`}
        />
      </QuestionCard>
    </div>
  );
}

function Step2BudgetFood({ formData, updateFormData }: { formData: PartnerAData; updateFormData: (field: keyof PartnerAData, value: any) => void }) {
  const cuisineOptions = [
    'Italian', 'Mexican', 'Japanese', 'Chinese', 'Indian', 'French', 'Thai', 'Vietnamese', 
    'Korean', 'Mediterranean', 'American', 'Barbecue', 'Pizza', 'Seafood', 'Steakhouse', 'Sushi'
  ];

  return (
    <div className="space-y-6">
      <QuestionCard 
        question="What's your budget for the date? *"
        required={true}
        isEmpty={formData.budget <= 0}
      >
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
          <QuestionCard question="Any dietary needs or restrictions?">
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

          <QuestionCard question="Any of these you’re not really into?">
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

function Step3Preferences({ formData, updateFormData }: { formData: PartnerAData; updateFormData: (field: keyof PartnerAData, value: any) => void }) {
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
      <QuestionCard 
        question="What vibe are you in the mood for? *"
        required={true}
        isEmpty={formData.vibe.length === 0}
      >
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
          <Toggle
            checked={formData.alcoholAvailable}
            onChange={(checked) => updateFormData('alcoholAvailable', checked)}
            label="Do you want alcohol available?"
            description="Should alcohol be an option during the date?"
          />
        </div>
      </QuestionCard>

      <QuestionCard question="Any dealbreakers?">
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
            placeholder="Add your own custom dealbreaker..."
            className="form-input"
          />
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

function Step4Review({ formData }: { 
  formData: PartnerAData;
}) {
  return (
    <div className="space-y-6">
      <QuestionCard question="Review your preferences">
        <div className="space-y-4 text-left">
          <div>
            <h4 className="font-semibold text-gray-800">Location & Timing</h4>
            <p className="text-sm text-gray-600">
              📍 {formData.location} • ⏱️ {formData.dateDuration} • 👤 Age: {formData.ageRange}
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500">Proposed times:</p>
              {formData.proposedTimeRanges.map((range, index) => (
                <p key={range.id} className="text-xs text-gray-600">
                  {index + 1}. {range.displayText}
                </p>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800">Budget & Food</h4>
            <p className="text-sm text-gray-600">
              💰 ${formData.budget} • 
              {formData.includeFood ? ' 🍽️ Food' : ''} • 
              {formData.includeDrinks ? ' 🍷 Drinks' : ''}
            </p>
            {formData.lovedCuisines.length > 0 && (
              <p className="text-sm text-gray-600">
                ✅ Likes: {formData.lovedCuisines.join(', ')}
              </p>
            )}
            {formData.dislikedCuisines.length > 0 && (
              <p className="text-sm text-gray-600">
                ❌ Avoid: {formData.dislikedCuisines.join(', ')}
              </p>
            )}
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800">Vibe & Preferences</h4>
            <p className="text-sm text-gray-600">
              {formData.vibe.join(', ')} • 
              {formData.indoorOutdoor === 'either' ? 'Indoor/Outdoor' : formData.indoorOutdoor} • 
              {formData.publicPrivate}
            </p>
            {formData.dealbreakers.length > 0 && (
              <p className="text-sm text-gray-600">
                🚫 Dealbreakers: {formData.dealbreakers.join(', ')}
                {formData.customDealbreaker && `, ${formData.customDealbreaker}`}
              </p>
            )}
          </div>
        </div>
      </QuestionCard>
      
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <p className="text-blue-700 text-sm">
          Everything looks good? Continue to the final step to share more about yourself and generate your date link!
        </p>
      </div>
    </div>
  );
}

function Step5AboutYourself({ formData, updateFormData, onSubmit, isSubmitting, error }: { 
  formData: PartnerAData; 
  updateFormData: (field: keyof PartnerAData, value: any) => void;
  onSubmit: () => void; 
  isSubmitting: boolean; 
  error: string | null; 
}) {
  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={onSubmit}
      />
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-primary-800 mb-2">
          Ready to create your perfect date?
        </h3>
        <p className="text-primary-700 text-sm mb-6">
          We'll use all your preferences to create a personalized shareable link for your date partner.
        </p>
        
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
          className="w-full"
        >
          Generate My Date Link
        </Button>
      </div>
    </div>
  );
} 