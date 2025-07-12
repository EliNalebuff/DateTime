import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { NavigationProps } from '../types';
import Button from '../components/Button';

const LinkGenerationScreen: React.FC<NavigationProps> = ({ navigation, route }) => {
  const { answers } = route.params as { answers: any };
  const [showPreview, setShowPreview] = useState(false);

  const generateLink = () => {
    // In a real app, this would generate a unique link
    return 'https://datefinder.app/date/abc123';
  };

  const copyLink = async () => {
    try {
      // In a real app, this would copy to clipboard
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Link copied to clipboard!');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const formatAnswer = (key: string, value: any) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number' && key === 'budget') {
      return `$${value}`;
    }
    if (typeof value === 'number' && key === 'travelDistance') {
      return `${value} miles`;
    }
    return value || 'Not specified';
  };

  const getAnswerLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      location: 'Location',
      availableDays: 'Available Days',
      preferredTime: 'Preferred Time',
      duration: 'Duration',
      travelDistance: 'Travel Distance',
      budget: 'Budget',
      splitCosts: 'Split Costs',
      includeFood: 'Include Food',
      includeDrinks: 'Include Drinks',
      dietaryRestrictions: 'Dietary Restrictions',
      cuisinePreferences: 'Cuisine Preferences',
      dateTypes: 'Date Types',
      physicalTouch: 'Physical Touch',
      conversationImportant: 'Conversation Important',
      alcoholAvailable: 'Alcohol Available',
      dealbreakers: 'Dealbreakers',
      settingPreference: 'Setting Preference',
      indoorOutdoor: 'Indoor/Outdoor',
    };
    return labels[key] || key;
  };

  const renderPreview = () => {
    return (
      <ScrollView style={styles.previewContainer}>
        <Text style={styles.previewTitle}>Your Date Preferences</Text>
        {Object.entries(answers).map(([key, value]) => (
          <View key={key} style={styles.previewItem}>
            <Text style={styles.previewLabel}>{getAnswerLabel(key)}</Text>
            <Text style={styles.previewValue}>{formatAnswer(key, value)}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {!showPreview ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>All Set!</Text>
                <Text style={styles.subtitle}>
                  We've saved your answers. Now send this link to the person you want to go on a date with.
                </Text>
              </View>

              <View style={styles.linkContainer}>
                <View style={styles.linkBox}>
                  <Text style={styles.linkText}>{generateLink()}</Text>
                </View>
                <Button
                  title="Copy Link"
                  onPress={copyLink}
                  fullWidth
                />
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Preview My Answers"
                  onPress={() => setShowPreview(true)}
                  variant="outline"
                  fullWidth
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.previewHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setShowPreview(false)}
                >
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.previewHeaderTitle}>Your Answers</Text>
              </View>
              {renderPreview()}
            </>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
  },
  linkContainer: {
    marginBottom: 32,
  },
  linkBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  linkText: {
    fontSize: 16,
    color: '#667eea',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: 40,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  previewHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 16,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  previewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewValue: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
});

export default LinkGenerationScreen; 