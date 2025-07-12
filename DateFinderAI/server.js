const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5001;

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
    cuisinePreferences: [String],
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
    cuisinePreferences: [String],
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

// Mock LLM function to generate date ideas
function generateDateIdeas(partnerAData, partnerBData) {
  const dateIdeas = [
    {
      id: 'date1',
      title: 'Sunset Picnic & Wine Tasting',
      description: 'A romantic outdoor picnic with local wine tasting at a scenic overlook',
      location: 'Hillside Park Overlook',
      duration: '3 hours',
      cost: '$80-120',
      vibe: ['romantic', 'nature', 'conversational'],
      includesFood: true,
      includesDrinks: true,
      indoor: false,
      public: true,
    },
    {
      id: 'date2',
      title: 'Cooking Class & Dinner',
      description: 'Learn to cook a new cuisine together followed by enjoying your creations',
      location: 'Local Culinary Studio',
      duration: '2.5 hours',
      cost: '$120-150',
      vibe: ['interactive', 'creative', 'conversational'],
      includesFood: true,
      includesDrinks: false,
      indoor: true,
      public: false,
    },
    {
      id: 'date3',
      title: 'Art Gallery & Cocktail Bar',
      description: 'Explore contemporary art followed by craft cocktails at a rooftop bar',
      location: 'Downtown Arts District',
      duration: '4 hours',
      cost: '$100-140',
      vibe: ['cultural', 'conversational', 'creative'],
      includesFood: false,
      includesDrinks: true,
      indoor: true,
      public: true,
    },
    {
      id: 'date4',
      title: 'Hiking & Coffee',
      description: 'Scenic nature hike followed by cozy coffee shop conversation',
      location: 'Nature Trail & Local Café',
      duration: '3 hours',
      cost: '$20-40',
      vibe: ['active', 'nature', 'conversational'],
      includesFood: true,
      includesDrinks: false,
      indoor: false,
      public: true,
    },
    {
      id: 'date5',
      title: 'Pottery & Brunch',
      description: 'Create pottery together followed by a leisurely brunch',
      location: 'Ceramics Studio & Bistro',
      duration: '3.5 hours',
      cost: '$90-110',
      vibe: ['creative', 'interactive', 'conversational'],
      includesFood: true,
      includesDrinks: false,
      indoor: true,
      public: false,
    }
  ];

  // Simple filtering based on preferences
  let filteredIdeas = dateIdeas.filter(idea => {
    // Filter by budget
    const maxBudget = partnerAData.budget || 200;
    const ideaCost = parseInt(idea.cost.split('-')[1]) || 0;
    if (ideaCost > maxBudget) return false;

    // Filter by food/drinks preferences
    if (partnerAData.includeFood === false && idea.includesFood) return false;
    if (partnerAData.includeDrinks === false && idea.includesDrinks) return false;

    // Filter by indoor/outdoor preference
    if (partnerAData.indoorOutdoor === 'indoor' && !idea.indoor) return false;
    if (partnerAData.indoorOutdoor === 'outdoor' && idea.indoor) return false;

    return true;
  });

  // Return 3 random ideas or all if less than 3
  if (filteredIdeas.length <= 3) return filteredIdeas;
  
  const shuffled = filteredIdeas.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// API Routes

// POST /api/initiate - Partner A starts the process
app.post('/api/initiate', async (req, res) => {
  try {
    const uuid = uuidv4();
    const partnerAData = req.body;

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
      console.log('MongoDB unavailable, using temporary storage');
      tempSessions.set(uuid, sessionData);
    }

    res.json({
      success: true,
      uuid,
      shareUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/date/${uuid}`
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

    // Return only metadata, not Partner A's answers
    res.json({
      success: true,
      exists: true,
      status: session.status,
      createdAt: session.createdAt
    });
  } catch (error) {
    console.error('Error fetching date session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/respond/:uuid - Partner B responds
app.post('/api/respond/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const partnerBData = req.body;

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

    if (session.status !== 'initiated') {
      return res.status(400).json({ success: false, error: 'Session already completed' });
    }

    // Generate date ideas using mock LLM
    const dateOptions = generateDateIdeas(session.partnerA, partnerBData);

    session.partnerB = partnerBData;
    session.dateOptions = dateOptions;
    session.status = 'partner_b_responded';
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

    res.json({
      success: true,
      dateOptions,
      resultsUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/results/${uuid}`
    });
  } catch (error) {
    console.error('Error responding to date session:', error);
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