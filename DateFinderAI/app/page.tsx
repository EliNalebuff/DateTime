'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowRight, Sparkles, Users, Calendar, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/Button';

export default function WelcomePage() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleStartPlanning = () => {
    router.push('/plan');
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const staggerChildren = {
    animate: {}
  };

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="initial"
          animate="animate"
          variants={staggerChildren}
          transition={{ staggerChildren: 0.1 }}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} transition={{ duration: 0.6 }} className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-8 w-8 text-primary-500 mr-2" fill="currentColor" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                DateFinder AI
              </h1>
              <Sparkles className="h-8 w-8 text-accent-500 ml-2" />
            </div>
            <p className="text-xl md:text-2xl text-gray-600 font-medium">
              Plan a custom date — fast, fun, and personal.
            </p>
          </motion.div>

          {/* Hero Section */}
          <motion.div variants={fadeInUp} transition={{ duration: 0.6 }} className="mb-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-white/20">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                How it works
              </h2>
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    You Answer First
                  </h3>
                  <p className="text-gray-600">
                    Tell us about your preferences, budget, and ideal date vibe
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-accent-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Share the Link
                  </h3>
                  <p className="text-gray-600">
                    Send your unique link to your date partner for their input
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-secondary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Get Perfect Matches
                  </h3>
                  <p className="text-gray-600">
                    Our AI creates 3 personalized date ideas you both will love
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={fadeInUp} transition={{ duration: 0.6 }} className="mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Ready to plan the perfect date?
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                It only takes a few minutes to create a personalized date experience 
                that you'll both remember. No more endless back-and-forth planning!
              </p>
              <Button
                size="lg"
                onClick={handleStartPlanning}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Start Planning
                <ArrowRight className={`ml-2 h-5 w-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              </Button>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div variants={fadeInUp} className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-left">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                🎯 AI-Powered Matching
              </h4>
              <p className="text-gray-600">
                Our smart algorithm considers both partners' preferences, budget, and personality 
                to suggest dates that work for everyone.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-left">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                🔒 Privacy First
              </h4>
              <p className="text-gray-600">
                Your answers stay private. Your date partner only sees the final 3 curated 
                options, not your individual responses.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 