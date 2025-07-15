'use client';

import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import Button from '@/components/Button';

export default function DateSelectionCompletePage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.id as string;

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Perfect Selections!
              </h1>
              <Heart className="h-12 w-12 text-primary-500 ml-3" fill="currentColor" />
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Thank you for choosing your 2 favorite date ideas!
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 text-center mb-8"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-8 w-8 text-primary-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your Partner Has Been Notified!
            </h2>
            
            <div className="space-y-4 text-left max-w-lg mx-auto">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-gray-700">
                  We've sent an SMS to your date partner with a link to choose between your 2 selected options.
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-gray-700">
                  Once they choose the final date, you'll both receive SMS confirmation with all the details.
                </p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-gray-700">
                  Time to get excited about your upcoming date! 🎉
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-accent-50 border border-accent-200 rounded-xl p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-accent-800 mb-2">
              What happens next?
            </h3>
            <p className="text-accent-700 text-sm mb-4">
              You'll receive an SMS notification as soon as your partner makes their final choice. 
              Keep an eye on your phone! 📱
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-8"
          >
            <Button
              onClick={() => router.push('/')}
              variant="secondary"
              className="w-full md:w-auto"
            >
              Plan Another Date
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 