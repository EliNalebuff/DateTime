require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors =require('cors');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const twilio = require('twilio');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize OpenAI - make sure API key is loaded from .env
// Combine API key parts if it was split across lines
const apiKeyParts = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.split('\n') : [];
const apiKey = apiKeyParts.join('').trim();
console.log('API Key length:', apiKey.length);

const openai = new OpenAI({
  apiKey: apiKey,
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => {
  console.error('MongoDB connection error:', error);
  console.log('Server will continue running without database functionality');
  // Use in-memory storage when MongoDB is not available
  console.log('Using in-memory storage for sessions');
});

// Database Schema
const DateSessionSchema = new mongoose.Schema({
  uuid: { type: String, unique: true, required: true },
  originatorPhone: { type: String, required: true }, // Phone number of the person who created the date plan
  partnerA: {
    location: String,
    proposedTimeRanges: [{
      id: String,
      date: String,
      startTime: String,
      endTime: String,
      startPeriod: String,
      endPeriod: String,
      displayText: String
    }],
    dateDuration: String,
    ageRange: String,
    travelDistance: Number,
    budget: Number,
    splitCosts: Boolean,
    includeFood: Boolean,
    includeDrinks: Boolean,
    dietaryRestrictions: String,
    lovedCuisines: [String],
    dislikedCuisines: [String],
    vibe: [String],
    conversationImportant: Boolean,
    alcoholAvailable: Boolean,
    dealbreakers: [String],
    customDealbreaker: String,
    publicPrivate: String,
    indoorOutdoor: String,
    // Personal information (optional)
    sportsTeams: String,
    workDescription: String,
    backgroundInfo: String,
    celebrityFans: String,
    siblings: String,
    roleModels: String,
    travelExperience: String,
    musicPreferences: String,
    hobbiesInterests: String,
    culturalBackground: String,
    personalInsight: String,
  },
  partnerB: {
    selectedTimeRanges: [String],
    ageRange: String,
    budget: Number,
    splitCosts: Boolean,
    includeFood: Boolean,
    includeDrinks: Boolean,
    dietaryRestrictions: String,
    lovedCuisines: [String],
    dislikedCuisines: [String],
    vibe: [String],
    conversationImportant: Boolean,
    dealbreakers: [String],
    customDealbreaker: String,
    alcoholPreference: String,
    publicPrivate: String,
    indoorOutdoor: String,
    // Personal information (optional)
    sportsTeams: String,
    workDescription: String,
    backgroundInfo: String,
    celebrityFans: String,
    siblings: String,
    roleModels: String,
    travelExperience: String,
    musicPreferences: String,
    hobbiesInterests: String,
    culturalBackground: String,
    personalInsight: String,
  },
  dateOptions: [{
    id: String,
    title: String,
    description: String,
    location: String,
    duration: String,
    cost: String,
    vibe: [String],
    includesFood: Boolean,
    includesDrinks: Boolean,
    indoor: Boolean,
    public: Boolean,
  }],
  selectedOptions: [String], // Partner A's selection
  finalChoice: String, // Partner B's final choice
  status: { 
    type: String, 
    enum: ['initiated', 'partner_b_responded', 'partner_a_selected', 'finalized'], 
    default: 'initiated' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DateSession = mongoose.model('DateSession', DateSessionSchema);

// User Schema for Authentication
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String }, // Optional - for password-based auth
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String }, // For SMS verification
  verificationCodeExpiry: { type: Date },
  authMethod: { type: String, enum: ['password', 'sms'], default: 'sms' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Icebreaker Game Schema
const IcebreakerGameSchema = new mongoose.Schema({
  dateSessionUuid: { type: String, required: true }, // Links to DateSession
  gameState: { 
    type: String, 
    enum: ['scheduled', 'active', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  currentRound: { type: Number, default: 1 }, // Round 1-6 (3 standard + 3 bonus)
  currentPlayer: { type: String, enum: ['A', 'B'], default: 'A' },
  isCustomQuestionRound: { type: Boolean, default: false },
  isBonusRound: { type: Boolean, default: false },
  
  // Generated questions and answers
  questions: [{
    id: String,
    questionText: String,
    options: [String], // Multiple choice options
    correctAnswer: String, // The correct option
    targetPerson: { type: String, enum: ['A', 'B'] }, // Who the question is about
    askedBy: { type: String, enum: ['A', 'B'] }, // Who is answering the question
    category: String, // food, sports, music, etc.
    round: Number,
    isCustom: { type: Boolean, default: false }
  }],
  
  answers: [{
    questionId: String,
    selectedAnswer: String,
    isCorrect: Boolean,
    answeredBy: { type: String, enum: ['A', 'B'] },
    answeredAt: { type: Date, default: Date.now }
  }],
  
  customQuestions: [{
    questionText: String,
    askedBy: { type: String, enum: ['A', 'B'] },
    answeredBy: { type: String, enum: ['A', 'B'] },
    answer: String,
    round: Number
  }],
  
  // Fun facts for the end
  funFacts: [{
    aboutPerson: { type: String, enum: ['A', 'B'] },
    fact: String,
    category: String
  }],
  
  // Scoring
  scoreA: { type: Number, default: 0 },
  scoreB: { type: Number, default: 0 },
  
  // Timing
  scheduledFor: Date, // When to send the game (20 min after date start)
  startedAt: Date,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const IcebreakerGame = mongoose.model('IcebreakerGame', IcebreakerGameSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// Twilio Client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN ? 
  twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for SMS verification
const smsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // limit each IP to 1 SMS per minute
  message: 'Please wait before requesting another verification code.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Temporary in-memory storage for when MongoDB is not available
let tempSessions = new Map();
let tempUsers = new Map(); // For auth when MongoDB is not available
let tempIcebreakerGames = new Map(); // For icebreaker games when MongoDB is not available

// Authentication utility functions
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

const sendSMSVerification = async (phone, code) => {
  if (!twilioClient) {
    console.log('Twilio not configured. Would send SMS:', phone, code);
    return { success: true, message: 'SMS sent (simulated)' };
  }
  
  try {
    const message = await twilioClient.messages.create({
      body: `Your DateFinder verification code is: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log('SMS sent successfully:', message.sid);
    return { success: true, message: 'SMS sent successfully' };
  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, message: 'Failed to send SMS' };
  }
};

const sendFinalDateSMS = async (phone, dateOption, selectedTimeRange) => {
  if (!twilioClient) {
    console.log('Twilio not configured. Would send final date SMS:', phone, dateOption.title);
    return { success: true, message: 'SMS sent (simulated)' };
  }
  
  try {
    const timeInfo = selectedTimeRange ? `\nTime: ${selectedTimeRange}` : '';
    const message = await twilioClient.messages.create({
      body: `🎉 Your date is confirmed!\n\n${dateOption.title}\n📍 ${dateOption.location}${timeInfo}\n💰 ${dateOption.cost}\n⏱️ ${dateOption.duration}\n\n${dateOption.description}\n\nTime to make some memories! 💕`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log('Final date SMS sent successfully:', message.sid);
    return { success: true, message: 'Final date SMS sent successfully' };
  } catch (error) {
    console.error('Final date SMS sending error:', error);
    return { success: false, message: 'Failed to send final date SMS' };
  }
};

const sendIcebreakerGameSMS = async (phone, gameId) => {
  if (!twilioClient) {
    console.log('Twilio not configured. Would send icebreaker game SMS:', phone, gameId);
    return { success: true, message: 'SMS sent (simulated)' };
  }
  
  try {
            const gameUrl = `${process.env.BASE_URL}/icebreaker/${gameId}`;
    const message = await twilioClient.messages.create({
      body: `🎮 Time for a fun icebreaker game!\n\nGet to know each other better with this quick guessing game. Both of you can play together!\n\n${gameUrl}\n\nHave fun! 💕`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log('Icebreaker game SMS sent successfully:', message.sid);
    return { success: true, message: 'Icebreaker game SMS sent successfully' };
  } catch (error) {
    console.error('Icebreaker game SMS sending error:', error);
    return { success: false, message: 'Failed to send icebreaker game SMS' };
  }
};

const scheduleIcebreakerGame = async (uuid) => {
  console.log('Scheduling icebreaker game for session:', uuid);
  
  // Set timeout for 20 minutes (1200000 ms)
  setTimeout(async () => {
    try {
      console.log('Creating and sending icebreaker game for session:', uuid);
      
      // Create the icebreaker game
      const response = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/icebreaker/create/${uuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Get the session to find the originator phone
        let session = null;
        try {
          session = await DateSession.findOne({ uuid });
        } catch (mongoError) {
          session = tempSessions.get(uuid);
        }
        
        if (session && session.originatorPhone) {
          // Send SMS with game link
          await sendIcebreakerGameSMS(session.originatorPhone, data.gameId);
        }
      }
    } catch (error) {
      console.error('Error creating scheduled icebreaker game:', error);
    }
  }, 20 * 60 * 1000); // 20 minutes = 20 * 60 * 1000 milliseconds
};

const generateToken = (userId, phone) => {
  return jwt.sign({ userId, phone }, JWT_SECRET, { expiresIn: '7d' });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Real LLM function to generate date ideas
async function generateDateIdeas(partnerA, partnerB) {
  const prompt = `
    You are a creative and insightful date planning assistant.
    Your task is to generate 3 unique, specific, and exciting date ideas based on the shared preferences of two people.
    Analyze their preferences carefully and create tailored suggestions.

    Here are their preferences:

    **Shared Preferences:**
    - Location for the date: ${partnerA.location}
    - Proposed times by Partner A: ${partnerA.proposedTimeRanges && partnerA.proposedTimeRanges.length > 0 ? partnerA.proposedTimeRanges.map(t => t.displayText).join(', ') : 'None specified'}
    - Times selected by Partner B: ${partnerB.selectedTimeRanges && partnerB.selectedTimeRanges.length > 0 ? partnerA.proposedTimeRanges.filter(t => partnerB.selectedTimeRanges.includes(t.id)).map(t => t.displayText).join(', ') : 'None specified'}
    - Desired date duration: ${partnerA.dateDuration}
    - Max travel distance: ${partnerA.travelDistance} miles
    - Combined budget: $${partnerA.budget}
    - Open to splitting costs: ${partnerA.splitCosts ? 'Yes' : 'No'}
    - Should include food: ${partnerA.includeFood ? 'Yes' : 'No'}
    - Should include drinks: ${partnerA.includeDrinks ? 'Yes' : 'No'}
    - Public or private setting: ${partnerA.publicPrivate} or ${partnerB.publicPrivate}
    - Indoor or outdoor setting: ${partnerA.indoorOutdoor} or ${partnerB.indoorOutdoor}

    **Partner A's Preferences:**
    - Loved Cuisines: ${partnerA.lovedCuisines && partnerA.lovedCuisines.length > 0 ? partnerA.lovedCuisines.join(', ') : 'None specified'}
    - Disliked Cuisines: ${partnerA.dislikedCuisines && partnerA.dislikedCuisines.length > 0 ? partnerA.dislikedCuisines.join(', ') : 'None specified'}
    - Desired Vibe: ${partnerA.vibe && partnerA.vibe.length > 0 ? partnerA.vibe.join(', ') : 'None specified'}
    - Dealbreakers: ${partnerA.dealbreakers && partnerA.dealbreakers.length > 0 ? partnerA.dealbreakers.join(', ') : 'None specified'}
    - Dietary Restrictions: ${partnerA.dietaryRestrictions || 'None specified'}

    **Partner B's Preferences:**
    - Loved Cuisines: ${partnerB.lovedCuisines && partnerB.lovedCuisines.length > 0 ? partnerB.lovedCuisines.join(', ') : 'None specified'}
    - Disliked Cuisines: ${partnerB.dislikedCuisines && partnerB.dislikedCuisines.length > 0 ? partnerB.dislikedCuisines.join(', ') : 'None specified'}
    - Desired Vibe: ${partnerB.vibe && partnerB.vibe.length > 0 ? partnerB.vibe.join(', ') : 'None specified'}
    - Dealbreakers: ${partnerB.dealbreakers && partnerB.dealbreakers.length > 0 ? partnerB.dealbreakers.join(', ') : 'None specified'}
    - Dietary Restrictions: ${partnerB.dietaryRestrictions || 'None specified'}

    **Instructions:**
    1.  Generate 3 distinct date ideas.
    2.  For each idea, provide a specific, real location (e.g., "Urban Plates" or "Green Lake Park" not "a pottery place" or "a park").
    3.  The description should be compelling and highlight why it fits their preferences.
    4.  Ensure the ideas respect ALL constraints, especially budget, dealbreakers, and dietary restrictions.
    5.  Return the output as a valid JSON array of 3 objects. Do not include any text or formatting outside of the JSON array.

    **Output Format (JSON Array):**
    [
      {
        "id": "date1",
        "title": "Creative Date Title",
        "description": "A compelling description of the date (2-3 sentences).",
        "location": "A specific, named location in or near ${partnerA.location}",
        "duration": "e.g., 'Approx. 3 hours'",
        "cost": "A price range, e.g., '$50-80'",
        "vibe": ["An", "array", "of", "vibe", "keywords"],
        "includesFood": true,
        "includesDrinks": false,
        "indoor": true,
        "public": true
      },
      ... (two more objects)
    ]
  `;

  try {
    console.log('Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });
    console.log('OpenAI API response received');

    const content = response.choices[0].message.content;
    console.log('Response content:', content.substring(0, 100) + '...');
    
    // The model is instructed to return a JSON object containing the array.
    // Let's parse it and extract the array.
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(content);
      console.log('JSON parsed successfully');
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error(`Failed to parse LLM response as JSON: ${parseError.message}`);
    }
    
    // It's possible the model returns the array inside a key, e.g. { "date_ideas": [...] }
    // We'll look for an array in the parsed object.
    const ideas = Array.isArray(jsonResponse) ? jsonResponse : Object.values(jsonResponse).find(Array.isArray);

    if (!ideas || ideas.length === 0) {
      throw new Error("LLM returned no date ideas.");
    }
    
    return ideas.slice(0, 3);
  } catch (error) {
    console.error('Error generating date ideas from LLM:', error);
    // Fallback to a single, safe idea if the LLM fails
    return [{
      id: 'fallback1',
      title: 'Cozy Coffee & Park Stroll',
      description: 'A relaxed date enjoying a walk in a local park and chatting over coffee at a nearby cafe.',
      location: `A park near ${partnerA.location}`,
      duration: 'Approx. 2 hours',
      cost: '$20-40',
      vibe: ['conversational', 'relaxed', 'casual'],
      includesFood: false,
      includesDrinks: true,
      indoor: false,
      public: true
    }];
  }
}

// AI function to generate icebreaker questions
async function generateIcebreakerQuestions(partnerA, partnerB) {
  const prompt = `
    You are a creative icebreaker game designer for couples on dates.
    Generate 6 multiple choice questions (3 about Person A, 3 about Person B) and 2 fun facts based on their survey responses.
    
    **Person A's Info:**
    - Age Range: ${partnerA.ageRange}
    - Loved Cuisines: ${partnerA.lovedCuisines?.join(', ') || 'None specified'}
    - Disliked Cuisines: ${partnerA.dislikedCuisines?.join(', ') || 'None specified'}
    - Vibe Preferences: ${partnerA.vibe?.join(', ') || 'None specified'}
    - Sports Teams: ${partnerA.sportsTeams || 'None specified'}
    - Music Preferences: ${partnerA.musicPreferences || 'None specified'}
    - Hobbies: ${partnerA.hobbiesInterests || 'None specified'}
    - Cultural Background: ${partnerA.culturalBackground || 'None specified'}
    - Travel Experience: ${partnerA.travelExperience || 'None specified'}
    - Celebrity Fans: ${partnerA.celebrityFans || 'None specified'}
    - Work: ${partnerA.workDescription || 'None specified'}
    
    **Person B's Info:**
    - Age Range: ${partnerB.ageRange}
    - Loved Cuisines: ${partnerB.lovedCuisines?.join(', ') || 'None specified'}
    - Disliked Cuisines: ${partnerB.dislikedCuisines?.join(', ') || 'None specified'}
    - Vibe Preferences: ${partnerB.vibe?.join(', ') || 'None specified'}
    - Sports Teams: ${partnerB.sportsTeams || 'None specified'}
    - Music Preferences: ${partnerB.musicPreferences || 'None specified'}
    - Hobbies: ${partnerB.hobbiesInterests || 'None specified'}
    - Cultural Background: ${partnerB.culturalBackground || 'None specified'}
    - Travel Experience: ${partnerB.travelExperience || 'None specified'}
    - Celebrity Fans: ${partnerB.celebrityFans || 'None specified'}
    - Work: ${partnerB.workDescription || 'None specified'}
    
    **Instructions:**
    1. Generate 3 multiple choice questions about Person A (for Person B to answer)
    2. Generate 3 multiple choice questions about Person B (for Person A to answer)
    3. Generate 2 fun facts (1 about each person) based on their responses
    4. Make questions engaging, fun, and not too obvious
    5. Each question should have 4 multiple choice options
    6. Base questions on the data provided - if someone likes Italian food, ask about their favorite cuisine
    7. Use categories like: food, music, hobbies, travel, work, sports, entertainment
    
    **Output Format (JSON):**
    {
      "questions": [
        {
          "id": "q1",
          "questionText": "What do you think is Person A's favorite type of cuisine?",
          "options": ["Italian", "Mexican", "Chinese", "American"],
          "correctAnswer": "Italian",
          "targetPerson": "A",
          "askedBy": "B",
          "category": "food",
          "round": 1
        }
        // ... 5 more questions
      ],
      "funFacts": [
        {
          "aboutPerson": "A",
          "fact": "Did you know Person A loves Italian food and has traveled to Italy twice?",
          "category": "food"
        },
        {
          "aboutPerson": "B", 
          "fact": "Did you know Person B is a huge fan of jazz music and plays the saxophone?",
          "category": "music"
        }
      ]
    }
  `;

  try {
    console.log('Calling OpenAI API for icebreaker questions...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });
    console.log('OpenAI API response received for icebreaker questions');

    const content = response.choices[0].message.content;
    const parsedResponse = JSON.parse(content);
    
    return {
      questions: parsedResponse.questions || [],
      funFacts: parsedResponse.funFacts || []
    };
  } catch (error) {
    console.error('Error generating icebreaker questions:', error);
    // Fallback questions if AI fails
    return {
      questions: [
        {
          id: 'fallback1',
          questionText: 'What do you think is their favorite type of food?',
          options: ['Italian', 'Mexican', 'Asian', 'American'],
          correctAnswer: 'Italian',
          targetPerson: 'A',
          askedBy: 'B',
          category: 'food',
          round: 1
        }
      ],
      funFacts: [
        {
          aboutPerson: 'A',
          fact: 'Person A has some interesting food preferences!',
          category: 'food'
        }
      ]
    };
  }
}

// API Routes

// Authentication Routes

// POST /api/auth/register - Start phone registration
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, phone, authMethod } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Name and phone number are required' });
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[^\d+]/g, '');

    let user = null;
    let usingTempStorage = false;

    try {
      // Check if user already exists
      user = await User.findOne({ phone: normalizedPhone });
    } catch (mongoError) {
      // Check temporary storage
      user = Array.from(tempUsers.values()).find(u => u.phone === normalizedPhone);
      usingTempStorage = true;
    }

    if (user && user.isVerified) {
      return res.status(400).json({ success: false, error: 'Phone number already registered' });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const userData = {
      name,
      phone: normalizedPhone,
      authMethod: authMethod || 'sms',
      verificationCode,
      verificationCodeExpiry,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (user) {
      // Update existing user
      Object.assign(user, userData);
    } else {
      // Create new user
      userData._id = usingTempStorage ? crypto.randomUUID() : undefined;
      user = userData;
    }

    try {
      if (!usingTempStorage) {
        const dbUser = user._id ? await User.findByIdAndUpdate(user._id, userData, { new: true }) : new User(userData);
        if (!user._id) await dbUser.save();
        user = dbUser;
      } else {
        tempUsers.set(user._id || crypto.randomUUID(), user);
      }
    } catch (mongoError) {
      console.log('MongoDB unavailable, using temporary storage');
      user._id = user._id || crypto.randomUUID();
      tempUsers.set(user._id, user);
    }

    // Send SMS verification
    const smsResult = await sendSMSVerification(normalizedPhone, verificationCode);
    if (!smsResult.success) {
      return res.status(500).json({ success: false, error: 'Failed to send verification code' });
    }

    res.json({
      success: true,
      message: 'Verification code sent',
      userId: user._id,
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// POST /api/auth/verify - Verify phone number
app.post('/api/auth/verify', authLimiter, async (req, res) => {
  try {
    const { phone, code, password } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ success: false, error: 'Phone number and code are required' });
    }

    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    let user = null;
    let usingTempStorage = false;

    try {
      user = await User.findOne({ phone: normalizedPhone });
    } catch (mongoError) {
      user = Array.from(tempUsers.values()).find(u => u.phone === normalizedPhone);
      usingTempStorage = true;
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, error: 'Invalid verification code' });
    }

    if (new Date() > user.verificationCodeExpiry) {
      return res.status(400).json({ success: false, error: 'Verification code expired' });
    }

    // Update user as verified
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    
    // Set password if provided
    if (password && user.authMethod === 'password') {
      user.password = await bcrypt.hash(password, 10);
    }

    user.updatedAt = new Date();

    try {
      if (!usingTempStorage) {
        await user.save();
      } else {
        tempUsers.set(user._id, user);
      }
    } catch (mongoError) {
      tempUsers.set(user._id, user);
    }

    // Generate JWT token
    const token = generateToken(user._id, normalizedPhone);

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: normalizedPhone,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

// POST /api/auth/login - Login with phone and password or request SMS
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { phone, password, requestSMS } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    let user = null;
    let usingTempStorage = false;

    try {
      user = await User.findOne({ phone: normalizedPhone });
    } catch (mongoError) {
      user = Array.from(tempUsers.values()).find(u => u.phone === normalizedPhone);
      usingTempStorage = true;
    }

    if (!user || !user.isVerified) {
      return res.status(404).json({ success: false, error: 'User not found or not verified' });
    }

    if (user.authMethod === 'password') {
      if (!password) {
        return res.status(400).json({ success: false, error: 'Password is required' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ success: false, error: 'Invalid password' });
      }

      // Generate JWT token
      const token = generateToken(user._id, normalizedPhone);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: normalizedPhone,
          authMethod: user.authMethod
        }
      });
    } else if (user.authMethod === 'sms' || requestSMS) {
      // Send SMS verification code
      const verificationCode = generateVerificationCode();
      const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.verificationCode = verificationCode;
      user.verificationCodeExpiry = verificationCodeExpiry;
      user.updatedAt = new Date();

      try {
        if (!usingTempStorage) {
          await user.save();
        } else {
          tempUsers.set(user._id, user);
        }
      } catch (mongoError) {
        tempUsers.set(user._id, user);
      }

      const smsResult = await sendSMSVerification(normalizedPhone, verificationCode);
      if (!smsResult.success) {
        return res.status(500).json({ success: false, error: 'Failed to send verification code' });
      }

      res.json({
        success: true,
        message: 'Verification code sent',
        requiresVerification: true,
        userId: user._id
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// POST /api/auth/verify-login - Verify SMS code for login
app.post('/api/auth/verify-login', authLimiter, async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ success: false, error: 'Phone number and code are required' });
    }

    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    let user = null;
    let usingTempStorage = false;

    try {
      user = await User.findOne({ phone: normalizedPhone });
    } catch (mongoError) {
      user = Array.from(tempUsers.values()).find(u => u.phone === normalizedPhone);
      usingTempStorage = true;
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ success: false, error: 'Invalid verification code' });
    }

    if (new Date() > user.verificationCodeExpiry) {
      return res.status(400).json({ success: false, error: 'Verification code expired' });
    }

    // Clear verification code
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    user.updatedAt = new Date();

    try {
      if (!usingTempStorage) {
        await user.save();
      } else {
        tempUsers.set(user._id, user);
      }
    } catch (mongoError) {
      tempUsers.set(user._id, user);
    }

    // Generate JWT token
    const token = generateToken(user._id, normalizedPhone);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: normalizedPhone,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Login verification error:', error);
    res.status(500).json({ success: false, error: 'Login verification failed' });
  }
});

// POST /api/auth/resend-code - Resend verification code
app.post('/api/auth/resend-code', smsLimiter, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    let user = null;
    let usingTempStorage = false;

    try {
      user = await User.findOne({ phone: normalizedPhone });
    } catch (mongoError) {
      user = Array.from(tempUsers.values()).find(u => u.phone === normalizedPhone);
      usingTempStorage = true;
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;
    user.updatedAt = new Date();

    try {
      if (!usingTempStorage) {
        await user.save();
      } else {
        tempUsers.set(user._id, user);
      }
    } catch (mongoError) {
      tempUsers.set(user._id, user);
    }

    const smsResult = await sendSMSVerification(normalizedPhone, verificationCode);
    if (!smsResult.success) {
      return res.status(500).json({ success: false, error: 'Failed to send verification code' });
    }

    res.json({
      success: true,
      message: 'Verification code resent'
    });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ success: false, error: 'Failed to resend code' });
  }
});

// POST /api/auth/verify-token - Verify JWT token
app.post('/api/auth/verify-token', authenticateToken, async (req, res) => {
  try {
    // If we reach here, the token is valid (passed authenticateToken middleware)
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ success: false, error: 'Token verification failed' });
  }
});

// POST /api/initiate - Partner A starts the process
app.post('/api/initiate', authenticateToken, async (req, res) => {
  try {
    console.log('Received initiate request');
    const uuid = uuidv4();
    const partnerAData = req.body;
    const originatorPhone = req.user.phone; // Get phone from authenticated user

    console.log('Generated UUID:', uuid);
    console.log('Originator phone:', originatorPhone);
    console.log('Partner A data received:', JSON.stringify(partnerAData).substring(0, 100) + '...');

    const sessionData = {
      uuid,
      originatorPhone,
      partnerA: partnerAData,
      status: 'initiated',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Try to save to MongoDB first
    try {
      const dateSession = new DateSession(sessionData);
      await dateSession.save();
      console.log('Session saved to MongoDB');
    } catch (mongoError) {
      // If MongoDB fails, use temporary storage
      console.log('MongoDB unavailable, using temporary storage:', mongoError.message);
      tempSessions.set(uuid, sessionData);
      console.log('Session saved to temporary storage with UUID:', uuid);
    }

            const shareUrl = `${process.env.BASE_URL}/date/${uuid}`;
    console.log('Generated share URL:', shareUrl);

    res.json({
      success: true,
      uuid,
      shareUrl
    });
  } catch (error) {
    console.error('Error initiating date session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/date/:uuid - Get session metadata (for Partner B)
app.get('/api/date/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    let session = null;

    // Try to find in MongoDB first
    try {
      session = await DateSession.findOne({ uuid });
    } catch (mongoError) {
      // If MongoDB fails, check temporary storage
      session = tempSessions.get(uuid);
    }

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Return metadata and proposed times for Partner B
    res.json({
      success: true,
      exists: true,
      status: session.status,
      createdAt: session.createdAt,
      proposedTimeRanges: session.partnerA.proposedTimeRanges || []
    });
  } catch (error) {
    console.error('Error fetching date session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/respond/:uuid - Partner B submits their preferences
app.post('/api/respond/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const partnerBData = req.body;
    let session = null;
    let storageType = '';

    // Try to find in MongoDB first
    try {
      session = await DateSession.findOne({ uuid });
      storageType = 'mongo';
    } catch (mongoError) {
      session = tempSessions.get(uuid);
      storageType = 'temp';
    }

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    if (session.status !== 'initiated') {
      return res.status(400).json({ success: false, error: 'This date session has already been responded to.' });
    }

    session.partnerB = partnerBData;
    session.status = 'partner_b_responded';
    session.updatedAt = new Date();

    // Generate date ideas using the LLM
    const dateIdeas = await generateDateIdeas(session.partnerA, session.partnerB);
    session.dateOptions = dateIdeas;

    // Save the updated session
    if (storageType === 'mongo') {
      await session.save();
      console.log('Partner B data and date ideas saved to MongoDB');
    } else {
      tempSessions.set(uuid, session);
      console.log('Partner B data and date ideas saved to temporary storage');
    }

    res.json({
      success: true,
      dateOptions: session.dateOptions,
              resultsUrl: `${process.env.BASE_URL}/results/${uuid}`
    });
  } catch (error) {
    console.error('Error in respond route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/results/:uuid - Get date options
app.get('/api/results/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    let session = null;

    // Try to find in MongoDB first
    try {
      session = await DateSession.findOne({ uuid });
    } catch (mongoError) {
      // If MongoDB fails, check temporary storage
      session = tempSessions.get(uuid);
    }

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({
      success: true,
      dateOptions: session.dateOptions,
      selectedOptions: session.selectedOptions,
      finalChoice: session.finalChoice,
      status: session.status
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/select/:uuid - Partner A selects 2 options
app.post('/api/select/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const { selectedOptions } = req.body;

    let session = null;
    let usingTempStorage = false;

    // Try to find in MongoDB first
    try {
      session = await DateSession.findOne({ uuid });
    } catch (mongoError) {
      // If MongoDB fails, check temporary storage
      session = tempSessions.get(uuid);
      usingTempStorage = true;
    }

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (session.status !== 'partner_b_responded') {
      return res.status(400).json({ success: false, error: 'Invalid session status' });
    }

    if (!selectedOptions || selectedOptions.length !== 2) {
      return res.status(400).json({ success: false, error: 'Must select exactly 2 options' });
    }

    session.selectedOptions = selectedOptions;
    session.status = 'partner_a_selected';
    session.updatedAt = new Date();

    // Save the updated session
    try {
      if (!usingTempStorage) {
        await session.save();
      } else {
        tempSessions.set(uuid, session);
      }
    } catch (mongoError) {
      // If MongoDB fails, save to temporary storage
      tempSessions.set(uuid, session);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error selecting options:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/finalize/:uuid - Partner B makes final choice
app.post('/api/finalize/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const { finalChoice } = req.body;

    let session = null;
    let usingTempStorage = false;

    // Try to find in MongoDB first
    try {
      session = await DateSession.findOne({ uuid });
    } catch (mongoError) {
      // If MongoDB fails, check temporary storage
      session = tempSessions.get(uuid);
      usingTempStorage = true;
    }

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (session.status !== 'partner_a_selected') {
      return res.status(400).json({ success: false, error: 'Invalid session status' });
    }

    if (!session.selectedOptions.includes(finalChoice)) {
      return res.status(400).json({ success: false, error: 'Invalid final choice' });
    }

    session.finalChoice = finalChoice;
    session.status = 'finalized';
    session.updatedAt = new Date();

    // Save the updated session
    try {
      if (!usingTempStorage) {
        await session.save();
      } else {
        tempSessions.set(uuid, session);
      }
    } catch (mongoError) {
      // If MongoDB fails, save to temporary storage
      tempSessions.set(uuid, session);
    }

    const finalDate = session.dateOptions.find(option => option.id === finalChoice);

    // Get the selected time range for the SMS
    const selectedTimeRange = session.partnerB?.selectedTimeRanges?.length > 0 
      ? session.partnerA.proposedTimeRanges.find(tr => session.partnerB.selectedTimeRanges.includes(tr.id))?.displayText
      : null;

    // Send SMS to the originator with the final date details
    if (session.originatorPhone) {
      try {
        console.log('Sending final date SMS to:', session.originatorPhone);
        const smsResult = await sendFinalDateSMS(session.originatorPhone, finalDate, selectedTimeRange);
        if (smsResult.success) {
          console.log('Final date SMS sent successfully');
        } else {
          console.warn('Failed to send final date SMS:', smsResult.message);
        }
      } catch (smsError) {
        console.error('Error sending final date SMS:', smsError);
        // Don't fail the request if SMS fails - the date is still confirmed
      }

      // Schedule icebreaker game for 20 minutes from now
      // Only schedule if both partners have completed their surveys
      if (session.partnerA && session.partnerB) {
        try {
          console.log('Scheduling icebreaker game for 20 minutes from now');
          scheduleIcebreakerGame(uuid);
        } catch (icebreakerError) {
          console.error('Error scheduling icebreaker game:', icebreakerError);
          // Don't fail the request if icebreaker scheduling fails
        }
      } else {
        console.log('Not scheduling icebreaker game - missing survey data');
      }
    } else {
      console.warn('No originator phone found for session:', uuid);
    }

    res.json({
      success: true,
      finalDate
    });
  } catch (error) {
    console.error('Error finalizing choice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Icebreaker Game API Routes

// POST /api/icebreaker/create/:uuid - Create icebreaker game for a date session
app.post('/api/icebreaker/create/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    
    // Find the date session
    let session = null;
    try {
      session = await DateSession.findOne({ uuid });
    } catch (mongoError) {
      session = tempSessions.get(uuid);
    }
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Date session not found' });
    }
    
    // Check if both partners have completed their surveys
    if (!session.partnerA || !session.partnerB) {
      return res.status(400).json({ 
        success: false, 
        error: 'Both partners must complete surveys before icebreaker game can be created' 
      });
    }
    
    // Generate questions using AI
    const { questions, funFacts } = await generateIcebreakerQuestions(session.partnerA, session.partnerB);
    
    // Create game
    const gameData = {
      dateSessionUuid: uuid,
      questions,
      funFacts,
      scheduledFor: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    let game = null;
    let gameId = null;
    
    try {
      const icebreakerGame = new IcebreakerGame(gameData);
      game = await icebreakerGame.save();
      gameId = game._id;
    } catch (mongoError) {
      gameId = crypto.randomUUID();
      gameData._id = gameId;
      tempIcebreakerGames.set(gameId, gameData);
      game = gameData;
    }
    
    res.json({
      success: true,
      gameId,
      scheduledFor: game.scheduledFor
    });
  } catch (error) {
    console.error('Error creating icebreaker game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/icebreaker/:gameId - Get current game state
app.get('/api/icebreaker/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    let game = null;
    try {
      game = await IcebreakerGame.findById(gameId);
    } catch (mongoError) {
      game = tempIcebreakerGames.get(gameId);
    }
    
    if (!game) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    
    res.json({
      success: true,
      game: {
        id: game._id || gameId,
        gameState: game.gameState,
        currentRound: game.currentRound,
        currentPlayer: game.currentPlayer,
        isCustomQuestionRound: game.isCustomQuestionRound,
        isBonusRound: game.isBonusRound,
        questions: game.questions,
        answers: game.answers,
        customQuestions: game.customQuestions,
        funFacts: game.funFacts,
        scoreA: game.scoreA,
        scoreB: game.scoreB,
        startedAt: game.startedAt,
        completedAt: game.completedAt
      }
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/icebreaker/:gameId/start - Start the game
app.post('/api/icebreaker/:gameId/start', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    let game = null;
    let usingTempStorage = false;
    
    try {
      game = await IcebreakerGame.findById(gameId);
    } catch (mongoError) {
      game = tempIcebreakerGames.get(gameId);
      usingTempStorage = true;
    }
    
    if (!game) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    
    if (game.gameState !== 'scheduled') {
      return res.status(400).json({ success: false, error: 'Game already started or completed' });
    }
    
    game.gameState = 'active';
    game.startedAt = new Date();
    game.updatedAt = new Date();
    
    // Save the updated game
    try {
      if (!usingTempStorage) {
        await game.save();
      } else {
        tempIcebreakerGames.set(gameId, game);
      }
    } catch (mongoError) {
      tempIcebreakerGames.set(gameId, game);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/icebreaker/:gameId/answer - Submit an answer
app.post('/api/icebreaker/:gameId/answer', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { questionId, selectedAnswer, player } = req.body;
    
    let game = null;
    let usingTempStorage = false;
    
    try {
      game = await IcebreakerGame.findById(gameId);
    } catch (mongoError) {
      game = tempIcebreakerGames.get(gameId);
      usingTempStorage = true;
    }
    
    if (!game) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    
    // Find the question
    const question = game.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question not found' });
    }
    
    // Check if already answered
    const existingAnswer = game.answers.find(a => a.questionId === questionId);
    if (existingAnswer) {
      return res.status(400).json({ success: false, error: 'Question already answered' });
    }
    
    // Record the answer
    const isCorrect = selectedAnswer === question.correctAnswer;
    game.answers.push({
      questionId,
      selectedAnswer,
      isCorrect,
      answeredBy: player,
      answeredAt: new Date()
    });
    
    // Update score
    if (isCorrect) {
      if (player === 'A') {
        game.scoreA += 1;
      } else {
        game.scoreB += 1;
      }
    }
    
    game.updatedAt = new Date();
    
    // Save the updated game
    try {
      if (!usingTempStorage) {
        await game.save();
      } else {
        tempIcebreakerGames.set(gameId, game);
      }
    } catch (mongoError) {
      tempIcebreakerGames.set(gameId, game);
    }
    
    res.json({ 
      success: true, 
      isCorrect,
      correctAnswer: question.correctAnswer,
      scoreA: game.scoreA,
      scoreB: game.scoreB
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/icebreaker/:gameId/complete - Complete the game
app.post('/api/icebreaker/:gameId/complete', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    let game = null;
    let usingTempStorage = false;
    
    try {
      game = await IcebreakerGame.findById(gameId);
    } catch (mongoError) {
      game = tempIcebreakerGames.get(gameId);
      usingTempStorage = true;
    }
    
    if (!game) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    
    game.gameState = 'completed';
    game.completedAt = new Date();
    game.updatedAt = new Date();
    
    // Save the updated game
    try {
      if (!usingTempStorage) {
        await game.save();
      } else {
        tempIcebreakerGames.set(gameId, game);
      }
    } catch (mongoError) {
      tempIcebreakerGames.set(gameId, game);
    }
    
    res.json({ 
      success: true,
      finalScores: {
        scoreA: game.scoreA,
        scoreB: game.scoreB
      },
      funFacts: game.funFacts
    });
  } catch (error) {
    console.error('Error completing game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 