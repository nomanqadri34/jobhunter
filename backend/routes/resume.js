import express from 'express';
import multer from 'multer';
import Resume from '../models/Resume.js';
import { aiService } from '../services/aiService.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload and parse resume
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded' });
    }

    // Parse resume with AI
    const resumeText = 'Sample resume text'; // Placeholder
    const parsedData = await aiService.parseResume(resumeText);

    // Save resume to database
    const resume = new Resume({
      userId: req.user.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      extractedText: resumeText,
      skills: parsedData.skills,
      experience: parsedData.experience,
      education: parsedData.education,
      aiSummary: parsedData.summary,
      suggestedJobTitles: parsedData.suggestedJobTitles
    });

    await resume.save();

    res.json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      resume: parsedData
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to process resume' });
  }
});

export default router;