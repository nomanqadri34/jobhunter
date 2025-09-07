# Descope OAuth Integration Setup Guide

This guide will help you set up Google Calendar, Google, and LinkedIn OAuth integration using Descope.

## Prerequisites

1. **Descope Account**: Sign up at [descope.com](https://descope.com)
2. **Google Cloud Console**: Access to Google Cloud Console for OAuth setup
3. **LinkedIn Developer**: LinkedIn Developer account for OAuth setup

## Step 1: Descope Configuration

### 1.1 Create Descope Project

1. Log in to your Descope console
2. Create a new project or use an existing one
3. Note your **Project ID** from the project settings

### 1.2 Get Management Key

1. Go to **Settings** → **Company Settings** → **Management Keys**
2. Create a new management key
3. Copy the **Management Key**

### 1.3 Configure Authentication Methods

1. Go to **Authentication Methods**
2. Enable **OAuth** providers:
   - Google
   - LinkedIn

## Step 2: Google OAuth Setup

### 2.1 Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google+ API
   - Google Calendar API
   - Google Drive API

### 2.2 Create OAuth Credentials

1. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
2. Set application type to **Web application**
3. Add authorized redirect URIs:
   ```
   http://localhost:5000/api/auth/google/callback
   https://yourdomain.com/api/auth/google/callback
   ```
4. Copy **Client ID** and **Client Secret**

### 2.3 Configure Scopes

The application requests these Google scopes:

- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/drive.readonly`

## Step 3: LinkedIn OAuth Setup

### 3.1 LinkedIn Developer Portal

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com)
2. Create a new app or use existing one
3. Fill in required information

### 3.2 Configure OAuth Settings

1. In your LinkedIn app, go to **Auth** tab
2. Add authorized redirect URLs:
   ```
   http://localhost:5000/api/auth/linkedin/callback
   https://yourdomain.com/api/auth/linkedin/callback
   ```
3. Request access to these scopes:
   - `r_liteprofile`
   - `r_emailaddress`

### 3.3 Get Credentials

1. Copy **Client ID** and **Client Secret** from the Auth tab

## Step 4: Environment Configuration

### 4.1 Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Database
MONGODB_URI=mongodb://localhost:27017/real-job-hunter

# Authentication - Descope
DESCOPE_PROJECT_ID=your_descope_project_id
DESCOPE_MANAGEMENT_KEY=your_descope_management_key
JWT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# APIs
RAPIDAPI_KEY=your_rapidapi_key
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

### 4.2 Frontend Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_DESCOPE_PROJECT_ID=your_descope_project_id
```

## Step 5: Install Dependencies

### 5.1 Backend Dependencies

```bash
cd backend
npm install @descope/node-sdk googleapis axios
```

### 5.2 Frontend Dependencies

```bash
cd client
npm install @descope/web-js-sdk
```

## Step 6: Descope Frontend Integration

### 6.1 Create Descope Login Component

Create `client/src/components/auth/DescopeLogin.jsx`:

```jsx
import React, { useEffect } from "react";
import Descope from "@descope/web-js-sdk";
import { authService } from "../../services/authService";

export const DescopeLogin = ({ onSuccess }) => {
  useEffect(() => {
    const descope = Descope({
      projectId: import.meta.env.VITE_DESCOPE_PROJECT_ID,
    });

    descope.onSuccess = async (e) => {
      const { sessionToken } = e.detail;

      try {
        const result = await authService.login(sessionToken);
        if (result.success) {
          onSuccess?.(result.user);
        }
      } catch (error) {
        console.error("Login failed:", error);
      }
    };

    descope.onError = (e) => {
      console.error("Descope error:", e.detail);
    };

    return () => {
      // Cleanup if needed
    };
  }, [onSuccess]);

  return (
    <div className="descope-login">
      <descope-wc
        project-id={import.meta.env.VITE_DESCOPE_PROJECT_ID}
        flow-id="sign-up-or-in"
      />
    </div>
  );
};
```

## Step 7: Testing the Integration

### 7.1 Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 7.2 Test OAuth Flows

1. **Login**: Use Descope login component
2. **Google Connection**:
   - Go to Dashboard → Profile
   - Click "Connect Google"
   - Authorize the application
   - Check if calendar events can be created
3. **LinkedIn Connection**:
   - Click "Connect LinkedIn"
   - Authorize the application
   - Verify profile data import

## Step 8: Features Available

### 8.1 Google Integration

- **Calendar Events**: Create interview reminders and application deadlines
- **Profile Data**: Import basic profile information
- **Drive Access**: Read-only access to resume files

### 8.2 LinkedIn Integration

- **Profile Import**: Import professional profile data
- **Network Insights**: Access to connection information
- **Job Recommendations**: Enhanced job matching

### 8.3 API Endpoints

- `POST /api/auth/login` - Login with Descope token
- `GET /api/auth/google/url` - Get Google OAuth URL
- `GET /api/auth/linkedin/url` - Get LinkedIn OAuth URL
- `GET /api/auth/connections` - Get connection status
- `DELETE /api/auth/disconnect/:provider` - Disconnect OAuth account
- `POST /api/auth/calendar/event` - Create calendar event
- `POST /api/auth/calendar/interview-reminder` - Create interview reminder

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**

   - Ensure redirect URIs match exactly in OAuth provider settings
   - Check for trailing slashes and protocol (http vs https)

2. **"Scope not authorized"**

   - Verify all required scopes are enabled in OAuth provider settings
   - For LinkedIn, ensure your app has access to required scopes

3. **"Token verification failed"**

   - Check Descope project ID and management key
   - Ensure JWT_SECRET is set correctly

4. **"Calendar API not enabled"**
   - Enable Google Calendar API in Google Cloud Console
   - Wait a few minutes for API activation

### Debug Mode

Set `NODE_ENV=development` to enable detailed error logging.

## Security Considerations

1. **Token Storage**: OAuth tokens are stored securely in Descope user attributes
2. **Scope Limitation**: Only request necessary OAuth scopes
3. **Token Refresh**: Implement token refresh logic for long-lived sessions
4. **HTTPS**: Use HTTPS in production for OAuth callbacks
5. **Environment Variables**: Never commit sensitive credentials to version control

## Production Deployment

1. Update redirect URIs to production URLs
2. Set `NODE_ENV=production`
3. Use HTTPS for all OAuth callbacks
4. Configure proper CORS settings
5. Set up monitoring for OAuth failures
