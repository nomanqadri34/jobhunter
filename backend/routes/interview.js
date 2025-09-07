import express from 'express';
import jwt from 'jsonwebtoken';
import { aiService } from '../services/aiService.js';
import { oauthService } from '../services/oauthService.js';

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

// Generate interview preparation
router.post('/prepare', authMiddleware, async (req, res) => {
    try {
        const { jobTitle, userSkills, experienceLevel } = req.body;

        if (!jobTitle) {
            return res.status(400).json({
                success: false,
                message: 'Job title is required'
            });
        }

        const skills = userSkills || ['JavaScript', 'React', 'Node.js'];
        const level = experienceLevel || 'associate';

        // Generate interview preparation
        const interviewPrep = await aiService.generateInterviewPrep(jobTitle, skills, level);

        // Get YouTube videos for preparation
        const videos = await aiService.getYouTubeVideos(interviewPrep.youtubeQueries || []);

        res.json({
            success: true,
            data: {
                ...interviewPrep,
                videos
            }
        });
    } catch (error) {
        console.error('Interview preparation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate interview preparation'
        });
    }
});

// Create interview reminder in Google Calendar
router.post('/reminder', authMiddleware, async (req, res) => {
    try {
        const { jobTitle, company, interviewDate, googleTokens } = req.body;

        if (!jobTitle || !company || !interviewDate) {
            return res.status(400).json({
                success: false,
                message: 'Job title, company, and interview date are required'
            });
        }

        if (!googleTokens) {
            return res.status(400).json({
                success: false,
                message: 'Google account not connected. Please connect your Google account first.'
            });
        }

        const event = await oauthService.createInterviewReminder(
            googleTokens,
            jobTitle,
            company,
            interviewDate
        );

        res.json({
            success: true,
            message: 'Interview reminder created successfully',
            event
        });
    } catch (error) {
        console.error('Interview reminder error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create interview reminder'
        });
    }
});

// Create job application reminder
router.post('/application-reminder', authMiddleware, async (req, res) => {
    try {
        const { jobTitle, company, applicationDeadline, googleTokens } = req.body;

        if (!jobTitle || !company || !applicationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Job title, company, and application deadline are required'
            });
        }

        if (!googleTokens) {
            return res.status(400).json({
                success: false,
                message: 'Google account not connected. Please connect your Google account first.'
            });
        }

        const event = await oauthService.createApplicationReminder(
            googleTokens,
            jobTitle,
            company,
            applicationDeadline
        );

        res.json({
            success: true,
            message: 'Application reminder created successfully',
            event
        });
    } catch (error) {
        console.error('Application reminder error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create application reminder'
        });
    }
});

export default router;