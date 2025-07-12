import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { DateAnswers } from '../../types';
import QuestionCard from '../QuestionCard';

interface Step3PreferencesProps {
  answers: Partial<DateAnswers>;
  updateAnswers: (answers: Partial<DateAnswers>) => void;
}

const Step3Preferences: React.FC<Step3PreferencesProps> = ({ answers, updateAnswers }) => {
  const [dateTypes, setDateTypes] = useState<string[]>(answers.dateTypes || []);
  const [physicalTouch, setPhysicalTouch] = useState(answers.physicalTouch || '');
  const [conversationImportant, setConversationImportant] = useState<boolean | undefined>(answers.conversationImportant);
  const [alcoholAvailable, setAlcoholAvailable] = useState<boolean | undefined>(answers.alcoholAvailable);
  const [dealbreakers, setDealbreakers] = useState<string[]>(answers.dealbreakers || []);
  const [settingPreference, setSettingPreference] = useState(answers.settingPreference || '');
  const [indoorOutdoor, setIndoorOutdoor] = useState(answers.indoorOutdoor || '');

  const dateTypeOptions = ['Active', 'Conversational', 'Interactive', 'Creative', 'Nature', 'Cultural'];
  const physicalTouchOptions = ['Yes', 'No', 'Unsure'];
  const dealbreakerOptions = [
    'No bars', 'No loud places', 'No outdoor walking', 'No crowded places',
    'No expensive restaurants', 'No fast food', 'No museums', 'No shopping',
    'No physical activities', 'No late nights'
  ];
  const settingOptions = ['Public', 'Private'];
  const indoorOutdoorOptions = ['Indoor', 'Outdoor', 'Either'];

  const toggleDateType = (type: string) => {
    const newTypes = dateTypes.includes(type)
      ? dateTypes.filter(t => t !== type)
      : dateTypes.length < 2
      ? [...dateTypes, type]
      : dateTypes;
    setDateTypes(newTypes);
    updateAnswers({ dateTypes: newTypes });
  };

  const handlePhysicalTouch = (value: string) => {
    setPhysicalTouch(value);
    updateAnswers({ physicalTouch: value as any });
  };

  const handleConversationImportant = (value: boolean) => {
    setConversationImportant(value);
    updateAnswers({ conversationImportant: value });
  };

  const handleAlcoholAvailable = (value: boolean) => {
    setAlcoholAvailable(value);
    updateAnswers({ alcoholAvailable: value });
  };

  const toggleDealbreaker = (dealbreaker: string) => {
    const newDealbreakers = dealbreakers.includes(dealbreaker)
      ? dealbreakers.filter(d => d !== dealbreaker)
      : [...dealbreakers, dealbreaker];
    setDealbreakers(newDealbreakers);
    updateAnswers({ dealbreakers: newDealbreakers });
  };

  const handleSettingPreference = (setting: string) => {
    setSettingPreference(setting);
    updateAnswers({ settingPreference: setting as any });
  };

  const handleIndoorOutdoor = (option: string) => {
    setIndoorOutdoor(option);
    updateAnswers({ indoorOutdoor: option as any });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <QuestionCard question="What kind of date are you in the mood for? (Choose up to 2)">
        <View style={styles.chipContainer}>
          {dateTypeOptions.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                dateTypes.includes(type) && styles.chipSelected,
                dateTypes.length >= 2 && !dateTypes.includes(type) && styles.chipDisabled,
              ]}
              onPress={() => toggleDateType(type)}
              disabled={dateTypes.length >= 2 && !dateTypes.includes(type)}
            >
              <Text
                style={[
                  styles.chipText,
                  dateTypes.includes(type) && styles.chipTextSelected,
                  dateTypes.length >= 2 && !dateTypes.includes(type) && styles.chipTextDisabled,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </QuestionCard>

      <QuestionCard question="Is physical touch likely? (e.g., holding hands, cuddling)">
        <View style={styles.optionContainer}>
          {physicalTouchOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                physicalTouch === option && styles.optionButtonSelected,
              ]}
              onPress={() => handlePhysicalTouch(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  physicalTouch === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </QuestionCard>

      <QuestionCard question="Is conversation important during the date?">
        <View style={styles.yesNoContainer}>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              conversationImportant === true && styles.yesNoButtonSelected,
            ]}
            onPress={() => handleConversationImportant(true)}
          >
            <Text
              style={[
                styles.yesNoText,
                conversationImportant === true && styles.yesNoTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              conversationImportant === false && styles.yesNoButtonSelected,
            ]}
            onPress={() => handleConversationImportant(false)}
          >
            <Text
              style={[
                styles.yesNoText,
                conversationImportant === false && styles.yesNoTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </QuestionCard>

      <QuestionCard question="Do you want alcohol available?">
        <View style={styles.yesNoContainer}>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              alcoholAvailable === true && styles.yesNoButtonSelected,
            ]}
            onPress={() => handleAlcoholAvailable(true)}
          >
            <Text
              style={[
                styles.yesNoText,
                alcoholAvailable === true && styles.yesNoTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.yesNoButton,
              alcoholAvailable === false && styles.yesNoButtonSelected,
            ]}
            onPress={() => handleAlcoholAvailable(false)}
          >
            <Text
              style={[
                styles.yesNoText,
                alcoholAvailable === false && styles.yesNoTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </QuestionCard>

      <QuestionCard question="Any dealbreakers?" optional>
        <View style={styles.chipContainer}>
          {dealbreakerOptions.map((dealbreaker) => (
            <TouchableOpacity
              key={dealbreaker}
              style={[
                styles.chip,
                dealbreakers.includes(dealbreaker) && styles.chipSelected,
              ]}
              onPress={() => toggleDealbreaker(dealbreaker)}
            >
              <Text
                style={[
                  styles.chipText,
                  dealbreakers.includes(dealbreaker) && styles.chipTextSelected,
                ]}
              >
                {dealbreaker}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </QuestionCard>

      <QuestionCard question="Do you prefer public or private settings?">
        <View style={styles.yesNoContainer}>
          {settingOptions.map((setting) => (
            <TouchableOpacity
              key={setting}
              style={[
                styles.yesNoButton,
                settingPreference === setting && styles.yesNoButtonSelected,
              ]}
              onPress={() => handleSettingPreference(setting)}
            >
              <Text
                style={[
                  styles.yesNoText,
                  settingPreference === setting && styles.yesNoTextSelected,
                ]}
              >
                {setting}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </QuestionCard>

      <QuestionCard question="Indoors or outdoors?">
        <View style={styles.optionContainer}>
          {indoorOutdoorOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                indoorOutdoor === option && styles.optionButtonSelected,
              ]}
              onPress={() => handleIndoorOutdoor(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  indoorOutdoor === option && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </QuestionCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextDisabled: {
    color: '#9CA3AF',
  },
  optionContainer: {
    gap: 12,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  optionTextSelected: {
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
});

export default Step3Preferences; 