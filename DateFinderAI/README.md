# DateFinder AI

A beautiful, mobile-native date planning app that helps users create personalized date experiences. Built with React Native and Expo.

## ✨ Features

- **Step-by-step questionnaire** with smooth transitions
- **Modern, romantic design** with gradient backgrounds and rounded components
- **Haptic feedback** for enhanced user experience
- **Mobile-first interface** optimized for touch interactions
- **Progressive data collection** across 3 comprehensive steps

## 🎨 Design Philosophy

- **Soft, romantic color palette**: Blush pinks, soft purples, deep navy, charcoal greys
- **Apple-style spacing**: Generous padding and margins for comfortable touch targets
- **Minimalist typography**: Clean sans-serif fonts with proper hierarchy
- **Smooth animations**: Framer Motion-inspired transitions between screens
- **Rounded components**: Modern, friendly interface elements

## 📱 Screens

### 1. Welcome Screen
- Beautiful gradient background
- Clear value proposition
- Prominent CTA button

### 2. Partner A Flow (3 Steps)

#### Step 1: Location & Timing
- City/neighborhood input with current location option
- Multi-select day picker
- Time of day selection
- Duration preferences
- Travel distance slider

#### Step 2: Budget & Food
- Budget selection with visual feedback
- Cost splitting preferences
- Food and drink inclusion options
- Dietary restrictions input
- Cuisine preference chips

#### Step 3: Date Preferences
- Date type selection (up to 2)
- Physical touch preferences
- Conversation importance
- Alcohol availability
- Dealbreakers selection
- Setting preferences (public/private, indoor/outdoor)

### 3. Link Generation Screen
- Generated shareable link
- Copy to clipboard functionality
- Preview answers option
- Beautiful summary view

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DateFinderAI
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

## 🛠 Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Screen navigation
- **Expo Linear Gradient** - Beautiful gradient backgrounds
- **Expo Haptics** - Tactile feedback
- **React Native Reanimated** - Smooth animations

## 📁 Project Structure

```
src/
├── components/
│   ├── Button.tsx
│   ├── QuestionCard.tsx
│   ├── StepHeader.tsx
│   └── steps/
│       ├── Step1Location.tsx
│       ├── Step2Budget.tsx
│       └── Step3Preferences.tsx
├── screens/
│   ├── WelcomeScreen.tsx
│   ├── PartnerAFlow.tsx
│   └── LinkGenerationScreen.tsx
├── types/
│   └── index.ts
└── utils/
```

## 🎯 Key Components

### Reusable Components
- **Button**: Versatile button with multiple variants (primary, secondary, outline)
- **QuestionCard**: Consistent question styling with optional indicators
- **StepHeader**: Progress indicator with step titles and descriptions

### Step Components
- **Step1Location**: Location, timing, and travel preferences
- **Step2Budget**: Budget, food, and dietary preferences
- **Step3Preferences**: Date type, physical touch, and dealbreakers

## 🎨 Design System

### Colors
- Primary: `#667eea` (Soft purple)
- Secondary: `#764ba2` (Deep purple)
- Background: `#F9FAFB` (Light grey)
- Text: `#1F2937` (Dark grey)
- Muted: `#6B7280` (Medium grey)

### Typography
- Headers: 28-32px, font-weight: 700
- Body: 16-18px, font-weight: 400-500
- Captions: 14px, font-weight: 600

### Spacing
- Container padding: 24px
- Component spacing: 16px
- Button padding: 16px vertical, 32px horizontal

## 🔮 Future Enhancements

- Backend integration for link generation
- Partner B questionnaire flow
- Date suggestion algorithm
- Push notifications
- Social sharing features
- Analytics and insights

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for better date planning experiences. 