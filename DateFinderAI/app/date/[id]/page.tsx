'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Calendar, MapPin, Clock, Users } from 'lucide-react';
import Button from '@/components/Button';
import QuestionCard from '@/components/QuestionCard';
import TimeRangeSelector from '@/components/TimeRangeSelector';
import MultiSelectChips from '@/components/MultiSelectChips';
import Toggle from '@/components/Toggle';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { PartnerBData, TimeRange } from '@/types';
import Slider from '@/components/Slider';

export default function PartnerBPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExists, setSessionExists] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>('');

  const [proposedTimeRanges, setProposedTimeRanges] = useState<TimeRange[]>([]);
  const [formData, setFormData] = useState<PartnerBData>({
    selectedTimeRanges: [],
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
    // Personal information (optional)
    sportsTeams: '',
    workDescription: '',
    backgroundInfo: '',
    celebrityFans: '',
    siblings: '',
    roleModels: '',
    travelExperience: '',
    musicPreferences: '',
    hobbiesInterests: '',
    culturalBackground: '',
    personalInsight: '',
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
      formData.selectedTimeRanges.length > 0 &&
      formData.ageRange &&
      formData.budget > 0 &&
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
    animate: { opacity: 1, y: 0 }
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
            transition={{ duration: 0.6 }}
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

          {/* Form */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <QuestionCard question="Which of these times work for you?">
              <TimeRangeSelector
                proposedTimeRanges={proposedTimeRanges}
                selectedTimeRanges={formData.selectedTimeRanges}
                onChange={(selectedIds) => updateFormData('selectedTimeRanges', selectedIds)}
              />
            </QuestionCard>

            <QuestionCard question="What's your age range?">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                {['20 and under', '21-28', '29-39', '40+'].map((range) => (
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
                    options={[
                      'Italian', 'Mexican', 'Japanese', 'Chinese', 'Indian', 'French', 'Thai', 'Vietnamese', 
                      'Korean', 'Mediterranean', 'American', 'Barbecue', 'Pizza', 'Seafood', 'Steakhouse', 'Sushi'
                    ]}
                    selected={formData.lovedCuisines}
                    onChange={(selected) => updateFormData('lovedCuisines', selected)}
                    placeholder="Select your favorites"
                  />
                </QuestionCard>

                <QuestionCard question="Any types of food you'd prefer to avoid?">
                  <MultiSelectChips
                    options={[
                      'Italian', 'Mexican', 'Japanese', 'Chinese', 'Indian', 'French', 'Thai', 'Vietnamese', 
                      'Korean', 'Mediterranean', 'American', 'Barbecue', 'Pizza', 'Seafood', 'Steakhouse', 'Sushi'
                    ]}
                    selected={formData.dislikedCuisines}
                    onChange={(selected) => updateFormData('dislikedCuisines', selected)}
                    placeholder="Select cuisines to avoid"
                  />
                </QuestionCard>
              </>
            )}

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
                options={[
                  'No bars', 'No loud places', 'No outdoor walking', 'No crowds',
                  'No alcohol', 'No physical activities', 'No late nights', 'No expensive places'
                ]}
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

            <QuestionCard question="What are your hobbies and interests?">
              <textarea
                value={formData.hobbiesInterests || ''}
                onChange={(e) => updateFormData('hobbiesInterests', e.target.value)}
                placeholder="Share what you love to do in your free time..."
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