import express from 'express';
import jwt from 'jsonwebtoken';
import { authController } from '../controllers/authController.js';

const router = express.Router();

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/google/url', authMiddleware, authController.getGoogleAuthUrl);
router.get('/linkedin/url', authMiddleware, authController.getLinkedInAuthUrl);
router.get('/connections', authMiddleware, authController.getConnectionStatus);
router.delete('/disconnect/:provider', authMiddleware, authController.disconnectAccount);
router.post('/calendar/event', authMiddleware, authController.createCalendarEvent);
router.post('/calendar/interview-reminder', authMiddleware, authController.createInterviewReminder);
router.get('/me', authMiddleware, authController.me);

// OAuth callback routes (public)
router.get('/google/callback', authController.handleGoogleCallback);
router.get('/linkedin/callback', authController.handleLinkedInCallback);

export default router;