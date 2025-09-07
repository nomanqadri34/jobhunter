import express from 'express';

const router = express.Router();

// Create calendar reminder
router.post('/reminder', async (req, res) => {
  try {
    const { jobTitle, company, interviewDate, notes } = req.body;
    
    // Placeholder for Google Calendar integration
    res.json({
      success: true,
      message: 'Calendar reminder created successfully',
      event: {
        title: `Interview: ${jobTitle} at ${company}`,
        date: interviewDate,
        notes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create reminder' });
  }
});

export default router;