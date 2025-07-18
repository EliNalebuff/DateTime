# 💕 DateFinder AI

A full-stack AI-powered date planning application that generates personalized date recommendations using real venue data from Google Places API and OpenAI's GPT-4o-mini.

## 🌟 Features

- **5-Step AI Date Generation**: Advanced process using OpenAI and Google Places APIs
- **Real Venue Data**: Live venue information with reviews, ratings, hours, and contact details
- **Intelligent Venue Diversity**: Prevents duplicate venue types, creates complementary experiences
- **Comprehensive Surveys**: Detailed preference collection for both partners
- **Multi-Venue Date Ideas**: Combines 2-3 venues per date (dinner + activity + drinks)
- **Time-Aware Planning**: Verifies venue hours against selected date/time
- **Email Notifications**: Automated confirmations and final date details
- **Icebreaker Games**: AI-generated questions for the actual date
- **Privacy Protection**: Partner preferences remain separate until final selection
- **Mobile-First Design**: Responsive UI with smooth animations

## 🚀 Tech Stack

### Frontend
- **Next.js 14** with App Router and TypeScript
- **React** with Server Components
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose (fallback to in-memory storage)
- **OpenAI GPT-4o-mini** for AI processing
- **Google Places API** for venue data
- **Google Geocoding API** for location services
- **Nodemailer** for email notifications

### AI & Data Sources
- **OpenAI API**: Search term generation, venue filtering, date idea creation
- **Google Places Text Search**: Finding venues by category
- **Google Places Details**: Reviews, hours, contact information
- **Google Geocoding**: Location coordinate conversion

## 🤖 AI-Powered Date Generation Process

### **Step 1: Generate 10 Diverse Search Terms**
AI analyzes both partners' preferences to create search terms across categories:
- Main dining venues (based on loved cuisines)
- Casual food venues (cafes, bakeries, ice cream shops)
- Drink venues (bars, breweries, wine lounges)
- Entertainment venues (theaters, live music, comedy clubs)
- Activity venues (museums, galleries, bowling, mini golf)
- Outdoor venues (parks, gardens, waterfronts, hiking trails)
- Experience venues (cooking classes, workshops, tours)
- Shopping/browsing venues (markets, bookstores, boutiques)
- Wellness venues (spas, yoga studios, meditation centers)
- Unique local venues (rooftops, speakeasies, historic sites)

### **Step 2: Google Places API Search**
For each search term:
- Converts location to GPS coordinates
- Searches within specified radius and budget
- Selects **top 2 highest-rated venues** per category
- Results in ~20 diverse, high-quality venues

### **Step 3: Venue Deduplication**
Removes duplicate venues based on name and address to ensure unique options.

### **Step 4: Enhanced Venue Details**
Fetches comprehensive information for each venue:
- Customer reviews and ratings
- Detailed operating hours
- Phone numbers and websites
- Google Maps links
- Business status verification

### **Step 5: AI Date Idea Creation**
Creates 3 unique date ideas with:
- **Opening hours verification** for selected date/time
- **No duplicate venue types** (prevents "restaurant + restaurant")
- **Complementary venue combinations** (dinner + activity + drinks)
- **Geographic optimization** (venues within 2-3 miles)
- **Budget compliance** and cost estimation
- **Review-based quality assessment**

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **OpenAI API Key** (for AI processing)
- **Google Places API Key** (for venue data)
- **Gmail Account** (for email notifications)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EliNalebuff/DateTime.git
   cd DateTime/DateFinderAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/datefinder-ai
   
   # Server Configuration
   BASE_URL=http://localhost:3000
   PORT=5000
   NODE_ENV=development
   
   # AI Services
   OPENAI_API_KEY=your-openai-api-key-here
   GOOGLE_PLACES_API_KEY=your-google-places-api-key-here
   
   # Email Service (Gmail)
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=your-app-password
   
   # Authentication
   JWT_SECRET=your-jwt-secret-here
   ```

4. **Start MongoDB** (if using local instance)
   ```bash
   # macOS with Homebrew
   brew services start mongodb/brew/mongodb-community
   
   # Ubuntu/Debian
   sudo systemctl start mongod
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
Starts both frontend (http://localhost:3000) and backend (http://localhost:5000)

### Individual Services
```bash
npm run client   # Frontend only
npm run server   # Backend only
```

### Production
```bash
npm run build
npm start
```

## 🎯 Application Flow

### **1. Partner A Planning** (`/plan`)
Comprehensive survey including:
- **Location & Timing**: Where and when to meet
- **Budget & Travel**: Spending limits and distance preferences
- **Food Preferences**: Loved cuisines, dietary restrictions, dealbreakers
- **Activity Preferences**: Indoor/outdoor, public/private, vibe preferences
- **Personal Details**: Hobbies, interests, background (optional but enhances matching)

### **2. Share Link Generation**
Creates unique UUID-based link for Partner B with email notification option.

### **3. Partner B Response** (`/date/[uuid]`)
Partner B completes their preferences and AI generates 3 personalized date ideas.

### **4. Date Selection** (`/results/[uuid]`)
- **Phase 1**: Partner A reviews and selects 2 favorite options
- **Phase 2**: Partner B chooses the final date
- **Phase 3**: Email confirmations sent to both partners

### **5. Icebreaker Game** (`/icebreaker/[gameId]`)
AI-generated questions based on survey responses for use during the actual date.

## 📡 API Endpoints

### Core Date Planning
- `POST /api/initiate` - Create date session (Partner A)
- `GET /api/date/:uuid` - Get session data
- `POST /api/respond/:uuid` - Partner B preferences + AI generation
- `GET /api/results/:uuid` - Retrieve generated date options
- `POST /api/select/:uuid` - Partner A selects 2 favorites  
- `POST /api/finalize/:uuid` - Partner B final choice

### Icebreaker Game
- `POST /api/icebreaker/create/:uuid` - Generate icebreaker questions
- `GET /api/icebreaker/:gameId` - Get game data
- `POST /api/icebreaker/:gameId/answer` - Submit answers
- `POST /api/icebreaker/:gameId/custom-question` - Add custom questions

### Authentication (Optional)
- `POST /api/auth/send-code` - Email verification
- `POST /api/auth/verify-code` - Verify email code
- `POST /api/auth/login` - User login

## 🎨 Venue Categories & Search Terms

The AI intelligently selects from these venue types:
- **Dining**: Italian restaurants, sushi bars, farm-to-table, food trucks
- **Casual Food**: Coffee shops, bakeries, ice cream parlors, juice bars
- **Drinks**: Wine bars, craft breweries, cocktail lounges, rooftop bars
- **Entertainment**: Live music venues, comedy clubs, theaters, trivia nights
- **Activities**: Art museums, bowling alleys, mini golf, escape rooms
- **Outdoor**: Parks, botanical gardens, waterfronts, hiking trails
- **Experiences**: Cooking classes, pottery studios, wine tastings, tours
- **Shopping**: Farmers markets, bookstores, vintage shops, art galleries
- **Wellness**: Spas, yoga studios, meditation centers, hot springs
- **Unique**: Speakeasies, rooftop venues, historic sites, observation decks

## 🔧 Key Features

### **Intelligent Venue Selection**
- Prevents duplicate venue types in single dates
- Creates natural flow (coffee → museum → park)
- Considers travel distance between venues
- Verifies opening hours for selected date/time

### **Real-Time Data Integration**
- Live venue ratings and reviews
- Current business hours and status
- Contact information for reservations
- Google Maps integration

### **Personalization Algorithm**
- Analyzes shared preferences and interests
- Considers dealbreakers and dietary restrictions
- Adapts to budget and location constraints
- Incorporates personal background for enhanced matching

### **Email Notifications**
- Share link delivery to Partner B
- Final date confirmation with all venue details
- Icebreaker game scheduling (20 min after date start)

## 📱 Responsive Design

Optimized for all devices:
- **Mobile**: 320px+ with touch-friendly interface
- **Tablet**: 768px+ with enhanced layouts
- **Desktop**: 1024px+ with full feature set
- **Large Screens**: 1440px+ with expanded content

## 🧪 Testing the Application

### Complete Flow Test
1. Visit `/plan` and complete Partner A survey
2. Copy generated share link
3. Open link in incognito window as Partner B
4. Complete Partner B preferences
5. Verify 3 AI-generated date ideas appear
6. Select 2 options as Partner A
7. Choose final date as Partner B
8. Confirm email notifications are sent

### AI Quality Checks
- Verify venue diversity (no duplicate types)
- Check opening hours alignment
- Validate budget compliance
- Confirm geographic proximity of venues

## 🔮 Recent Improvements

### **Enhanced Search Diversity** (v2.0)
- Increased from 5 to 10 search terms
- Explicit prevention of duplicate venue types
- Better category distribution

### **Optimized Venue Selection** (v2.0)
- Top 2 venues per search term (~20 total)
- Eliminated AI filtering bottleneck
- Improved venue quality and variety

### **Intelligent Date Flows** (v2.0)
- Complementary venue combinations
- Natural progression (dinner → activity → drinks)
- Enhanced geographic optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o-mini API
- **Google** for Places and Geocoding APIs
- **MongoDB** for flexible data storage
- **Next.js** team for excellent developer experience

---

**Creating better connections through AI-powered planning! 💕** 