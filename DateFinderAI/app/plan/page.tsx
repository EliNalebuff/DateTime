'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Copy, Check, ExternalLink } from 'lucide-react';
import Button from '@/components/Button';
import StepHeader from '@/components/StepHeader';
import QuestionCard from '@/components/QuestionCard';
import LocationInput from '@/components/LocationInput';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import MultiSelectChips from '@/components/MultiSelectChips';
import Toggle from '@/components/Toggle';
import Slider from '@/components/Slider';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { PartnerAData } from '@/types';

const TOTAL_STEPS = 4;

export default function PlanPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<PartnerAData>({
    location: '',
    proposedTimes: [],
    dateDuration: '',
    travelDistance: 10,
    budget: 100,
    splitCosts: true,
    includeFood: true,
    includeDrinks: true,
    dietaryRestrictions: '',
    lovedCuisines: [],
    dislikedCuisines: [],
    vibe: [],
    physicalTouch: '',
    conversationImportant: true,
    alcoholAvailable: true,
    dealbreakers: [],
    publicPrivate: 'public',
    indoorOutdoor: 'either',
  });

  const updateFormData = (field: keyof PartnerAData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
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
      const response = await fetch('/api/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        return formData.location && formData.proposedTimes.length > 0 && formData.dateDuration;
      case 2:
        return formData.budget > 0;
      case 3:
        return formData.vibe.length > 0 && formData.physicalTouch;
      default:
        return true;
    }
  };

  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.3 } },
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
      return 'Review & Generate';
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
      return 'Review your answers and create your shareable link';
    default:
      return '';
  }
}

// Step Components
function Step1LocationTime({ formData, updateFormData }: { formData: PartnerAData; updateFormData: (field: keyof PartnerAData, value: any) => void }) {
  const durationOptions = ['1-2 hours', '2-3 hours', '3-4 hours', '4+ hours'];

  return (
    <div className="space-y-6">
      <QuestionCard question="Where should we plan the date?">
        <LocationInput
          value={formData.location}
          onChange={(value) => updateFormData('location', value)}
          placeholder="Enter city, neighborhood, or address..."
          useLocationButton
        />
      </QuestionCard>

      <QuestionCard question="When are you available for this date?">
        <TimeSlotPicker
          selectedSlots={formData.proposedTimes}
          onChange={(slots) => updateFormData('proposedTimes', slots)}
          maxSlots={5}
        />
      </QuestionCard>

      <QuestionCard question="How long should the date last?">
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

  const dealbreakerOptions = [
    'No bars', 'No loud places', 'No outdoor walking', 'No crowds',
    'No alcohol', 'No physical activities', 'No late nights', 'No expensive places'
  ];

  const physicalTouchOptions = ['Yes', 'No', 'Unsure'];

  return (
    <div className="space-y-6">
      <QuestionCard question="What vibe are you in the mood for?">
        <MultiSelectChips
          options={vibeOptions}
          selected={formData.vibe}
          onChange={(selected) => updateFormData('vibe', selected)}
          maxSelections={3}
          placeholder="Pick 1-3 vibes that match your mood..."
        />
      </QuestionCard>

      <QuestionCard question="Is physical touch likely?">
        <div className="grid grid-cols-3 gap-3">
          {physicalTouchOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateFormData('physicalTouch', option)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                formData.physicalTouch === option
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
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

function Step4Review({ formData, onSubmit, isSubmitting, error }: { 
  formData: PartnerAData; 
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
      <QuestionCard question="Review your preferences">
        <div className="space-y-4 text-left">
          <div>
            <h4 className="font-semibold text-gray-800">Location & Timing</h4>
            <p className="text-sm text-gray-600">
              📍 {formData.location} • ⏱️ {formData.dateDuration}
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500">Proposed times:</p>
              {formData.proposedTimes.map((slot, index) => (
                <p key={slot.id} className="text-xs text-gray-600">
                  {index + 1}. {slot.displayText}
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
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800">Vibe</h4>
            <p className="text-sm text-gray-600">
              {formData.vibe.join(', ')} • 
              {formData.indoorOutdoor === 'either' ? 'Indoor/Outdoor' : formData.indoorOutdoor} • 
              {formData.publicPrivate}
            </p>
          </div>
        </div>
      </QuestionCard>

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary-800 mb-2">
          Ready to generate your shareable link?
        </h3>
        <p className="text-primary-700 text-sm mb-4">
          Your answers will be used to create 3 perfect date ideas once your partner responds.
          They won't see your individual answers - only the final curated options.
        </p>
        
        {isSubmitting ? (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Creating your link...</span>
          </div>
        ) : (
          <Button
            size="lg"
            onClick={onSubmit}
            className="w-full"
          >
            Generate Shareable Link
          </Button>
        )}
      </div>
    </div>
  );
} 