import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { jobController } from '../controllers/jobController.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

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

// Job search and management (allow without auth for testing)
router.get('/search', (req, res, next) => {
  // Try auth first, but continue without it if it fails
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      req.user = decoded;
    } catch (error) {
      // Continue without auth
    }
  }
  next();
}, jobController.searchJobs);
router.get('/recommendations', authMiddleware, jobController.getRecommendations);
router.get('/saved', authMiddleware, jobController.getSavedJobs);
router.get('/applied', authMiddleware, jobController.getAppliedJobs);
router.get('/:id', authMiddleware, jobController.getJob);

router.post('/save', authMiddleware, jobController.saveJob);
router.post('/apply', authMiddleware, jobController.applyJob);

// RapidAPI endpoints
router.get('/api/jsearch', jobController.searchJobsJSearch);
router.get('/api/ats-jobs', jobController.getActiveATSJobs);
router.get('/api/internships', jobController.getActiveInternships);
router.get('/api/interview/:interviewId', jobController.getInterviewDetails);
router.get('/api/search-all', jobController.searchAllJobs);
router.get('/api/interview-prep', jobController.getInterviewPrep);

router.post('/api/parse-resume', upload.single('resume'), jobController.parseResume);

// Gemini AI endpoints (no auth required)
router.post('/api/generate-roadmap', jobController.generateRoadmap);
router.post('/api/generate-interview-prep', jobController.generateInterviewPrep);
router.post('/api/generate-skill-gap-analysis', jobController.generateSkillGapAnalysis);

// Google Calendar endpoints
router.post('/api/create-interview-reminder', jobController.createInterviewReminder);
router.post('/api/create-application-reminder', jobController.createApplicationReminder);
router.post('/api/get-upcoming-interviews', jobController.getUpcomingInterviews);

export default router;