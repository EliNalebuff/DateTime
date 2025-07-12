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
import Button from '../Button';

interface Step1LocationProps {
  answers: Partial<DateAnswers>;
  updateAnswers: (answers: Partial<DateAnswers>) => void;
}

const Step1Location: React.FC<Step1LocationProps> = ({ answers, updateAnswers }) => {
  const [location, setLocation] = useState(answers.location || '');
  const [availableDays, setAvailableDays] = useState<string[]>(answers.availableDays || []);
  const [preferredTime, setPreferredTime] = useState(answers.preferredTime || '');
  const [duration, setDuration] = useState(answers.duration || '');
  const [travelDistance, setTravelDistance] = useState(answers.travelDistance || 10);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeOptions = ['Morning', 'Afternoon', 'Evening', 'Late Night'];
  const durationOptions = ['1-2 hrs', '2-4 hrs', 'full evening'];
  const distanceOptions = [5, 10, 15, 25, 50];

  const toggleDay = (day: string) => {
    const newDays = availableDays.includes(day)
      ? availableDays.filter(d => d !== day)
      : [...availableDays, day];
    setAvailableDays(newDays);
    updateAnswers({ availableDays: newDays });
  };

  const handleLocationChange = (text: string) => {
    setLocation(text);
    updateAnswers({ location: text });
  };

  const handleTimeSelect = (time: string) => {
    setPreferredTime(time);
    updateAnswers({ preferredTime: time as any });
  };

  const handleDurationSelect = (dur: string) => {
    setDuration(dur);
    updateAnswers({ duration: dur as any });
  };

  const handleDistanceSelect = (distance: number) => {
    setTravelDistance(distance);
    updateAnswers({ travelDistance: distance });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <QuestionCard question="What city or neighborhood should we plan the date in?">
        <TextInput
          style={styles.textInput}
          value={location}
          onChangeText={handleLocationChange}
          placeholder="Enter city or neighborhood"
          placeholderTextColor="#9CA3AF"
        />
        <Button
          title="Use Current Location"
          onPress={() => {
            // In a real app, this would get the current location
            handleLocationChange('Current Location');
          }}
          variant="outline"
          fullWidth
        />
      </QuestionCard>

      <QuestionCard question="Which days are you available?">
        <View style={styles.chipContainer}>
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.chip,
                availableDays.includes(day) && styles.chipSelected,
              ]}
              onPress={() => toggleDay(day)}
            >
              <Text
                style={[
                  styles.chipText,
                  availableDays.includes(day) && styles.chipTextSelected,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </QuestionCard>

      <QuestionCard question="Preferred time of day?">
        <View style={styles.optionContainer}>
          {timeOptions.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.optionButton,
                preferredTime === time && styles.optionButtonSelected,
              ]}
              onPress={() => handleTimeSelect(time)}
            >
              <Text
                style={[
                  styles.optionText,
                  preferredTime === time && styles.optionTextSelected,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </QuestionCard>

      <QuestionCard question="How long should the date last?">
        <View style={styles.optionContainer}>
          {durationOptions.map((dur) => (
            <TouchableOpacity
              key={dur}
              style={[
                styles.optionButton,
                duration === dur && styles.optionButtonSelected,
              ]}
              onPress={() => handleDurationSelect(dur)}
            >
              <Text
                style={[
                  styles.optionText,
                  duration === dur && styles.optionTextSelected,
                ]}
              >
                {dur}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </QuestionCard>

      <QuestionCard question="How far are you willing to travel?">
        <View style={styles.optionContainer}>
          {distanceOptions.map((distance) => (
            <TouchableOpacity
              key={distance}
              style={[
                styles.optionButton,
                travelDistance === distance && styles.optionButtonSelected,
              ]}
              onPress={() => handleDistanceSelect(distance)}
            >
              <Text
                style={[
                  styles.optionText,
                  travelDistance === distance && styles.optionTextSelected,
                ]}
              >
                {distance} miles
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </QuestionCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
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
});

export default Step1Location; 