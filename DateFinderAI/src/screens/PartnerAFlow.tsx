import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NavigationProps, DateAnswers } from '../types';
import StepHeader from '../components/StepHeader';
import QuestionCard from '../components/QuestionCard';
import Button from '../components/Button';
import Step1Location from '../components/steps/Step1Location';
import Step2Budget from '../components/steps/Step2Budget';
import Step3Preferences from '../components/steps/Step3Preferences';

const PartnerAFlow: React.FC<NavigationProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Partial<DateAnswers>>({});
  const totalSteps = 3;

  const updateAnswers = (newAnswers: Partial<DateAnswers>) => {
    setAnswers(prev => ({ ...prev, ...newAnswers }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to link generation screen
      navigation.navigate('LinkGeneration', { answers });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Location
            answers={answers}
            updateAnswers={updateAnswers}
          />
        );
      case 2:
        return (
          <Step2Budget
            answers={answers}
            updateAnswers={updateAnswers}
          />
        );
      case 3:
        return (
          <Step3Preferences
            answers={answers}
            updateAnswers={updateAnswers}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Location & Timing';
      case 2:
        return 'Budget & Food';
      case 3:
        return 'Date Preferences';
      default:
        return '';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return 'Let\'s start with the basics of your date';
      case 2:
        return 'Set your budget and food preferences';
      case 3:
        return 'Tell us what kind of date you\'re looking for';
      default:
        return '';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return answers.location && answers.availableDays && answers.preferredTime && answers.duration && answers.travelDistance;
      case 2:
        return answers.budget !== undefined && answers.splitCosts !== undefined && answers.includeFood !== undefined && answers.includeDrinks !== undefined;
      case 3:
        return answers.dateTypes && answers.physicalTouch && answers.conversationImportant !== undefined && answers.alcoholAvailable !== undefined;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StepHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
          title={getStepTitle()}
          subtitle={getStepSubtitle()}
        />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <Button
              title="Back"
              onPress={handleBack}
              variant="outline"
              fullWidth={false}
            />
            <View style={styles.buttonSpacer} />
            <Button
              title={currentStep === totalSteps ? 'Finish' : 'Next'}
              onPress={handleNext}
              disabled={!canProceed()}
              fullWidth={false}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSpacer: {
    width: 16,
  },
});

export default PartnerAFlow; 