'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Calendar, MapPin, Clock, Users } from 'lucide-react';
import Button from '@/components/Button';
import QuestionCard from '@/components/QuestionCard';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import MultiSelectChips from '@/components/MultiSelectChips';
import Toggle from '@/components/Toggle';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { PartnerBData, TimeSlot } from '@/types';

export default function PartnerBPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExists, setSessionExists] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>('');

  const [proposedTimes, setProposedTimes] = useState<TimeSlot[]>([]);
  const [formData, setFormData] = useState<PartnerBData>({
    selectedTimeSlots: [],
    dietaryRestrictions: '',
    lovedCuisines: [],
    dislikedCuisines: [],
    vibe: [],
    dealbreakers: [],
    alcoholPreference: '',
    publicPrivate: 'public',
    indoorOutdoor: 'either',
  });

  const updateFormData = (field: keyof PartnerBData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        setProposedTimes(data.proposedTimes || []);
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/respond/${uuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit response');
      }

      // Redirect to results page
      router.push(`/results/${uuid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.selectedTimeSlots.length > 0 &&
      formData.vibe.length > 0 &&
      formData.alcoholPreference &&
      formData.publicPrivate &&
      formData.indoorOutdoor
    );
  };

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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-primary-500 mr-2" fill="currentColor" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Your Date Invitation
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Someone special wants to plan a date with you! Share your preferences 
              below and we'll create the perfect date ideas for both of you.
            </p>
          </motion.div>

          {/* Welcome Card */}
          <motion.div
            variants={fadeInUp}
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

          {/* Form */}
          <motion.div
            variants={fadeInUp}
            className="space-y-6"
          >
            <QuestionCard question="Which of these times work for you?">
              <TimeSlotSelector
                proposedTimes={proposedTimes}
                selectedTimeSlots={formData.selectedTimeSlots}
                onChange={(selectedIds) => updateFormData('selectedTimeSlots', selectedIds)}
              />
            </QuestionCard>

            <QuestionCard question="Any dietary restrictions or allergies?">
              <input
                type="text"
                value={formData.dietaryRestrictions}
                onChange={(e) => updateFormData('dietaryRestrictions', e.target.value)}
                placeholder="e.g., vegetarian, gluten-free, nut allergy..."
                className="form-input"
              />
            </QuestionCard>

            <QuestionCard question="What cuisines do you enjoy?">
              <MultiSelectChips
                options={[
                  'Italian', 'Mexican', 'Asian', 'American', 'Mediterranean',
                  'Indian', 'Thai', 'French', 'Japanese', 'Greek', 'Vegetarian', 'Seafood'
                ]}
                selected={formData.lovedCuisines}
                onChange={(selected) => updateFormData('lovedCuisines', selected)}
                placeholder="Select your favorite cuisines..."
              />
            </QuestionCard>

            <QuestionCard question="What kind of vibe are you in the mood for?">
              <MultiSelectChips
                options={[
                  'Active', 'Conversational', 'Creative', 'Nature', 'Cultural',
                  'Interactive', 'Romantic', 'Adventurous', 'Relaxed', 'Unique'
                ]}
                selected={formData.vibe}
                onChange={(selected) => updateFormData('vibe', selected)}
                maxSelections={3}
                placeholder="Pick 1-3 vibes that match your mood..."
              />
            </QuestionCard>

            <QuestionCard question="Any absolute dealbreakers?">
              <MultiSelectChips
                options={[
                  'No bars', 'No loud places', 'No outdoor walking', 'No crowds',
                  'No alcohol', 'No physical activities', 'No late nights', 'No expensive places'
                ]}
                selected={formData.dealbreakers}
                onChange={(selected) => updateFormData('dealbreakers', selected)}
                placeholder="Select any absolute no-gos..."
              />
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

            {/* Submit Section */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-primary-800 mb-2">
                Ready to see your date options?
              </h3>
              <p className="text-primary-700 text-sm mb-6">
                We'll combine your preferences with your date partner's to create 
                3 perfect date ideas you'll both love!
              </p>
              
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                loading={isSubmitting}
                className="w-full md:w-auto"
              >
                Generate Our Date Ideas
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 