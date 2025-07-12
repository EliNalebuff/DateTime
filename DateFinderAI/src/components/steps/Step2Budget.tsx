import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { DateAnswers } from '../../types';
import QuestionCard from '../QuestionCard';

interface Step2BudgetProps {
  answers: Partial<DateAnswers>;
  updateAnswers: (answers: Partial<DateAnswers>) => void;
}

const Step2Budget: React.FC<Step2BudgetProps> = ({ answers, updateAnswers }) => {
  const [budget, setBudget] = useState(answers.budget || 50);
  const [splitCosts, setSplitCosts] = useState<boolean | undefined>(answers.splitCosts);
  const [includeFood, setIncludeFood] = useState<boolean | undefined>(answers.includeFood);
  const [includeDrinks, setIncludeDrinks] = useState<boolean | undefined>(answers.includeDrinks);
  const [dietaryRestrictions, setDietaryRestrictions] = useState(answers.dietaryRestrictions || '');
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>(answers.cuisinePreferences || []);

  const budgetOptions = [25, 50, 75, 100, 150, 200, 300];
  const cuisineOptions = [
    'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 
    'Mediterranean', 'American', 'French', 'Greek', 'Korean', 'Vietnamese',
    'Middle Eastern', 'Caribbean', 'African', 'Latin American'
  ];

  const handleBudgetSelect = (amount: number) => {
    setBudget(amount);
    updateAnswers({ budget: amount });
  };

  const handleSplitCosts = (value: boolean) => {
    setSplitCosts(value);
    updateAnswers({ splitCosts: value });
  };

  const handleIncludeFood = (value: boolean) => {
    setIncludeFood(value);
    updateAnswers({ includeFood: value });
  };

  const handleIncludeDrinks = (value: boolean) => {
    setIncludeDrinks(value);
    updateAnswers({ includeDrinks: value });
  };

  const handleDietaryRestrictions = (text: string) => {
    setDietaryRestrictions(text);
    updateAnswers({ dietaryRestrictions: text });
  };

  const toggleCuisine = (cuisine: string) => {
    const newPreferences = cuisinePreferences.includes(cuisine)
      ? cuisinePreferences.filter(c => c !== cuisine)
      : [...cuisinePreferences, cuisine];
    setCuisinePreferences(newPreferences);
    updateAnswers({ cuisinePreferences: newPreferences });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <QuestionCard question="What's your total budget?">
        <View style={styles.budgetContainer}>
          <Text style={styles.budgetLabel}>${budget}</Text>
          <View style={styles.budgetOptions}>
            {budgetOptions.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.budgetOption,
                  budget === amount && styles.budgetOptionSelected,
                ]}
                onPress={() => handleBudgetSelect(amount)}
              >
                <Text
                  style={[
                    styles.budgetOptionText,
                    budget === amount && styles.budgetOptionTextSelected,
                  ]}
                >
                  ${amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </QuestionCard>

      <QuestionCard question="Are you okay with splitting costs?">
        <View style={styles.yesNoContainer}>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              splitCosts === true && styles.yesNoButtonSelected,
            ]}
            onPress={() => handleSplitCosts(true)}
          >
            <Text
              style={[
                styles.yesNoText,
                splitCosts === true && styles.yesNoTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              splitCosts === false && styles.yesNoButtonSelected,
            ]}
            onPress={() => handleSplitCosts(false)}
          >
            <Text
              style={[
                styles.yesNoText,
                splitCosts === false && styles.yesNoTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </QuestionCard>

      <QuestionCard question="Do you want food to be part of the date?">
        <View style={styles.yesNoContainer}>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              includeFood === true && styles.yesNoButtonSelected,
            ]}
            onPress={() => handleIncludeFood(true)}
          >
            <Text
              style={[
                styles.yesNoText,
                includeFood === true && styles.yesNoTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              includeFood === false && styles.yesNoButtonSelected,
            ]}
            onPress={() => handleIncludeFood(false)}
          >
            <Text
              style={[
                styles.yesNoText,
                includeFood === false && styles.yesNoTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </QuestionCard>

      <QuestionCard question="Do you want drinks to be part of the date?">
        <View style={styles.yesNoContainer}>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              includeDrinks === true && styles.yesNoButtonSelected,
            ]}
            onPress={() => handleIncludeDrinks(true)}
          >
            <Text
              style={[
                styles.yesNoText,
                includeDrinks === true && styles.yesNoTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              includeDrinks === false && styles.yesNoButtonSelected,
            ]}
            onPress={() => handleIncludeDrinks(false)}
          >
            <Text
              style={[
                styles.yesNoText,
                includeDrinks === false && styles.yesNoTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </QuestionCard>

      <QuestionCard question="Any dietary restrictions?" optional>
        <TextInput
          style={styles.textInput}
          value={dietaryRestrictions}
          onChangeText={handleDietaryRestrictions}
          placeholder="e.g., vegetarian, gluten-free, allergies"
          placeholderTextColor="#9CA3AF"
          multiline
        />
      </QuestionCard>

      <QuestionCard question="Any cuisines you'd love or hate?" optional>
        <View style={styles.chipContainer}>
          {cuisineOptions.map((cuisine) => (
            <TouchableOpacity
              key={cuisine}
              style={[
                styles.chip,
                cuisinePreferences.includes(cuisine) && styles.chipSelected,
              ]}
              onPress={() => toggleCuisine(cuisine)}
            >
              <Text
                style={[
                  styles.chipText,
                  cuisinePreferences.includes(cuisine) && styles.chipTextSelected,
                ]}
              >
                {cuisine}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </QuestionCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  budgetContainer: {
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 32,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 20,
  },
  budgetOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  budgetOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  budgetOptionSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  budgetOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  budgetOptionTextSelected: {
    color: '#FFFFFF',
  },
  yesNoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  yesNoButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  yesNoButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  yesNoText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  yesNoTextSelected: {
    color: '#FFFFFF',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});

export default Step2Budget; 