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

// Add Google Places API client after OpenAI initialization
const googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY;

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
    hobbiesInterests: [String], // Moved from optional to required preferences
    customHobbies: String, // Custom hobbies not in predefined list
    // Personal information (optional)
    sportsTeams: String,
    workDescription: String,
    backgroundInfo: String,
    celebrityFans: String,
    siblings: String,
    roleModels: String,
    travelExperience: String,
    musicPreferences: String,
    culturalBackground: String,
    personalInsight: String,
  },
  partnerB: {
    phone: String, // Partner B's phone number
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
    hobbiesInterests: [String], // Moved from optional to required preferences
    customHobbies: String, // Custom hobbies not in predefined list
    // Personal information (optional)
    sportsTeams: String,
    workDescription: String,
    backgroundInfo: String,
    celebrityFans: String,
    siblings: String,
    roleModels: String,
    travelExperience: String,
    musicPreferences: String,
    culturalBackground: String,
    personalInsight: String,
  },
  dateOptions: [{
    id: String,
    title: String,
    description: String,
    venues: [{
      name: String,
      address: String,
      role: String // "dinner", "activity", "drinks", etc.
    }],
    duration: String,
    estimatedCost: String,
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
    enum: ['initiated', 'partner_b_responded', 'partner_b_selected', 'finalized'], 
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
      body: `🎉 Your date is confirmed!\n\n${dateOption.title}\n📍 ${dateOption.location}\n💰 ${dateOption.cost}\n⏱️ ${dateOption.duration}\n\n${dateOption.description}\n\nTime to make some memories! 💕`,
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

const sendPartnerAFinalChoiceSMS = async (phone, finalChoiceUrl) => {
  if (!twilioClient) {
    console.log('Twilio not configured. Would send Partner A final choice SMS:', phone, finalChoiceUrl);
    return { success: true, message: 'SMS sent (simulated)' };
  }
 
  try {
    const message = await twilioClient.messages.create({
      body: `🎉 Great news! Your date partner has narrowed it down to 2 perfect options.\n\nNow it's time for you to choose which one sounds best!\n\n${finalChoiceUrl}\n\nClick the link to make your final choice! 💕`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log('Partner A final choice SMS sent successfully:', message.sid);
    return { success: true, message: 'Partner A final choice SMS sent successfully' };
  } catch (error) {
    console.error('Partner A final choice SMS sending error:', error);
    return { success: false, message: 'Failed to send Partner A final choice SMS' };
  }
};

const sendPartnerBConfirmationSMS = async (phone, finalDate) => {
  if (!twilioClient) {
    console.log('Twilio not configured. Would send Partner B confirmation SMS:', phone, finalDate.title);
    return { success: true, message: 'SMS sent (simulated)' };
  }
  
  try {
    const message = await twilioClient.messages.create({
      body: `🎉 Your date is confirmed!\n\nYour partner chose: ${finalDate.title}\n📍 ${finalDate.location}\n💰 ${finalDate.cost}\n⏱️ ${finalDate.duration}\n\n${finalDate.description}\n\nTime to make some memories! 💕`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log('Partner B confirmation SMS sent successfully:', message.sid);
    return { success: true, message: 'Partner B confirmation SMS sent successfully' };
  } catch (error) {
    console.error('Partner B confirmation SMS sending error:', error);
    return { success: false, message: 'Failed to send Partner B confirmation SMS' };
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

// Helper function to map budget to Google Places price level
function mapBudgetToPriceLevel(budget) {
  if (budget <= 50) return 1; // $
  if (budget <= 150) return 2; // $$
  if (budget <= 300) return 3; // $$$
  return 4; // $$$$
}

// Helper function to get location coordinates using Google Geocoding API
async function getLocationCoordinates(location) {
  if (!googlePlacesApiKey) {
    console.warn('Google Places API key not configured, using default coordinates');
    return { lat: 37.7749, lng: -122.4194 }; // Default to SF coordinates
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googlePlacesApiKey}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      console.warn(`Geocoding failed for "${location}": ${data.status}`);
      return { lat: 37.7749, lng: -122.4194 }; // Default to SF coordinates
    }
  } catch (error) {
    console.error('Error geocoding location:', error);
    return { lat: 37.7749, lng: -122.4194 }; // Default to SF coordinates
  }
}

// Step 1: Generate search terms based on survey preferences
async function generateSearchTerms(partnerA, partnerB) {
  const prompt = `
    You are a date planning expert. Based on the survey responses below, generate 5 specific search terms that would help find suitable venues for a date. 
    
    The search terms should be specific enough to find real venues (e.g., "Italian restaurants", "art museums", "bowling alleys", "coffee shops", "wine bars") 
    rather than vague concepts. Consider their preferences for food, activities, vibe, and constraints.

    **Survey Preferences:**
    - Location: ${partnerA.location}
    - Date Duration: ${partnerA.dateDuration}
    - Budget: $${partnerA.budget}
    - Include Food: ${partnerA.includeFood ? 'Yes' : 'No'}
    - Include Drinks: ${partnerA.includeDrinks ? 'Yes' : 'No'}
    - Indoor/Outdoor: ${partnerA.indoorOutdoor} / ${partnerB.indoorOutdoor}
    - Public/Private: ${partnerA.publicPrivate} / ${partnerB.publicPrivate}
    
    **Partner A Preferences:**
    - Loved Cuisines: ${partnerA.lovedCuisines?.join(', ') || 'None specified'}
    - Disliked Cuisines: ${partnerA.dislikedCuisines?.join(', ') || 'None specified'}
    - Desired Vibe: ${partnerA.vibe?.join(', ') || 'None specified'}
    - Hobbies & Interests: ${[...(partnerA.hobbiesInterests || []), ...(partnerA.customHobbies ? partnerA.customHobbies.split(',').map(h => h.trim()).filter(h => h) : [])].join(', ') || 'None specified'}
    - Dealbreakers: ${partnerA.dealbreakers?.join(', ') || 'None specified'}

    **Partner B Preferences:**
    - Loved Cuisines: ${partnerB.lovedCuisines?.join(', ') || 'None specified'}
    - Disliked Cuisines: ${partnerB.dislikedCuisines?.join(', ') || 'None specified'}
    - Desired Vibe: ${partnerB.vibe?.join(', ') || 'None specified'}
    - Hobbies & Interests: ${[...(partnerB.hobbiesInterests || []), ...(partnerB.customHobbies ? partnerB.customHobbies.split(',').map(h => h.trim()).filter(h => h) : [])].join(', ') || 'None specified'}
    - Dealbreakers: ${partnerB.dealbreakers?.join(', ') || 'None specified'}

    Return exactly 5 search terms that would find venues suitable for their date. Focus on:
    1. Food venues (if they want food)
    2. Activity venues (based on their vibe preferences and hobbies/interests)
    3. Drink venues (if they want drinks)
    4. Entertainment venues that align with their hobbies and interests
    5. Unique venues that match their specific interests and activities

    **Output Format (JSON):**
    {
      "searchTerms": [
        "Italian restaurants",
        "art museums",
        "wine bars",
        "bowling alleys", 
        "coffee shops"
      ]
    }
  `;

  try {
    console.log('Generating search terms...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    return parsed.searchTerms || [];
  } catch (error) {
    console.error('Error generating search terms:', error);
    // Fallback search terms
    return ['restaurants', 'cafes', 'entertainment venues', 'museums', 'parks'];
  }
}

// Step 2: Search Google Places API for venues
async function searchGooglePlaces(searchTerm, location, radius, priceLevel) {
  if (!googlePlacesApiKey) {
    console.warn('Google Places API key not configured');
    return [];
  }

  try {
    // Get coordinates for the location (simplified - in production use Geocoding API)
    const coords = await getLocationCoordinates(location);
    
    // Convert miles to meters (Google Places uses meters)
    const radiusMeters = radius * 1609.34;

    // Use Google Places Text Search API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
      `query=${encodeURIComponent(searchTerm + ' near ' + location)}&` +
      `location=${coords.lat},${coords.lng}&` +
      `radius=${radiusMeters}&` +
      `maxprice=${priceLevel}&` +
      `key=${googlePlacesApiKey}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    // Return top 20 results with relevant information
    return (data.results || []).slice(0, 20).map(place => ({
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      priceLevel: place.price_level,
      types: place.types,
      photos: place.photos,
      placeId: place.place_id
    }));

  } catch (error) {
    console.error(`Error searching Google Places for "${searchTerm}":`, error);
    return [];
  }
}

// Step 3: Generate final date ideas using venue data
async function generateFinalDateIdeas(partnerA, partnerB, allVenues) {
  const prompt = `
    You are a creative date planning assistant. Using the real venue data provided below, create 3 unique and exciting date ideas that combine multiple venues.
    Each date should include 2-3 venues to create a complete experience (e.g., dinner + activity, coffee + museum + walk).

    **Survey Preferences:**
    - Location: ${partnerA.location}
    - Date Duration: ${partnerA.dateDuration}
    - Max Travel Distance: ${partnerA.travelDistance} miles
    - Budget: $${partnerA.budget}
    - Include Food: ${partnerA.includeFood ? 'Yes' : 'No'}
    - Include Drinks: ${partnerA.includeDrinks ? 'Yes' : 'No'}
    - Indoor/Outdoor: ${partnerA.indoorOutdoor} / ${partnerB.indoorOutdoor}
    - Public/Private: ${partnerA.publicPrivate} / ${partnerB.publicPrivate}

    **Shared Preferences:**
    - Loved Cuisines: ${[...(partnerA.lovedCuisines || []), ...(partnerB.lovedCuisines || [])].join(', ') || 'None specified'}
    - Disliked Cuisines: ${[...(partnerA.dislikedCuisines || []), ...(partnerB.dislikedCuisines || [])].join(', ') || 'None specified'}
    - Desired Vibe: ${[...(partnerA.vibe || []), ...(partnerB.vibe || [])].join(', ') || 'None specified'}
    - Shared Hobbies & Interests: ${[
      ...(partnerA.hobbiesInterests || []), 
      ...(partnerA.customHobbies ? partnerA.customHobbies.split(',').map(h => h.trim()).filter(h => h) : []),
      ...(partnerB.hobbiesInterests || []), 
      ...(partnerB.customHobbies ? partnerB.customHobbies.split(',').map(h => h.trim()).filter(h => h) : [])
    ].join(', ') || 'None specified'}
    - Dealbreakers: ${[...(partnerA.dealbreakers || []), ...(partnerB.dealbreakers || [])].join(', ') || 'None specified'}

    **Available Venues:**
    ${allVenues.map(venue => `- ${venue.name} (${venue.address}) - Rating: ${venue.rating || 'N/A'}, Price: ${venue.priceLevel ? '$'.repeat(venue.priceLevel) : 'N/A'}, Types: ${venue.types?.slice(0, 3).join(', ') || 'N/A'}`).join('\n')}

    **Instructions:**
    1. Create 3 distinct date ideas, each combining 2-3 specific venues from the list above
    2. Ensure each date respects their budget, preferences, and constraints
    3. Create a logical flow between venues (proximity, timing, etc.)
    4. Make each date unique in vibe and experience, incorporating their shared hobbies and interests
    5. Use the EXACT venue names from the list above
    6. Consider how their hobbies and interests can enhance each date experience

    **Output Format (JSON):**
    {
      "dateIdeas": [
        {
          "id": "date1",
          "title": "Creative Date Title",
          "description": "A compelling description explaining the flow between venues and why it fits their preferences (2-3 sentences).",
          "venues": [
            {
              "name": "Exact venue name from list",
              "address": "Venue address",
              "role": "dinner" // or "activity", "drinks", etc.
            }
          ],
          "duration": "Approx. 3 hours",
          "estimatedCost": "$80-120",
          "vibe": ["romantic", "cultural"],
          "includesFood": true,
          "includesDrinks": false,
          "indoor": true,
          "public": true
        }
      ]
    }
  `;

  try {
    console.log('Generating final date ideas with venue data...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    return parsed.dateIdeas || [];
  } catch (error) {
    console.error('Error generating final date ideas:', error);
    // Fallback to simple date idea
    return [{
      id: 'fallback1',
      title: 'Local Exploration Date',
      description: 'A relaxed date exploring local venues and enjoying good conversation.',
      venues: [
        {
          name: `A local restaurant in ${partnerA.location}`,
          address: partnerA.location,
          role: 'dinner'
        }
      ],
      duration: 'Approx. 2 hours',
      estimatedCost: '$40-80',
      vibe: ['casual', 'conversational'],
      includesFood: true,
      includesDrinks: false,
      indoor: true,
      public: true
    }];
  }
}

// Main function: 3-step date idea generation process
async function generateDateIdeas(partnerA, partnerB) {
  try {
    console.log('Starting 3-step date idea generation process...');
    
    // Step 1: Generate search terms
    console.log('Step 1: Generating search terms...');
    const searchTerms = await generateSearchTerms(partnerA, partnerB);
    console.log('Generated search terms:', searchTerms);

    // Step 2: Search Google Places for each term
    console.log('Step 2: Searching Google Places...');
    const priceLevel = mapBudgetToPriceLevel(partnerA.budget);
    const radius = partnerA.travelDistance || 10; // miles
    
    const allVenues = [];
    for (const searchTerm of searchTerms) {
      console.log(`Searching for: ${searchTerm}`);
      const venues = await searchGooglePlaces(searchTerm, partnerA.location, radius, priceLevel);
      allVenues.push(...venues);
    }
    
    console.log(`Found ${allVenues.length} total venues`);

    // Remove duplicates based on name and address
    const uniqueVenues = allVenues.filter((venue, index, self) => 
      index === self.findIndex(v => v.name === venue.name && v.address === venue.address)
    );
    
    console.log(`${uniqueVenues.length} unique venues after deduplication`);

    // Step 3: Generate final date ideas using venue data
    console.log('Step 3: Generating final date ideas...');
    const dateIdeas = await generateFinalDateIdeas(partnerA, partnerB, uniqueVenues);
    
    console.log(`Generated ${dateIdeas.length} date ideas`);
    return dateIdeas.slice(0, 3); // Ensure we return exactly 3 ideas

  } catch (error) {
    console.error('Error in 3-step date generation process:', error);
    // Fallback to original simple approach
    return [{
      id: 'fallback1',
      title: 'Cozy Coffee & Local Walk',
      description: 'A relaxed date enjoying conversation over coffee and exploring the local area.',
      venues: [
        {
          name: `A local cafe in ${partnerA.location}`,
          address: partnerA.location,
          role: 'coffee'
        }
      ],
      duration: 'Approx. 2 hours',
      estimatedCost: '$20-40',
      vibe: ['conversational', 'relaxed'],
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
    - Hobbies & Interests: ${[...(partnerA.hobbiesInterests || []), ...(partnerA.customHobbies ? partnerA.customHobbies.split(',').map(h => h.trim()).filter(h => h) : [])].join(', ') || 'None specified'}
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
    - Hobbies & Interests: ${[...(partnerB.hobbiesInterests || []), ...(partnerB.customHobbies ? partnerB.customHobbies.split(',').map(h => h.trim()).filter(h => h) : [])].join(', ') || 'None specified'}
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
app.post('/api/initiate', async (req, res) => {
  try {
    console.log('Received initiate request');
    const uuid = uuidv4();
    const partnerAData = req.body;
    
    // Get phone from form data
    const originatorPhone = partnerAData.phone;
    
    if (!originatorPhone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

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

    // Determine the correct base URL for the share link
    // Use the origin from the request headers if available (for development)
    const origin = req.get('origin') || req.get('referer');
    let baseUrl = process.env.BASE_URL;
    
    // If request is coming from localhost, use localhost for the share URL
    if (origin && origin.includes('localhost')) {
      baseUrl = origin;
    }
    
    const shareUrl = `${baseUrl}/date/${uuid}`;
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

// POST /api/respond/:uuid - Partner B submits their preferences and selects 2 dates
app.post('/api/respond/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const { partnerBData, selectedDateIds } = req.body;
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

    console.log('Request body:', { partnerBData: !!partnerBData, selectedDateIds: !!selectedDateIds });
    console.log('Session status:', session.status);
    
    // If this is the first step (Partner B filling out preferences), generate date ideas
    if (partnerBData && !selectedDateIds) {
      console.log('Taking first path: Partner B submitting preferences');
      if (session.status !== 'initiated') {
        console.log('Error: Session status is not initiated, it is:', session.status);
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

      // Determine the correct base URL for the results link
      const origin = req.get('origin') || req.get('referer');
      let baseUrl = process.env.BASE_URL;
      
      if (origin && origin.includes('localhost')) {
        baseUrl = origin;
      }

      res.json({
        success: true,
        dateOptions: session.dateOptions,
        resultsUrl: `${baseUrl}/results/${uuid}`
      });
    } 
    // If this is the second step (Partner B selecting 2 dates)
    else if (selectedDateIds) {
      console.log('Taking second path: Partner B selecting dates');
      if (session.status !== 'partner_b_responded') {
        console.log('Error: Session status is not partner_b_responded, it is:', session.status);
        return res.status(400).json({ success: false, error: 'Invalid session status for date selection.' });
      }
      
      if (!selectedDateIds || selectedDateIds.length !== 2) {
        return res.status(400).json({ success: false, error: 'Must select exactly 2 date options' });
      }

      session.selectedOptions = selectedDateIds;
      session.status = 'partner_b_selected';
      session.updatedAt = new Date();

      // Save the updated session
      if (storageType === 'mongo') {
        await session.save();
        console.log('Partner B date selections saved to MongoDB');
      } else {
        tempSessions.set(uuid, session);
        console.log('Partner B date selections saved to temporary storage');
      }

      // Send SMS to Partner A (originator) with link to choose final date
      if (session.originatorPhone) {
        try {
          const origin = req.get('origin') || req.get('referer');
          let baseUrl = process.env.BASE_URL;
          
          if (origin && origin.includes('localhost')) {
            baseUrl = origin;
          }

          const finalChoiceUrl = `${baseUrl}/final-choice/${uuid}`;
          
          console.log('Sending SMS to Partner A for final choice:', session.originatorPhone);
          const smsResult = await sendPartnerAFinalChoiceSMS(session.originatorPhone, finalChoiceUrl);
          if (smsResult.success) {
            console.log('Partner A final choice SMS sent successfully');
          } else {
            console.warn('Failed to send Partner A final choice SMS:', smsResult.message);
          }
        } catch (smsError) {
          console.error('Error sending Partner A final choice SMS:', smsError);
        }
      }

      res.json({
        success: true,
        message: 'Date options selected. Partner A has been notified to make the final choice.'
      });
    } else {
      console.log('Taking neither path - invalid request');
      return res.status(400).json({ success: false, error: 'Invalid request. Must provide either partnerBData or selectedDateIds.' });
    }
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

// GET /api/final-choice/:uuid - Get 2 selected dates for Partner A to choose from
app.get('/api/final-choice/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    let session = null;

    // Try to find in MongoDB first
    try {
      session = await DateSession.findOne({ uuid });
    } catch (mongoError) {
      session = tempSessions.get(uuid);
    }

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (session.status !== 'partner_b_selected') {
      return res.status(400).json({ success: false, error: 'Invalid session status' });
    }

    // Get the 2 selected date options
    const selectedDates = session.dateOptions.filter(option => 
      session.selectedOptions.includes(option.id)
    );

    res.json({
      success: true,
      selectedDates,
      sessionStatus: session.status
    });
  } catch (error) {
    console.error('Error fetching final choice options:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/final-choice/:uuid - Partner A makes final choice
app.post('/api/final-choice/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const { finalChoice } = req.body;

    let session = null;
    let usingTempStorage = false;

    // Try to find in MongoDB first
    try {
      session = await DateSession.findOne({ uuid });
    } catch (mongoError) {
      session = tempSessions.get(uuid);
      usingTempStorage = true;
    }

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (session.status !== 'partner_b_selected') {
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
      tempSessions.set(uuid, session);
    }

    const finalDate = session.dateOptions.find(option => option.id === finalChoice);

    // Send SMS to Partner B with the final date choice
    if (session.partnerB?.phone) {
      try {
        console.log('Sending confirmation SMS to Partner B:', session.partnerB.phone);
        const smsResult = await sendPartnerBConfirmationSMS(session.partnerB.phone, finalDate);
        if (smsResult.success) {
          console.log('Partner B confirmation SMS sent successfully');
        } else {
          console.warn('Failed to send Partner B confirmation SMS:', smsResult.message);
        }
      } catch (smsError) {
        console.error('Error sending Partner B confirmation SMS:', smsError);
      }
    }

    // Send SMS to Partner A with the final date details
    if (session.originatorPhone) {
      try {
        const selectedTimeRange = session.partnerB?.selectedTimeRanges?.length > 0 
          ? session.partnerA.proposedTimeRanges.find(tr => session.partnerB.selectedTimeRanges.includes(tr.id))?.displayText
          : null;

        console.log('Sending final date SMS to Partner A:', session.originatorPhone);
        const smsResult = await sendFinalDateSMS(session.originatorPhone, finalDate, selectedTimeRange);
        if (smsResult.success) {
          console.log('Final date SMS sent successfully to Partner A');
        } else {
          console.warn('Failed to send final date SMS to Partner A:', smsResult.message);
        }
      } catch (smsError) {
        console.error('Error sending final date SMS to Partner A:', smsError);
      }
    }

    res.json({
      success: true,
      finalDate,
      message: 'Date confirmed! Both partners have been notified.'
    });
  } catch (error) {
    console.error('Error making final choice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/finalize/:uuid - Partner B makes final choice (DEPRECATED - keeping for compatibility)
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