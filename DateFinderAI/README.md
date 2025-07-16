# 💕 DateFinder AI

A full-stack AI-powered matchmaking and date planning application built with Next.js, Express, and MongoDB.

## 🌟 Features

- **AI-Powered Matching**: Smart algorithm considers both partners' preferences to suggest perfect dates
- **Multi-Step Planning**: Comprehensive questionnaire for Partner A to capture all preferences
- **Partner B Response**: Simplified form for the date partner to share their preferences
- **Curated Date Ideas**: 3 AI-generated, personalized date suggestions
- **Two-Step Selection**: Partner A selects 2 favorites, Partner B chooses the final date
- **Privacy First**: Partner A's individual answers remain private
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Real-time Updates**: Seamless flow from planning to final selection

## 🚀 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **UUID** for unique session links
- **CORS** for cross-origin requests

### Additional Tools
- **React Hook Form** for form management
- **Axios** for API calls
- **Clsx** and **Tailwind Merge** for utility classes

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DateFinderAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/datefinder-ai
   BASE_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   PORT=5000
   NODE_ENV=development
   OPENAI_API_KEY=your-openai-api-key-here
   GOOGLE_PLACES_API_KEY=your-google-places-api-key-here
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For macOS with Homebrew
   brew services start mongodb/brew/mongodb-community
   
   # For Ubuntu/Debian
   sudo systemctl start mongod
   
   # For Windows
   net start MongoDB
   ```

## 🏃‍♂️ Running the Application

### Development Mode

Run both frontend and backend simultaneously:
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Individual Services

Run frontend only:
```bash
npm run client
```

Run backend only:
```bash
npm run server
```

### Production Build

Build the application:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## 🎯 How It Works

### 1. **Welcome Page** (`/`)
- Landing page with feature overview
- Call-to-action to start planning

### 2. **Partner A Planning** (`/plan`)
- **Step 1**: Location & Timing preferences
- **Step 2**: Budget & Food preferences  
- **Step 3**: Vibe & Personal preferences
- **Step 4**: Review & Generate shareable link

### 3. **Partner B Response** (`/date/[id]`)
- Simplified questionnaire for the date partner
- No access to Partner A's individual answers
- Generates 3 AI-curated date ideas

### 4. **Results & Selection** (`/results/[id]`)
- **Phase 1**: Partner A selects 2 favorite options
- **Phase 2**: Partner B chooses the final date
- **Phase 3**: Confirmed date with details

## 📡 API Endpoints

### Core Routes
- `POST /api/initiate` - Create new date session (Partner A)
- `GET /api/date/:uuid` - Get session metadata
- `POST /api/respond/:uuid` - Submit Partner B responses
- `GET /api/results/:uuid` - Get generated date options
- `POST /api/select/:uuid` - Partner A selects 2 options
- `POST /api/finalize/:uuid` - Partner B makes final choice

### Utility
- `GET /api/health` - Health check endpoint

## 🎨 Design System

### Color Palette
- **Primary**: Blush pink (#e86875)
- **Secondary**: Dark navy (#1a1f3a)
- **Accent**: Soft purple (#ac82ff)
- **Cream**: Warm cream (#fdf9f0)

### Typography
- **Primary**: Inter font family
- **Display**: Satoshi (fallback to Inter)

### Components
- Reusable UI components in `/src/components/`
- Consistent styling with Tailwind CSS
- Custom animations with Framer Motion

## 🔮 Future Enhancements

- **Real LLM Integration**: Replace mock AI with actual language models
- **Location Services**: Integrate with Google Maps API
- **User Authentication**: Add user accounts and date history
- **Push Notifications**: Real-time updates for partners
- **Social Features**: Share successful dates, reviews
- **Advanced Matching**: Machine learning for better suggestions
- **Booking Integration**: Direct reservation capabilities
- **Mobile App**: React Native version

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Mobile**: 320px and up
- **Tablet**: 768px and up  
- **Desktop**: 1024px and up
- **Large Desktop**: 1440px and up

## 🧪 Testing

### Manual Testing Flow
1. Start the application
2. Navigate to the welcome page
3. Click "Start Planning" to begin Partner A flow
4. Complete all 4 steps of the planning process
5. Copy the generated link
6. Open the link in a new browser/incognito window
7. Complete Partner B questionnaire
8. Verify 3 date options are generated
9. Select 2 options as Partner A
10. Choose final date as Partner B
11. Confirm final selection

### Database Testing
- Verify MongoDB connection
- Check session creation and updates
- Validate data persistence across steps

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with love for better connections
- Inspired by the need for more personalized dating experiences
- Special thanks to the open-source community

---

**Happy Dating! 💕** 