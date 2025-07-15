'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import Button from '@/components/Button';
import DateCard from '@/components/DateCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { DateOption } from '@/types';

export default function FinalChoicePage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [finalDate, setFinalDate] = useState<DateOption | null>(null);

  useEffect(() => {
    const fetchFinalChoiceOptions = async () => {
      try {
        const response = await fetch(`/api/final-choice/${uuid}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load final choice options');
        }

        setSelectedDates(data.selectedDates || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load options');
      } finally {
        setIsLoading(false);
      }
    };

    if (uuid) {
      fetchFinalChoiceOptions();
    }
  }, [uuid]);

  const handleDateSelect = (dateId: string) => {
    setSelectedChoice(dateId);
  };

  const handleSubmitChoice = async () => {
    if (!selectedChoice) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/final-choice/${uuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ finalChoice: selectedChoice }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit final choice');
      }

      setFinalDate(data.finalDate);
      setIsComplete(true);
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
          <p className="mt-4 text-gray-600">Loading your date options...</p>
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

  if (isComplete && finalDate) {
    return (
      <div className="min-h-screen bg-gradient-romantic">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                  Perfect Choice!
                </h1>
                <Heart className="h-12 w-12 text-primary-500 ml-3" fill="currentColor" />
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Your date is confirmed! Both you and your partner have been notified via SMS.
              </p>
            </motion.div>

            <div className="max-w-2xl mx-auto mb-8">
              <DateCard
                date={finalDate}
                selected={true}
                showSelection={false}
                className="ring-2 ring-green-500 border-green-500"
              />
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Ready to plan another date?
              </h3>
              <Button
                onClick={() => router.push('/')}
                className="w-full md:w-auto"
              >
                Create Another Date
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
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
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-accent-500 mr-2" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Choose Your Perfect Date
              </h1>
              <Heart className="h-8 w-8 text-primary-500 ml-2" fill="currentColor" />
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your partner has narrowed it down to these 2 amazing options. 
              Which one sounds perfect to you?
            </p>
          </motion.div>

          {selectedDates.length > 0 ? (
            <>
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="grid md:grid-cols-2 gap-6 mb-8"
              >
                {selectedDates.map((date) => (
                  <DateCard
                    key={date.id}
                    date={date}
                    selected={selectedChoice === date.id}
                    onSelect={handleDateSelect}
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
                  Ready to confirm your choice?
                </h3>
                <p className="text-primary-700 text-sm mb-4">
                  Both you and your partner will receive SMS confirmation with all the details.
                </p>
                
                <Button
                  size="lg"
                  onClick={handleSubmitChoice}
                  disabled={!selectedChoice || isSubmitting}
                  loading={isSubmitting}
                  className="w-full md:w-auto"
                >
                  This is the one!
                  <Heart className="ml-2 h-5 w-5" fill="currentColor" />
                </Button>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No date options available.</p>
              <Button
                variant="secondary"
                onClick={() => router.push('/')}
                className="mt-4"
              >
                Start Over
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 