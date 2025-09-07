# Real Job Hunter - Complete AI-Powered Job Search Platform

A full-stack job hunting application with AI-powered job matching, resume parsing, and interview preparation.

## 🚀 Features

### Authentication & OAuth
- **Descope Authentication** - Passwordless login with email/SMS
- **Google OAuth** - Connect Google Calendar for interview reminders
- **LinkedIn OAuth** - Import profile data and network connections
- **JWT Session Management** - Secure token-based authentication

### AI-Powered Job Matching
- **RapidAPI Integration** - Real jobs from Indeed, Adzuna, and other sources
- **Gemini AI Ranking** - Intelligent job scoring based on user profile
- **Smart Filtering** - Location, salary, experience level, remote options
- **Resume-Based Matching** - Jobs ranked by resume skills and experience

### Resume & Profile Management
- **PDF Resume Upload** - Automatic text extraction and parsing
- **AI Skill Extraction** - Gemini AI identifies skills and experience
- **Profile Completion** - Job preferences and career goals
- **Experience Tracking** - Work history and education parsing

### Job Management
- **Save Jobs** - Bookmark interesting positions
- **Application Tracking** - Track applied positions
- **Calendar Integration** - Google Calendar interview reminders
- **Real Apply Links** - Direct application to company websites

### Interview Preparation
- **AI-Generated Prep** - Customized questions based on job and skills
- **YouTube Integration** - Relevant interview preparation videos
- **Technical Topics** - Study guides for specific roles
- **Mock Scenarios** - Practice interview situations

## 🏗️ Architecture

### Backend (`/backend`)
```
├── models/           # MongoDB schemas
│   ├── User.js      # User profile and OAuth tokens
│   ├── Resume.js    # Resume data and AI analysis
│   └── Job.js       # Job listings and AI scores
├── controllers/     # Business logic
│   ├── authController.js    # Authentication & OAuth
│   ├── jobController.js     # Job search & management
│   └── userController.js    # Profile management
├── services/        # External API integrations
│   ├── descopeService.js    # Descope authentication
│   ├── rapidApiService.js   # Job fetching from RapidAPI
│   ├── aiService.js         # Gemini AI integration
│   ├── gcalService.js       # Google Calendar API
│   └── youtubeService.js    # YouTube Data API
└── routes/          # API endpoints
    ├── auth.js      # /api/auth/*
    ├── jobs.js      # /api/jobs/*
    ├── user.js      # /api/user/*
    └── resume.js    # /api/resume/*
```

### Frontend (`/client`)
```
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   │   ├── Navbar.jsx   # Top navigation with search
│   │   │   └── Sidebar.jsx  # Left navigation menu
│   │   └── dashboard/       # Dashboard-specific components
│   │       ├── JobCard.jsx  # Individual job display
│   │       ├── JobList.jsx  # Job grid/list view
│   │       └── FiltersPanel.jsx # Job filtering controls
│   ├── pages/               # Main application pages
│   │   ├── Login.jsx        # Descope authentication
│   │   ├── Dashboard.jsx    # Main job dashboard
│   │   ├── Profile.jsx      # User profile management
│   │   └── InterviewPrep.jsx # Interview preparation
│   ├── store/               # State management (Zustand)
│   │   ├── authStore.js     # Authentication state
│   │   └── jobStore.js      # Job search state
│   └── services/            # API communication
│       ├── authService.js   # Authentication API calls
│       ├── jobService.js    # Job-related API calls
│       └── userService.js   # User profile API calls
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- API Keys (see Environment Variables)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### 3. Environment Variables

#### Backend (`.env`)
```env
# Server
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/real-job-hunter

# Authentication
DESCOPE_PROJECT_ID=your_descope_project_id
DESCOPE_MANAGEMENT_KEY=your_descope_management_key
JWT_SECRET=your_jwt_secret_key

# APIs
RAPIDAPI_KEY=953d8729demshb54ce4d994b2eeep153a0cjsn624b32f7303c
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key

# Google Services
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

#### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_DESCOPE_PROJECT_ID=your_descope_project_id
VITE_DESCOPE_FLOW_URL=your_descope_flow_url
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with Descope token
- `POST /api/auth/connect/google` - Connect Google OAuth
- `POST /api/auth/connect/linkedin` - Connect LinkedIn OAuth
- `GET /api/auth/me` - Get current user profile

### Jobs
- `GET /api/jobs/search` - Search jobs with filters
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/save` - Save job to bookmarks
- `POST /api/jobs/apply` - Record job application
- `GET /api/jobs/saved` - Get saved jobs
- `GET /api/jobs/applied` - Get applied jobs

### Resume
- `POST /api/resume/upload` - Upload and parse resume
- `GET /api/resume/analysis` - Get AI resume analysis
- `PUT /api/resume/preferences` - Update job preferences

### Calendar
- `POST /api/calendar/reminder` - Create interview reminder
- `GET /api/calendar/events` - Get upcoming interviews

## 🤖 AI Integration

### Job Ranking Algorithm
```javascript
// AI prompt for job ranking
const rankingPrompt = `
Rank these jobs based on user profile:
- Skills: ${userSkills.join(', ')}
- Experience: ${experienceLevel}
- Preferences: ${jobPreferences}

Scoring criteria:
- Skill match (40%)
- Experience level (25%) 
- Location preference (20%)
- Company reputation (15%)

Return JSON with scores 0-100 and reasons.
`;
```

### Resume Parsing
```javascript
// AI prompt for resume analysis
const resumePrompt = `
Extract structured data from this resume:
${resumeText}

Return JSON with:
- skills: [array of technical skills]
- experience: {level, years, positions}
- education: [degrees and institutions]
- suggestedJobTitles: [recommended roles]
`;
```

### Interview Preparation
```javascript
// AI prompt for interview prep
const interviewPrompt = `
Generate interview preparation for ${jobTitle}:
- Technical topics to study
- Common interview questions
- Behavioral questions
- Skills to highlight
- 3-week preparation timeline
`;
```

## 🎨 UI Design

### Design System
- **Colors**: Tailwind-inspired palette with blue primary
- **Typography**: System fonts with clear hierarchy
- **Components**: Consistent spacing and border radius
- **Layout**: Responsive grid with sidebar navigation
- **Icons**: Lucide React for consistent iconography

### Key UI Components
- **Job Cards**: Clean cards with AI match scores
- **Filter Panel**: Collapsible advanced search
- **Navigation**: Sidebar with clear sections
- **Search Bar**: Prominent search in navbar
- **User Menu**: Profile and settings dropdown

## 🚀 Deployment

### Backend Deployment
```bash
# Build and deploy to your preferred platform
npm run build
# Deploy to Heroku, Railway, or AWS
```

### Frontend Deployment
```bash
# Build for production
npm run build
# Deploy to Vercel, Netlify, or AWS S3
```

## 📊 Usage Flow

1. **Authentication**
   - User visits app → Redirected to Descope login
   - Login with email/passwordless → JWT token issued
   - Optional: Connect Google & LinkedIn accounts

2. **Profile Setup**
   - Upload resume → AI extracts skills and experience
   - Set job preferences → Location, salary, remote options
   - Profile completion → Career goals and preferences

3. **Job Discovery**
   - AI fetches jobs from RapidAPI based on profile
   - Jobs ranked by relevance using Gemini AI
   - Filter and search → Location, salary, experience
   - Save interesting jobs → Bookmark for later

4. **Application Process**
   - Apply to jobs → Opens company application page
   - Track applications → See applied jobs list
   - Set reminders → Google Calendar integration
   - Interview prep → AI-generated questions and videos

## 🔧 Tech Stack

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Authentication**: Descope + JWT
- **AI**: Google Gemini API
- **Jobs**: RapidAPI (JSearch, Indeed, Adzuna)
- **Calendar**: Google Calendar API
- **Videos**: YouTube Data API

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **State**: Zustand
- **Styling**: CSS (Tailwind-inspired)
- **Icons**: Lucide React
- **Auth**: Descope React SDK

### External Services
- **Descope**: Authentication and OAuth
- **RapidAPI**: Job data aggregation
- **Google Gemini**: AI analysis and ranking
- **Google Calendar**: Interview scheduling
- **YouTube**: Interview preparation videos

## 📈 Future Enhancements

- **Mobile App**: React Native version
- **Advanced Analytics**: Job market insights
- **Salary Negotiation**: AI-powered salary guidance
- **Network Integration**: LinkedIn connection recommendations
- **Company Research**: AI-generated company insights
- **Application Tracking**: Email integration for status updates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Real Job Hunter** - Your AI-powered career companion 🚀