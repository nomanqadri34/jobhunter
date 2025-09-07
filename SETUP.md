# 🚀 Quick Setup Guide

This guide will get your Real Job Hunter platform running in 5 minutes.

## ⚡ Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies at once
npm install
cd client && npm install
cd ../backend && npm install
cd ..
```

### 2. Environment Setup

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp client/.env.example client/.env

# Edit backend environment variables
nano backend/.env
```

### 3. Required API Keys (Minimum Setup)

Add these to `backend/.env`:

```env
# Required for basic functionality
RAPIDAPI_KEY=your_rapidapi_key_here
GEMINI_API_KEY=your_gemini_api_key_here
DESCOPE_PROJECT_ID=your_descope_project_id

# Database (use MongoDB Atlas for quick setup)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/real-job-hunter

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
# npm run client  (React app on port 3000)
# npm run server  (Express API on port 8000)
```

### 5. Open Your Browser

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 🔑 Getting API Keys

### RapidAPI (Required - 5 minutes)

1. Go to [RapidAPI](https://rapidapi.com/)
2. Sign up for free account
3. Subscribe to [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) (free tier available)
4. Copy your API key from the dashboard

### Google Gemini AI (Required - 2 minutes)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key

### Descope (Required - 3 minutes)

1. Sign up at [Descope](https://www.descope.com/)
2. Create a new project
3. Copy the Project ID from dashboard
4. Enable email/passwordless authentication

### MongoDB Atlas (Optional - 5 minutes)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Replace `MONGODB_URI` in `.env`

## 🎯 Core Features Working

After setup, you'll have:

✅ **User Authentication** - Descope passwordless login
✅ **Job Search** - Real jobs from RapidAPI
✅ **AI Job Ranking** - Gemini AI scores job relevance
✅ **Resume Upload** - PDF parsing and skill extraction
✅ **Job Preferences** - Comprehensive preference form
✅ **Job Management** - Save and track applications

## 🔧 Optional Enhancements

Add these API keys for enhanced features:

### Google OAuth (Calendar Integration)

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### LinkedIn OAuth (Profile Import)

```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### YouTube API (Interview Videos)

```env
YOUTUBE_API_KEY=your_youtube_api_key
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**

```bash
# Kill processes on ports 3000 and 8000
npx kill-port 3000 8000
```

**MongoDB connection error:**

- Check if MongoDB is running locally
- Or use MongoDB Atlas cloud database
- Verify connection string format

**API key errors:**

- Ensure no extra spaces in `.env` file
- Check API key permissions and quotas
- Verify API endpoints are accessible

**Build errors:**

```bash
# Clear node modules and reinstall
rm -rf node_modules client/node_modules backend/node_modules
npm install
cd client && npm install
cd ../backend && npm install
```

## 📱 Testing the Platform

### 1. Authentication Flow

1. Visit http://localhost:3000
2. Click "Sign Up" or "Sign In"
3. Use email authentication
4. Should redirect to dashboard

### 2. Job Search

1. Use search bar: "software developer"
2. Apply filters (location, salary, etc.)
3. Jobs should load from RapidAPI
4. AI scores should appear on job cards

### 3. Resume Upload

1. Go to "Resume" tab
2. Upload a PDF resume
3. AI should extract skills and experience
4. Check console for parsed data

### 4. Job Preferences

1. Go to "Settings" tab
2. Fill out comprehensive form
3. Save preferences
4. Should improve job recommendations

### 5. Interview Preparation

1. Go to "Interview" tab
2. Enter job title (e.g., "Software Engineer")
3. AI should generate questions and topics
4. YouTube videos should load (if API key provided)

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)

```bash
cd client
npm run build
# Deploy the 'dist' folder
```

### Backend (Railway/Heroku)

```bash
cd backend
# Set environment variables in hosting platform
# Deploy backend folder
```

### Environment Variables for Production

- Update API URLs to production endpoints
- Use production database (MongoDB Atlas)
- Set `NODE_ENV=production`
- Use secure JWT secrets

## 📞 Support

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure API keys have proper permissions
4. Check network connectivity to external APIs

**Happy Job Hunting! 🎯**
