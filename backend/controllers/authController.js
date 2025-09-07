import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { oauthService } from '../services/oauthService.js';
import { descopeService } from '../services/descopeService.js';

export const authController = {
  // Login with Descope token
  async login(req, res) {
    try {
      const { descopeToken } = req.body;

      console.log('🔍 Backend received login request');
      console.log('🔍 Token type:', typeof descopeToken);
      console.log('🔍 Token length:', descopeToken?.length);
      console.log('🔍 Token preview:', descopeToken?.substring(0, 50) + '...');
      console.log('🔍 Token starts with eyJ:', descopeToken?.startsWith('eyJ'));

      if (!descopeToken) {
        console.log('❌ No token provided');
        return res.status(400).json({
          success: false,
          message: 'Descope token is required'
        });
      }

      if (typeof descopeToken !== 'string') {
        console.log('❌ Token is not a string:', typeof descopeToken);
        return res.status(400).json({
          success: false,
          message: 'Descope token must be a string'
        });
      }

      // Verify Descope token
      console.log('🔍 Verifying token with Descope service...');
      const verificationResult = await descopeService.verifyToken(descopeToken);

      console.log('🔍 Verification result:', verificationResult);
      console.log('🔍 Verification success:', verificationResult.success);
      console.log('🔍 Verification user:', verificationResult.user);

      if (!verificationResult.success) {
        console.log('❌ Token verification failed:', verificationResult.error);
        return res.status(401).json({
          success: false,
          message: 'Invalid Descope token'
        });
      }

      const descopeUser = verificationResult.user;
      console.log('🔍 Descope user:', descopeUser);
      console.log('🔍 Descope user type:', typeof descopeUser);
      console.log('🔍 Descope user keys:', Object.keys(descopeUser || {}));

      if (!descopeUser) {
        console.log('❌ No user data in verification result');
        return res.status(401).json({
          success: false,
          message: 'No user data in token'
        });
      }

      // Extract user ID - try different possible properties
      const userId = descopeUser.sub || descopeUser.userId || descopeUser.id || descopeUser.user_id;
      const email = descopeUser.email || descopeUser.email_address || `user-${userId}@example.com`;
      const name = descopeUser.name || descopeUser.given_name || descopeUser.display_name || email || `User ${userId}`;

      console.log('🔍 Extracted userId:', userId);
      console.log('🔍 Extracted email:', email);
      console.log('🔍 Extracted name:', name);

      if (!userId) {
        console.log('❌ No user ID found in token claims');
        console.log('Available properties:', Object.keys(descopeUser));
        return res.status(401).json({
          success: false,
          message: 'Invalid token: no user ID found'
        });
      }

      // Get connection status
      const connectionStatus = await descopeService.getConnectionStatus(userId);

      const user = {
        _id: userId,
        email: email,
        name: name || email,
        avatar: descopeUser.picture || descopeUser.avatar,
        googleConnected: connectionStatus.success ? connectionStatus.connections.google : false,
        linkedinConnected: connectionStatus.success ? connectionStatus.connections.linkedin : false,
        googleProfile: connectionStatus.success ? connectionStatus.connections.googleProfile : null,
        linkedinProfile: connectionStatus.success ? connectionStatus.connections.linkedinProfile : null
      };

      // Generate JWT for internal use
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      console.log('✅ User created successfully:', user);
      console.log('✅ JWT token generated');

      res.json({
        success: true,
        token,
        user
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ success: false, message: 'Authentication failed' });
    }
  },

  // Get Google OAuth URL
  async getGoogleAuthUrl(req, res) {
    try {
      const result = await descopeService.initiateGoogleOAuth(req.user.userId);

      if (result.success) {
        res.json({ success: true, authUrl: result.authUrl });
      } else {
        res.status(500).json({ success: false, message: result.error });
      }
    } catch (error) {
      console.error('Google auth URL error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate Google auth URL' });
    }
  },

  // Handle Google OAuth callback
  async handleGoogleCallback(req, res) {
    try {
      const { code, state } = req.query;
      const userId = state; // User ID passed in state parameter

      const result = await descopeService.handleGoogleCallback(code, userId);

      if (result.success) {
        // Redirect to frontend with success
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?google=connected`);
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?google=error`);
      }
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?google=error`);
    }
  },

  // Get LinkedIn OAuth URL
  async getLinkedInAuthUrl(req, res) {
    try {
      const result = await descopeService.initiateLinkedInOAuth(req.user.userId);

      if (result.success) {
        res.json({ success: true, authUrl: result.authUrl });
      } else {
        res.status(500).json({ success: false, message: result.error });
      }
    } catch (error) {
      console.error('LinkedIn auth URL error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate LinkedIn auth URL' });
    }
  },

  // Handle LinkedIn OAuth callback
  async handleLinkedInCallback(req, res) {
    try {
      const { code, state } = req.query;
      const userId = decodeURIComponent(state); // User ID passed in state parameter

      const result = await descopeService.handleLinkedInCallback(code, userId);

      if (result.success) {
        // Redirect to frontend with success
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?linkedin=connected`);
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?linkedin=error`);
      }
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?linkedin=error`);
    }
  },

  // Get connection status
  async getConnectionStatus(req, res) {
    try {
      const result = await descopeService.getConnectionStatus(req.user.userId);

      if (result.success) {
        res.json({ success: true, connections: result.connections });
      } else {
        res.status(500).json({ success: false, message: result.error });
      }
    } catch (error) {
      console.error('Get connection status error:', error);
      res.status(500).json({ success: false, message: 'Failed to get connection status' });
    }
  },

  // Disconnect OAuth account
  async disconnectAccount(req, res) {
    try {
      const { provider } = req.params;
      const result = await descopeService.disconnectAccount(req.user.userId, provider);

      if (result.success) {
        res.json({ success: true, message: `${provider} account disconnected successfully` });
      } else {
        res.status(500).json({ success: false, message: result.error });
      }
    } catch (error) {
      console.error('Disconnect account error:', error);
      res.status(500).json({ success: false, message: 'Failed to disconnect account' });
    }
  },

  // Create calendar event
  async createCalendarEvent(req, res) {
    try {
      const { eventData } = req.body;
      const result = await descopeService.createCalendarEvent(req.user.userId, eventData);

      if (result.success) {
        res.json({ success: true, event: result.event });
      } else {
        res.status(400).json({ success: false, message: result.error });
      }
    } catch (error) {
      console.error('Create calendar event error:', error);
      res.status(500).json({ success: false, message: 'Failed to create calendar event' });
    }
  },

  // Create interview reminder
  async createInterviewReminder(req, res) {
    try {
      const { jobTitle, company, interviewDate } = req.body;
      const result = await descopeService.createInterviewReminder(
        req.user.userId,
        jobTitle,
        company,
        interviewDate
      );

      if (result.success) {
        res.json({ success: true, event: result.event });
      } else {
        res.status(400).json({ success: false, message: result.error });
      }
    } catch (error) {
      console.error('Create interview reminder error:', error);
      res.status(500).json({ success: false, message: 'Failed to create interview reminder' });
    }
  },

  // Get current user
  async me(req, res) {
    try {
      const userResult = await descopeService.getUserInfo(req.user.userId);
      const connectionStatus = await descopeService.getConnectionStatus(req.user.userId);

      if (userResult.success) {
        const user = {
          _id: userResult.user.userId,
          email: userResult.user.email,
          name: userResult.user.name || userResult.user.email,
          avatar: userResult.user.picture,
          googleConnected: connectionStatus.success ? connectionStatus.connections.google : false,
          linkedinConnected: connectionStatus.success ? connectionStatus.connections.linkedin : false,
          googleProfile: connectionStatus.success ? connectionStatus.connections.googleProfile : null,
          linkedinProfile: connectionStatus.success ? connectionStatus.connections.linkedinProfile : null
        };

        res.json({ success: true, user });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ success: false, message: 'Failed to get user info' });
    }
  }
};