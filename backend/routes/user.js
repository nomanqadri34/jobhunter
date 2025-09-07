import express from 'express';
import jwt from 'jsonwebtoken';

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

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    jobPreferences: {
      title: 'Software Developer',
      location: 'Remote',
      remote: true,
      experienceLevel: 'associate'
    }
  };
  res.json({ success: true, user: mockUser });
});

// Update user preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  const { jobPreferences } = req.body;
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    jobPreferences
  };
  res.json({ success: true, user: mockUser });
});

export default router;