const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/datefinder';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log(`API Key length: ${OPENAI_API_KEY ? OPENAI_API_KEY.length : 0}`);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Schema
const dateSessionSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  partnerAData: {
    location: String,
    proposedTimes: [{
      id: String,
      date: String,
      time: String
    }],
    dateDuration: String,
    dateActivities: [String],
    relationshipType: String,
    budget: String,
    additionalInfo: String
  },
  partnerBData: {
    selectedTimeSlot: {
      id: String,
      date: String,
      time: String
    },
    dietaryRestrictions: [String],
    interests: [String],
    accessibilityNeeds: String,
    additionalInfo: String
  },
  dateIdeas: [{
    id: String,
    title: String,
    description: String,
    cost: String,
    duration: String,
    accessibility: String,
    timeSlot: {
      date: String,
      time: String
    }
  }],
  finalChoice: {
    dateId: String,
    confirmed: Boolean,
    timestamp: Date
  },
  createdAt: { type: Date, default: Date.now }
});

const DateSession = mongoose.model('DateSession', dateSessionSchema);

// In-memory storage fallback
let inMemoryStorage = new Map();
let usingInMemoryStorage = false;

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    usingInMemoryStorage = false;
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    console.log('Server will continue running without database functionality');
    console.log('Using in-memory storage for sessions');
    usingInMemoryStorage = true;
  });

// Helper function to save session
async function saveSession(sessionData) {
  if (usingInMemoryStorage) {
    inMemoryStorage.set(sessionData.uuid, sessionData);
    console.log(`Session saved to temporary storage with UUID: ${sessionData.uuid}`);
    return sessionData;
  } else {
    try {
      const session = new DateSession(sessionData);
      await session.save();
      console.log(`Session saved to MongoDB with UUID: ${sessionData.uuid}`);
      return session;
    } catch (error) {
      console.log('MongoDB unavailable, using temporary storage:', error.message);
      inMemoryStorage.set(sessionData.uuid, sessionData);
      console.log(`Session saved to temporary storage with UUID: ${sessionData.uuid}`);
      return sessionData;
    }
  }
}

// Helper function to get session
async function getSession(uuid) {
  if (usingInMemoryStorage || inMemoryStorage.has(uuid)) {
    return inMemoryStorage.get(uuid);
  } else {
    try {
      return await DateSession.findOne({ uuid });
    } catch (error) {
      console.log('MongoDB unavailable, checking temporary storage:', error.message);
      return inMemoryStorage.get(uuid);
    }
  }
}

// Helper function to update session
async function updateSession(uuid, updateData) {
  if (usingInMemoryStorage || inMemoryStorage.has(uuid)) {
    const existingSession = inMemoryStorage.get(uuid) || {};
    const updatedSession = { ...existingSession, ...updateData };
    inMemoryStorage.set(uuid, updatedSession);
    console.log(`Session updated in temporary storage with UUID: ${uuid}`);
    return updatedSession;
  } else {
    try {
      const updatedSession = await DateSession.findOneAndUpdate(
        { uuid },
        updateData,
        { new: true, upsert: true }
      );
      console.log(`Session updated in MongoDB with UUID: ${uuid}`);
      return updatedSession;
    } catch (error) {
      console.log('MongoDB unavailable, using temporary storage:', error.message);
      const existingSession = inMemoryStorage.get(uuid) || {};
      const updatedSession = { ...existingSession, ...updateData };
      inMemoryStorage.set(uuid, updatedSession);
      console.log(`Session updated in temporary storage with UUID: ${uuid}`);
      return updatedSession;
    }
  }
}

// Generate date ideas using OpenAI
async function generateDateIdeas(partnerAData, partnerBData) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const location = partnerAData.location;
  const selectedTimeSlot = partnerBData.selectedTimeSlot;
  const dateDuration = partnerAData.dateDuration;
  const activities = partnerAData.dateActivities || [];
  const interests = partnerBData.interests || [];
  const dietaryRestrictions = partnerBData.dietaryRestrictions || [];
  const budget = partnerAData.budget;
  const relationshipType = partnerAData.relationshipType;
  const accessibilityNeeds = partnerBData.accessibilityNeeds;

  const prompt = `Generate 3 creative date ideas for a ${relationshipType} in ${location} on ${selectedTimeSlot.date} at ${selectedTimeSlot.time}.

Date Details:
- Duration: ${dateDuration}
- Budget: ${budget}
- Preferred activities: ${activities.join(', ')}
- Interests: ${interests.join(', ')}
- Dietary restrictions: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'None'}
- Accessibility needs: ${accessibilityNeeds || 'None specified'}

Please provide exactly 3 date ideas in this JSON format:
{
  "dates": [
    {
      "id": "date1",
      "title": "Date Title",
      "description": "Detailed description of the date including specific venues, activities, and timing",
      "cost": "Estimated cost range",
      "duration": "Expected duration",
      "accessibility": "Accessibility information",
      "timeSlot": {
        "date": "${selectedTimeSlot.date}",
        "time": "${selectedTimeSlot.time}"
      }
    }
  ]
}

Make each date idea unique, practical, and tailored to the preferences provided. Include specific venue suggestions when possible.`;

  try {
    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a creative date planning assistant. Always respond with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.8,
    });

    const response = completion.choices[0].message.content.trim();
    console.log('OpenAI API response received');
    console.log('Response content:', response.substring(0, 200) + '...');

    // Parse the JSON response
    const parsedResponse = JSON.parse(response);
    console.log('JSON parsed successfully');
    
    return parsedResponse.dates || [];
  } catch (error) {
    console.error('Error generating date ideas:', error);
    throw error;
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: usingInMemoryStorage ? 'in-memory' : 'mongodb',
    openai: !!OPENAI_API_KEY
  });
});

// Initiate date planning (Partner A)
app.post('/api/initiate', async (req, res) => {
  try {
    console.log('Received initiate request');
    const uuid = uuidv4();
    console.log(`Generated UUID: ${uuid}`);
    
    const partnerAData = req.body;
    console.log('Partner A data received:', JSON.stringify(partnerAData).substring(0, 100) + '...');

    // Create session with Partner A data
    const sessionData = {
      uuid,
      partnerAData,
      createdAt: new Date()
    };

    await saveSession(sessionData);

    // Generate share URL
    const shareUrl = `${req.protocol}://${req.get('host')}/date/${uuid}`;
    console.log(`Generated share URL: ${shareUrl}`);

    res.json({
      success: true,
      uuid,
      shareUrl
    });
  } catch (error) {
    console.error('Error in initiate route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create date session'
    });
  }
});

// Partner B responds and generates date ideas
app.post('/api/respond/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const partnerBData = req.body;
    
    console.log(`Received response for UUID: ${uuid}`);
    console.log('Partner B data received:', JSON.stringify(partnerBData).substring(0, 100) + '...');

    // Get existing session
    const session = await getSession(uuid);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Generate date ideas
    const dateIdeas = await generateDateIdeas(session.partnerAData, partnerBData);

    // Update session with Partner B data and date ideas
    const updatedSession = await updateSession(uuid, {
      partnerBData,
      dateIdeas
    });

    console.log('Partner B data and date ideas saved to', usingInMemoryStorage ? 'temporary storage' : 'MongoDB');

    res.json({
      success: true,
      dateIdeas,
      resultsUrl: `${req.protocol}://${req.get('host')}/results/${uuid}`
    });
  } catch (error) {
    console.error('Error in respond route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process response and generate date ideas'
    });
  }
});

// Get session data
app.get('/api/session/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const session = await getSession(uuid);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session'
    });
  }
});

// Confirm final date choice
app.post('/api/confirm/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const { dateId } = req.body;

    const updatedSession = await updateSession(uuid, {
      finalChoice: {
        dateId,
        confirmed: true,
        timestamp: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Date confirmed successfully',
      session: updatedSession
    });
  } catch (error) {
    console.error('Error confirming date:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm date'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 