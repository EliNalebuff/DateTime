'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, CheckCircle, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  targetPerson: 'A' | 'B';
  askedBy: 'A' | 'B';
  category: string;
  round: number;
}

interface Answer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredBy: 'A' | 'B';
  answeredAt: Date;
}

interface FunFact {
  aboutPerson: 'A' | 'B';
  fact: string;
  category: string;
}

interface GameState {
  id: string;
  gameState: 'scheduled' | 'active' | 'completed' | 'cancelled';
  currentRound: number;
  currentPlayer: 'A' | 'B';
  isCustomQuestionRound: boolean;
  isBonusRound: boolean;
  questions: Question[];
  answers: Answer[];
  customQuestions: any[];
  funFacts: FunFact[];
  scoreA: number;
  scoreB: number;
  startedAt?: Date;
  completedAt?: Date;
}

export default function IcebreakerGamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [playerRole, setPlayerRole] = useState<'A' | 'B'>('A'); // In real app, this would be determined by auth

  useEffect(() => {
    fetchGame();
  }, [gameId]);

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/icebreaker/${gameId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load game');
      }

      setGame(data.game);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
    } finally {
      setIsLoading(false);
    }
  };

  const startGame = async () => {
    try {
      const response = await fetch(`/api/icebreaker/${gameId}/start`, {
        method: 'POST',
      });
      
      if (response.ok) {
        await fetchGame();
      }
    } catch (err) {
      console.error('Error starting game:', err);
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !game) return;

    setIsSubmitting(true);
    try {
      const currentQuestion = game.questions[currentQuestionIndex];
      
      const response = await fetch(`/api/icebreaker/${gameId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedAnswer,
          player: playerRole
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Show results for this question
        setShowResults(true);
        
        // Refresh game state
        await fetchGame();
        
        // Auto-advance after 3 seconds
        setTimeout(() => {
          setShowResults(false);
          setSelectedAnswer('');
          
          if (currentQuestionIndex < game.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
          } else {
            // Game completed
            completeGame();
          }
        }, 3000);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeGame = async () => {
    try {
      const response = await fetch(`/api/icebreaker/${gameId}/complete`, {
        method: 'POST',
      });
      
      if (response.ok) {
        await fetchGame();
      }
    } catch (err) {
      console.error('Error completing game:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-romantic flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your icebreaker game...</p>
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

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-romantic flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p>Game not found</p>
        </div>
      </div>
    );
  }

  const currentQuestion = game.questions[currentQuestionIndex];
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  // Game not started yet
  if (game.gameState === 'scheduled') {
    return (
      <div className="min-h-screen bg-gradient-romantic flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-primary-600" fill="currentColor" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Icebreaker Game Ready!
            </h1>
            <p className="text-gray-600 mb-8">
              Get to know each other better with this fun guessing game. 
              Answer questions about your date partner and see how well you know each other!
            </p>
            
            <Button
              size="lg"
              onClick={startGame}
              className="w-full md:w-auto"
            >
              Start Game
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Game completed
  if (game.gameState === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-romantic">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="space-y-8"
          >
            {/* Final Scores */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Game Complete!
              </h1>
              <div className="flex justify-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{game.scoreA}</div>
                  <div className="text-sm text-gray-600">Person A</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{game.scoreB}</div>
                  <div className="text-sm text-gray-600">Person B</div>
                </div>
              </div>
            </div>

            {/* Fun Facts */}
            {game.funFacts.map((fact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Person {fact.aboutPerson} - Did you know?
                </h3>
                <p className="text-gray-700 mb-4">{fact.fact}</p>
                {index < game.funFacts.length - 1 && (
                  <div className="text-center mt-6">
                    <Button variant="secondary" size="sm">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Final Message */}
            <div className="bg-primary-50 border border-primary-200 rounded-3xl p-6 text-center">
              <p className="text-primary-800 text-lg">
                Just thought these were some cool things you guys could talk about. 
                Ok, time to get off the phone and have a good time, enjoy your date! 💕
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Active game
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-romantic flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p>No more questions available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary-500 mr-2" fill="currentColor" />
              <h1 className="text-2xl font-bold text-gray-800">Icebreaker Game</h1>
            </div>
            <div className="flex justify-center space-x-6 text-sm text-gray-600">
              <span>Round {currentQuestion.round}</span>
              <span>Question {currentQuestionIndex + 1} of {game.questions.length}</span>
              <span>Score: {playerRole === 'A' ? game.scoreA : game.scoreB}</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-4">
                {currentQuestion.category}
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {currentQuestion.questionText}
              </h2>
            </div>

            {showResults ? (
              <div className="space-y-4">
                {currentQuestion.options.map((option) => (
                  <div
                    key={option}
                    className={`p-4 rounded-xl border-2 ${
                      option === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : option === selectedAnswer
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {option === currentQuestion.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect!'} 
                    The answer was: {currentQuestion.correctAnswer}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAnswer === option
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
                
                <div className="text-center mt-6">
                  <Button
                    onClick={submitAnswer}
                    disabled={!selectedAnswer || isSubmitting}
                    loading={isSubmitting}
                    size="lg"
                  >
                    Submit Answer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 