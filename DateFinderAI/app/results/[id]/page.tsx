'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, CheckCircle, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import Button from '@/components/Button';
import DateCard from '@/components/DateCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { DateOption } from '@/types';

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [finalChoice, setFinalChoice] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'partner_a_select' | 'partner_b_select' | 'finalized'>('partner_a_select');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/results/${uuid}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load results');
        }

        setDateOptions(data.dateOptions || []);
        setSelectedOptions(data.selectedOptions || []);
        setFinalChoice(data.finalChoice);
        setSessionStatus(data.status);

        // Determine current step based on session status
        if (data.status === 'partner_b_responded') {
          setCurrentStep('partner_a_select');
        } else if (data.status === 'partner_a_selected') {
          setCurrentStep('partner_b_select');
        } else if (data.status === 'finalized') {
          setCurrentStep('finalized');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setIsLoading(false);
      }
    };

    if (uuid) {
      fetchResults();
    }
  }, [uuid]);

  const handlePartnerASelect = async (selectedIds: string[]) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/select/${uuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedOptions: selectedIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to select options');
      }

      setSelectedOptions(selectedIds);
      setCurrentStep('partner_b_select');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartnerBSelect = async (choiceId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/finalize/${uuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ finalChoice: choiceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to finalize choice');
      }

      setFinalChoice(choiceId);
      setCurrentStep('finalized');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-romantic flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your perfect date ideas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-romantic flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-accent-500 mr-2" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Your Perfect Date Ideas
              </h1>
              <Heart className="h-8 w-8 text-primary-500 ml-2" fill="currentColor" />
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {getStepDescription(currentStep)}
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            variants={fadeInUp}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-2 ${
                currentStep === 'partner_a_select' ? 'text-primary-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'partner_a_select' ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  {currentStep !== 'partner_a_select' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold">1</span>
                  )}
                </div>
                <span className="text-sm font-medium">Partner A Selects</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${
                currentStep === 'partner_b_select' ? 'text-primary-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'partner_b_select' ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  {currentStep === 'finalized' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold">2</span>
                  )}
                </div>
                <span className="text-sm font-medium">Partner B Chooses</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${
                currentStep === 'finalized' ? 'text-green-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 'finalized' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {currentStep === 'finalized' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold">3</span>
                  )}
                </div>
                <span className="text-sm font-medium">Date Confirmed</span>
              </div>
            </div>
          </motion.div>

          {/* Date Options */}
          <motion.div
            variants={fadeInUp}
            className="space-y-6"
          >
            {currentStep === 'partner_a_select' && (
              <PartnerASelection
                dateOptions={dateOptions}
                onSelect={handlePartnerASelect}
                isSubmitting={isSubmitting}
              />
            )}

            {currentStep === 'partner_b_select' && (
              <PartnerBSelection
                dateOptions={dateOptions.filter(option => selectedOptions.includes(option.id))}
                onSelect={handlePartnerBSelect}
                isSubmitting={isSubmitting}
              />
            )}

            {currentStep === 'finalized' && (
              <FinalizedSelection
                dateOptions={dateOptions}
                finalChoice={finalChoice}
                onCreateAnother={() => router.push('/')}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function getStepDescription(step: string): string {
  switch (step) {
    case 'partner_a_select':
      return 'Choose your 2 favorite options from the AI-generated date ideas below';
    case 'partner_b_select':
      return 'Your partner has narrowed it down to 2 options. Pick your favorite!';
    case 'finalized':
      return 'Perfect! Your date is confirmed. Time to make some memories!';
    default:
      return '';
  }
}

function PartnerASelection({ 
  dateOptions, 
  onSelect, 
  isSubmitting 
}: { 
  dateOptions: DateOption[];
  onSelect: (selectedIds: string[]) => void;
  isSubmitting: boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = (dateId: string) => {
    if (selectedIds.includes(dateId)) {
      setSelectedIds(selectedIds.filter(id => id !== dateId));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, dateId]);
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length === 2) {
      onSelect(selectedIds);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dateOptions.map((date) => (
          <DateCard
            key={date.id}
            date={date}
            selected={selectedIds.includes(date.id)}
            onSelect={handleToggleSelect}
            showSelection={true}
          />
        ))}
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-primary-800 mb-2">
          Select 2 favorites to share with your partner
        </h3>
        <p className="text-primary-700 text-sm mb-4">
          Choose the 2 date ideas you're most excited about ({selectedIds.length}/2 selected)
        </p>
        
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={selectedIds.length !== 2 || isSubmitting}
          loading={isSubmitting}
          className="w-full md:w-auto"
        >
          Send to Partner
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function PartnerBSelection({ 
  dateOptions, 
  onSelect, 
  isSubmitting 
}: { 
  dateOptions: DateOption[];
  onSelect: (choiceId: string) => void;
  isSubmitting: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (dateId: string) => {
    setSelectedId(dateId);
  };

  const handleSubmit = () => {
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
        {dateOptions.map((date) => (
          <DateCard
            key={date.id}
            date={date}
            selected={selectedId === date.id}
            onSelect={handleSelect}
            showSelection={true}
          />
        ))}
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-primary-800 mb-2">
          Choose your final date!
        </h3>
        <p className="text-primary-700 text-sm mb-4">
          Your partner has selected these 2 options. Which one sounds perfect to you?
        </p>
        
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!selectedId || isSubmitting}
          loading={isSubmitting}
          className="w-full md:w-auto"
        >
          This is the one!
          <Heart className="ml-2 h-5 w-5" fill="currentColor" />
        </Button>
      </div>
    </div>
  );
}

function FinalizedSelection({ 
  dateOptions, 
  finalChoice, 
  onCreateAnother 
}: { 
  dateOptions: DateOption[];
  finalChoice: string | null;
  onCreateAnother: () => void;
}) {
  const selectedDate = dateOptions.find(date => date.id === finalChoice);

  if (!selectedDate) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Date not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Your Date is Confirmed!
          </h2>
          <p className="text-green-700">
            Both partners have agreed on the perfect date idea. Time to make it happen!
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <DateCard
          date={selectedDate}
          selected={true}
          showSelection={false}
          className="ring-2 ring-green-500 border-green-500"
        />
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Ready to plan another date?
        </h3>
        <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
          <Button
            variant="secondary"
            onClick={onCreateAnother}
            className="w-full md:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Create Another Date
          </Button>
          <Button
            variant="primary"
            onClick={() => window.location.href = `https://www.google.com/search?q=${encodeURIComponent(selectedDate.location)}`}
            className="w-full md:w-auto"
          >
            Find Location Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 