require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors =require('cors');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/datefinder-ai';

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
  partnerA: {
    location: String,
    availableDays: [String],
    preferredTime: String,
    dateDuration: String,
    travelDistance: Number,
    budget: Number,
    splitCosts: Boolean,
    includeFood: Boolean,
    includeDrinks: Boolean,
    dietaryRestrictions: String,
    lovedCuisines: [String],
    dislikedCuisines: [String],
    vibe: [String],
    physicalTouch: String,
    conversationImportant: Boolean,
    alcoholAvailable: Boolean,
    dealbreakers: [String],
    publicPrivate: String,
    indoorOutdoor: String,
  },
  partnerB: {
    availableDays: [String],
    preferredTime: String,
    dietaryRestrictions: String,
    lovedCuisines: [String],
    dislikedCuisines: [String],
    vibe: [String],
    dealbreakers: [String],
    alcoholPreference: String,
    publicPrivate: String,
    indoorOutdoor: String,
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

// Temporary in-memory storage for when MongoDB is not available
let tempSessions = new Map();

// Real LLM function to generate date ideas
async function generateDateIdeas(partnerA, partnerB) {
  const prompt = `
    You are a creative and insightful date planning assistant.
    Your task is to generate 3 unique, specific, and exciting date ideas based on the shared preferences of two people.
    Analyze their preferences carefully and create tailored suggestions.

    Here are their preferences:

    **Shared Preferences:**
    - Location for the date: ${partnerA.location}
    - Proposed times by Partner A: ${partnerA.proposedTimes && partnerA.proposedTimes.length > 0 ? partnerA.proposedTimes.map(t => t.displayText).join(', ') : 'None specified'}
    - Times selected by Partner B: ${partnerB.selectedTimeSlots && partnerB.selectedTimeSlots.length > 0 ? partnerA.proposedTimes.filter(t => partnerB.selectedTimeSlots.includes(t.id)).map(t => t.displayText).join(', ') : 'None specified'}
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
    2.  For each idea, provide a specific, real-sounding location (e.g., "The Clay Studio" or "Green Lake Park" not "a pottery place" or "a park").
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

// API Routes

// POST /api/initiate - Partner A starts the process
app.post('/api/initiate', async (req, res) => {
  try {
    console.log('Received initiate request');
    const uuid = uuidv4();
    const partnerAData = req.body;

    console.log('Generated UUID:', uuid);
    console.log('Partner A data received:', JSON.stringify(partnerAData).substring(0, 100) + '...');

    const sessionData = {
      uuid,
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

    const shareUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/date/${uuid}`;
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
      proposedTimes: session.partnerA.proposedTimes || []
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
      resultsUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/results/${uuid}`
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

    res.json({
      success: true,
      finalDate
    });
  } catch (error) {
    console.error('Error finalizing choice:', error);
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