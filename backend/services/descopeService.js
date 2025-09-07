import DescopeClient from '@descope/node-sdk';
import { google } from 'googleapis';
import axios from 'axios';

// Lazy initialization of Descope client
let descopeClient = null;

const getDescopeClient = () => {
  if (!descopeClient) {
    const projectId = process.env.DESCOPE_PROJECT_ID;
    const managementKey = process.env.DESCOPE_MANAGEMENT_KEY;

    if (!projectId) {
      throw new Error('DESCOPE_PROJECT_ID environment variable is required');
    }

    if (!managementKey) {
      throw new Error('DESCOPE_MANAGEMENT_KEY environment variable is required');
    }

    console.log('Initializing Descope client with project ID:', projectId);

    descopeClient = DescopeClient({
      projectId: projectId,
      managementKey: managementKey
    });
  }

  return descopeClient;
};

export const descopeService = {
  // Verify Descope JWT token
  async verifyToken(token) {
    try {
      console.log('🔍 DescopeService: Validating token...');
      const client = getDescopeClient();
      const authInfo = await client.validateJwt(token);

      console.log('🔍 DescopeService: Auth info:', authInfo);
      console.log('🔍 DescopeService: Auth info type:', typeof authInfo);
      console.log('🔍 DescopeService: Auth info keys:', Object.keys(authInfo || {}));
      console.log('🔍 DescopeService: Claims:', authInfo.claims);
      console.log('🔍 DescopeService: Token:', authInfo.token);
      console.log('🔍 DescopeService: Token type:', typeof authInfo.token);
      console.log('🔍 DescopeService: Token keys:', Object.keys(authInfo.token || {}));

      // Use authInfo.token instead of authInfo.claims (based on the log output)
      const userData = authInfo.token || authInfo.claims || authInfo;
      console.log('🔍 DescopeService: Using userData:', userData);

      return {
        success: true,
        user: userData
      };
    } catch (error) {
      console.error('❌ Descope token verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get user info from Descope
  async getUserInfo(userId) {
    try {
      const client = getDescopeClient();
      const user = await client.management.user.load(userId);
      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('Descope get user error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Update user custom attributes
  async updateUserAttributes(userId, attributes) {
    try {
      const client = getDescopeClient();
      await client.management.user.update(userId, {
        customAttributes: attributes
      });
      return { success: true };
    } catch (error) {
      console.error('Descope update user error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Google OAuth integration with Descope
  async initiateGoogleOAuth(userId) {
    try {
      // Create OAuth URL for Google with Descope flow
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.BACKEND_URL}/api/auth/google/callback`
      );

      const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/drive.readonly'
      ];

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state: userId // Pass user ID in state
      });

      return {
        success: true,
        authUrl
      };
    } catch (error) {
      console.error('Google OAuth initiation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Handle Google OAuth callback
  async handleGoogleCallback(code, userId) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.BACKEND_URL}/api/auth/google/callback`
      );

      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user info from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      // Store Google tokens and info in Descope user attributes
      const attributes = {
        googleConnected: true,
        googleTokens: JSON.stringify(tokens),
        googleProfile: JSON.stringify(userInfo.data)
      };

      await this.updateUserAttributes(userId, attributes);

      return {
        success: true,
        tokens,
        userInfo: userInfo.data
      };
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // LinkedIn OAuth integration with Descope
  async initiateLinkedInOAuth(userId) {
    try {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const redirectUri = encodeURIComponent(`${process.env.BACKEND_URL}/api/auth/linkedin/callback`);
      const scope = encodeURIComponent('r_liteprofile r_emailaddress');
      const state = encodeURIComponent(userId);

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;

      return {
        success: true,
        authUrl
      };
    } catch (error) {
      console.error('LinkedIn OAuth initiation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Handle LinkedIn OAuth callback
  async handleLinkedInCallback(code, userId) {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${process.env.BACKEND_URL}/api/auth/linkedin/callback`,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const accessToken = tokenResponse.data.access_token;

      // Get user profile
      const profileResponse = await axios.get('https://api.linkedin.com/v2/people/~', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // Get user email
      const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const profile = profileResponse.data;
      const email = emailResponse.data.elements[0]['handle~'].emailAddress;

      // Store LinkedIn data in Descope user attributes
      const attributes = {
        linkedinConnected: true,
        linkedinToken: accessToken,
        linkedinProfile: JSON.stringify({ ...profile, email })
      };

      await this.updateUserAttributes(userId, attributes);

      return {
        success: true,
        accessToken,
        profile: { ...profile, email }
      };
    } catch (error) {
      console.error('LinkedIn OAuth callback error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Google Calendar integration
  async createCalendarEvent(userId, eventData) {
    try {
      // Get user's Google tokens from Descope
      const userResult = await this.getUserInfo(userId);
      if (!userResult.success) {
        throw new Error('User not found');
      }

      const googleTokens = userResult.user.customAttributes?.googleTokens;
      if (!googleTokens) {
        throw new Error('Google account not connected');
      }

      const tokens = JSON.parse(googleTokens);

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.BACKEND_URL}/api/auth/google/callback`
      );

      oauth2Client.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime,
          timeZone: eventData.timeZone || 'America/New_York'
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: eventData.timeZone || 'America/New_York'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 } // 30 minutes before
          ]
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      return {
        success: true,
        event: response.data
      };
    } catch (error) {
      console.error('Calendar event creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Create interview reminder
  async createInterviewReminder(userId, jobTitle, company, interviewDate) {
    const eventData = {
      title: `Interview: ${jobTitle} at ${company}`,
      description: `Prepare for your ${jobTitle} interview at ${company}. Review your resume, research the company, and practice common interview questions.`,
      startTime: new Date(interviewDate).toISOString(),
      endTime: new Date(new Date(interviewDate).getTime() + 60 * 60 * 1000).toISOString() // 1 hour duration
    };

    return this.createCalendarEvent(userId, eventData);
  },

  // Create job application reminder
  async createApplicationReminder(userId, jobTitle, company, applicationDeadline) {
    const reminderDate = new Date(applicationDeadline);
    reminderDate.setDate(reminderDate.getDate() - 1); // 1 day before deadline

    const eventData = {
      title: `Apply: ${jobTitle} at ${company}`,
      description: `Reminder to apply for ${jobTitle} position at ${company}. Deadline: ${new Date(applicationDeadline).toLocaleDateString()}`,
      startTime: reminderDate.toISOString(),
      endTime: new Date(reminderDate.getTime() + 30 * 60 * 1000).toISOString() // 30 minutes duration
    };

    return this.createCalendarEvent(userId, eventData);
  },

  // Get user's connected accounts status
  async getConnectionStatus(userId) {
    try {
      const userResult = await this.getUserInfo(userId);
      if (!userResult.success) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const attributes = userResult.user.customAttributes || {};

      return {
        success: true,
        connections: {
          google: !!attributes.googleConnected,
          linkedin: !!attributes.linkedinConnected,
          googleProfile: attributes.googleProfile ? JSON.parse(attributes.googleProfile) : null,
          linkedinProfile: attributes.linkedinProfile ? JSON.parse(attributes.linkedinProfile) : null
        }
      };
    } catch (error) {
      console.error('Get connection status error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Disconnect OAuth account
  async disconnectAccount(userId, provider) {
    try {
      const attributes = {};

      if (provider === 'google') {
        attributes.googleConnected = false;
        attributes.googleTokens = null;
        attributes.googleProfile = null;
      } else if (provider === 'linkedin') {
        attributes.linkedinConnected = false;
        attributes.linkedinToken = null;
        attributes.linkedinProfile = null;
      }

      await this.updateUserAttributes(userId, attributes);

      return { success: true };
    } catch (error) {
      console.error('Disconnect account error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};