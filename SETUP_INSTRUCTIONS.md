# Job Hunter Setup Instructions

## 🚀 Quick Setup Steps

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**

```
🚀 Server running on port 8000
📊 Environment: development
✅ MongoDB connected (if configured)
```

### 2. Start Frontend Server

```bash
cd client
npm run dev
```

**Expected output:**

```
Local:   http://localhost:3000
```

### 3. Test Backend Connection

```bash
node test-backend.js
```

## 🔧 Configuration Check

### Backend (.env file)

Make sure these are set in `backend/.env`:

```env
PORT=8000
DESCOPE_PROJECT_ID=P32CBVFJNBfm2p5qfp6hpj6omNsg
DESCOPE_MANAGEMENT_KEY=UDMyQ0JWRkpOQmZtMnA1cWZwNmhwajZvbU5zZzpLMzJDT1lEckJlWlE1Vm56cTU4T2oyR3J3SG10
JWT_SECRET=4v94iuvr9vvir
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env file)

Make sure these are set in `client/.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_DESCOPE_PROJECT_ID=P32CBVFJNBfm2p5qfp6hpj6omNsg
```

## 🔍 Troubleshooting

### Error: "Network Error" or "Connection Refused"

1. **Check if backend is running on port 8000**

   ```bash
   curl http://localhost:8000/health
   ```

   Should return: `{"status":"OK","timestamp":"..."}`

2. **Check port conflicts**

   ```bash
   # Kill any process on port 8000
   npx kill-port 8000
   # Then restart backend
   cd backend && npm run dev
   ```

3. **Verify environment variables**
   ```bash
   cd backend
   node -e "console.log('PORT:', process.env.PORT)"
   ```

### Error: "Descope token is required"

This means the Descope authentication flow is working, but the token isn't being passed correctly.

1. **Check browser console** for Descope web component errors
2. **Verify Descope project ID** in both backend and frontend .env files
3. **Check network tab** to see if the Descope script is loading

### Error: "Invalid Descope token"

1. **Check Descope project configuration** at [descope.com](https://descope.com)
2. **Verify management key** is correct
3. **Check if user is properly authenticated** in Descope

## 🎯 Authentication Flow

1. **User visits** http://localhost:3000
2. **Redirected to login** page with Descope component
3. **User authenticates** via Descope (Google/LinkedIn/Email)
4. **Descope returns JWT token** to frontend
5. **Frontend sends token** to backend `/api/auth/login`
6. **Backend verifies token** with Descope API
7. **Backend returns** internal JWT + user data
8. **User redirected** to dashboard

## 🔗 OAuth Integration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable Google+ API and Calendar API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:8000/api/auth/google/callback`
6. Add to backend .env:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

### LinkedIn OAuth Setup

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Create new app
3. Add redirect URI: `http://localhost:8000/api/auth/linkedin/callback`
4. Add to backend .env:
   ```env
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   ```

## 📱 Testing the Application

### 1. Login Test

- Go to http://localhost:3000
- Should see Descope login component
- Try signing up/in with Google or LinkedIn
- Should redirect to dashboard on success

### 2. OAuth Connections Test

- In dashboard, go to Profile tab
- Click "Connect Google" or "Connect LinkedIn"
- Should open OAuth popup
- Should show "Connected" status after success

### 3. Job Search Test

- In dashboard, search for "software developer"
- Should load jobs from RapidAPI (if API key configured)
- Should show AI scoring (if Gemini API key configured)

## 🆘 Still Having Issues?

1. **Check all environment variables** are set correctly
2. **Restart both servers** after changing .env files
3. **Clear browser cache** and localStorage
4. **Check browser console** for JavaScript errors
5. **Check backend logs** for server errors

### Common Issues:

- **Port conflicts**: Use `npx kill-port 8000` and `npx kill-port 3000`
- **Environment variables**: Restart servers after changes
- **Descope configuration**: Verify project ID and management key
- **CORS issues**: Make sure FRONTEND_URL is set correctly in backend

## 🎉 Success Indicators

✅ Backend health check returns OK
✅ Frontend loads without console errors  
✅ Descope login component appears
✅ Can authenticate with Google/LinkedIn
✅ Dashboard loads after login
✅ OAuth connections work
✅ Job search returns results

Happy job hunting! 🎯
