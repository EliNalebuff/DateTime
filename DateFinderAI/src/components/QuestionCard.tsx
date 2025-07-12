import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface QuestionCardProps {
  question: string;
  children: React.ReactNode;
  optional?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, children, optional = false }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>
        {question}
        {optional && <Text style={styles.optional}> (optional)</Text>}
      </Text>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 24,
  },
  optional: {
    color: '#6B7280',
    fontWeight: '400',
  },
  content: {
    // Content styling will be handled by child components
  },
});

export default QuestionCard; 