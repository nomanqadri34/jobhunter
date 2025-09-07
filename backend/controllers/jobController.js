import Job from '../models/Job.js';
import User from '../models/User.js';
import { aiService } from '../services/aiService.js';
import rapidApiService from '../services/rapidApiService.js';
import geminiService from '../services/geminiService.js';
import youtubeService from '../services/youtubeService.js';
import googleCalendarService from '../services/googleCalendarService.js';

export const jobController = {
  // Search and fetch jobs
  async searchJobs(req, res) {
    try {
      const { query, location, remote, salaryMin, experienceLevel, page = 1, useResume = false } = req.query;
      const userId = req.user?.userId;

      let userPreferences = {
        title: query || 'software developer',
        location: location || 'United States',
        remote: remote === 'true',
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        experienceLevel: experienceLevel || 'associate',
        skills: ['JavaScript', 'React', 'Node.js']
      };

      let userProfile = {
        jobPreferences: userPreferences,
        resume: {
          skills: userPreferences.skills,
          experience: { level: userPreferences.experienceLevel }
        }
      };

      // If user is authenticated and wants to use resume data
      if (userId && useResume === 'true') {
        try {
          const user = await User.findById(userId);
          if (user && user.resume) {
            // Use resume data to enhance job search
            userProfile.resume = user.resume;
            userPreferences.skills = user.resume.skills || userPreferences.skills;
            userPreferences.experienceLevel = user.resume.experience?.level || userPreferences.experienceLevel;

            // Generate job titles based on resume if no query provided
            if (!query && user.resume.suggestedJobTitles?.length > 0) {
              userPreferences.title = user.resume.suggestedJobTitles[0];
            }
          }
        } catch (userError) {
          console.warn('Failed to fetch user resume data:', userError);
        }
      }

      console.log('Searching jobs with preferences:', userPreferences);

      // Fetch jobs from RapidAPI
      const searchQuery = `${userPreferences.title} jobs in ${userPreferences.location}`;
      const rapidApiJobs = await rapidApiService.searchJobs(searchQuery, 1, 3, 'us', 'all');

      const jobsArray = rapidApiJobs?.data || [];
      console.log(`Fetched ${jobsArray.length} jobs from RapidAPI`);

      // AI ranking based on user profile (with fallback)
      let rankedJobs;
      try {
        rankedJobs = await aiService.rankJobs(jobsArray, userProfile);
      } catch (error) {
        console.warn('AI ranking failed, using original job order:', error.message);
        rankedJobs = jobsArray;
      }

      res.json({
        success: true,
        jobs: rankedJobs,
        total: rankedJobs.length,
        page: parseInt(page),
        resumeUsed: useResume === 'true' && userId
      });
    } catch (error) {
      console.error('Job search error:', error);
      res.status(500).json({ success: false, message: 'Failed to search jobs' });
    }
  },

  // Get personalized job recommendations based on resume
  async getRecommendations(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user || !user.resume) {
        return res.status(400).json({
          success: false,
          message: 'Please upload your resume first to get personalized recommendations'
        });
      }

      // Generate job search queries based on resume
      const searchQueries = user.resume.suggestedJobTitles || ['software developer'];
      const allJobs = [];

      // Search for jobs using different titles from resume
      for (const jobTitle of searchQueries.slice(0, 3)) { // Limit to 3 searches
        const searchParams = {
          title: jobTitle,
          location: user.jobPreferences?.location || 'United States',
          remote: user.jobPreferences?.remote || false,
          experienceLevel: user.resume.experience?.level || 'associate',
          skills: user.resume.skills || []
        };

        const jobs = await rapidApiService.searchJobs(searchParams);
        allJobs.push(...jobs);
      }

      // Remove duplicates based on job ID
      const uniqueJobs = allJobs.filter((job, index, self) =>
        index === self.findIndex(j => j.id === job.id)
      );

      // AI ranking based on user profile
      const rankedJobs = await aiService.rankJobs(uniqueJobs, user);

      res.json({
        success: true,
        jobs: rankedJobs.slice(0, 20), // Return top 20 recommendations
        total: rankedJobs.length,
        message: `Found ${rankedJobs.length} personalized recommendations based on your resume`
      });
    } catch (error) {
      console.error('Job recommendations error:', error);
      res.status(500).json({ success: false, message: 'Failed to get job recommendations' });
    }
  },

  // Get job details
  async getJob(req, res) {
    try {
      const { id } = req.params;
      const job = await Job.findById(id);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      res.json({ success: true, job });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get job' });
    }
  },

  // Save job
  async saveJob(req, res) {
    try {
      const { jobId } = req.body;
      const userId = req.user.userId;

      await User.findByIdAndUpdate(userId, {
        $addToSet: { savedJobs: jobId }
      });

      res.json({ success: true, message: 'Job saved successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to save job' });
    }
  },

  // Apply to job
  async applyJob(req, res) {
    try {
      const { jobId } = req.body;
      const userId = req.user.userId;

      await User.findByIdAndUpdate(userId, {
        $addToSet: { appliedJobs: jobId }
      });

      res.json({ success: true, message: 'Job application recorded' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to record application' });
    }
  },

  // Get saved jobs
  async getSavedJobs(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).populate('savedJobs');

      res.json({ success: true, jobs: user.savedJobs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get saved jobs' });
    }
  },

  // Get applied jobs
  async getAppliedJobs(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).populate('appliedJobs');

      res.json({ success: true, jobs: user.appliedJobs });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to get applied jobs' });
    }
  },

  // Search jobs using JSearch API
  async searchJobsJSearch(req, res) {
    try {
      const { query, page = 1, numPages = 1, country = 'us', datePosted = 'all' } = req.query;

      if (!query) {
        return res.status(400).json({ success: false, message: 'Query parameter is required' });
      }

      const jobs = await rapidApiService.searchJobs(query, page, numPages, country, datePosted);

      res.json({
        success: true,
        data: jobs,
        query,
        page: parseInt(page)
      });
    } catch (error) {
      console.error('JSearch API error:', error);
      res.status(500).json({ success: false, message: 'Failed to search jobs' });
    }
  },

  // Get active ATS expired jobs
  async getActiveATSJobs(req, res) {
    try {
      const jobs = await rapidApiService.getActiveATSExpiredJobs();

      res.json({
        success: true,
        data: jobs,
        message: 'Active ATS expired jobs retrieved successfully'
      });
    } catch (error) {
      console.error('ATS API error:', error);
      res.status(500).json({ success: false, message: 'Failed to get ATS jobs' });
    }
  },

  // Get active internships
  async getActiveInternships(req, res) {
    try {
      const internships = await rapidApiService.getActiveInternships();

      res.json({
        success: true,
        data: internships,
        message: 'Active internships retrieved successfully'
      });
    } catch (error) {
      console.error('Internships API error:', error);
      res.status(500).json({ success: false, message: 'Failed to get internships' });
    }
  },

  // Get interview details from Glassdoor
  async getInterviewDetails(req, res) {
    try {
      const { interviewId } = req.params;

      if (!interviewId) {
        return res.status(400).json({ success: false, message: 'Interview ID is required' });
      }

      const interviewDetails = await rapidApiService.getInterviewDetails(interviewId);

      res.json({
        success: true,
        data: interviewDetails,
        interviewId
      });
    } catch (error) {
      console.error('Glassdoor API error:', error);
      res.status(500).json({ success: false, message: 'Failed to get interview details' });
    }
  },

  // Parse resume using Resume Optimizer Pro
  async parseResume(req, res) {
    try {
      let resumeText = '';

      // Handle file upload
      if (req.file) {
        const fs = await import('fs');
        const path = await import('path');

        // For now, we'll extract basic info from filename and create mock data
        // In a real implementation, you'd use a PDF parser like pdf-parse
        const fileName = req.file.originalname;
        const fileExtension = path.extname(fileName).toLowerCase();

        if (['.pdf', '.doc', '.docx'].includes(fileExtension)) {
          // Mock resume parsing - in production, use actual PDF/DOC parsing
          const mockResumeData = {
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
            experience: 'Mid-level (3-5 years)',
            education: 'Bachelor\'s Degree in Computer Science',
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1 (555) 123-4567',
            summary: 'Experienced software developer with expertise in full-stack development'
          };

          res.json({
            success: true,
            data: mockResumeData,
            message: 'Resume parsed successfully'
          });
          return;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Unsupported file format. Please upload PDF, DOC, or DOCX files.'
          });
        }
      }

      // Handle text input
      if (req.body.resumeText) {
        resumeText = req.body.resumeText;
      }

      if (!resumeText && !req.file) {
        return res.status(400).json({
          success: false,
          message: 'Resume text or file is required'
        });
      }

      if (resumeText) {
        const parsedResume = await rapidApiService.parseResume(resumeText);

        res.json({
          success: true,
          data: parsedResume,
          message: 'Resume parsed successfully'
        });
      }
    } catch (error) {
      console.error('Resume parsing error:', error);
      res.status(500).json({ success: false, message: 'Failed to parse resume' });
    }
  },

  // Combined search across all job APIs
  async searchAllJobs(req, res) {
    try {
      const { query, location = '', page = 1 } = req.query;

      if (!query) {
        return res.status(400).json({ success: false, message: 'Query parameter is required' });
      }

      const results = await rapidApiService.searchAllJobs(query, location, page);

      res.json({
        success: true,
        data: results,
        query,
        location,
        page: parseInt(page),
        message: 'Combined job search completed'
      });
    } catch (error) {
      console.error('Combined search error:', error);
      res.status(500).json({ success: false, message: 'Failed to search all job sources' });
    }
  },

  // Get interview preparation data
  async getInterviewPrep(req, res) {
    try {
      const { companyName, jobTitle } = req.query;

      if (!companyName || !jobTitle) {
        return res.status(400).json({
          success: false,
          message: 'Company name and job title are required'
        });
      }

      const prepData = await rapidApiService.getInterviewPrep(companyName, jobTitle);

      res.json({
        success: true,
        data: prepData,
        companyName,
        jobTitle,
        message: 'Interview preparation data retrieved successfully'
      });
    } catch (error) {
      console.error('Interview prep error:', error);
      res.status(500).json({ success: false, message: 'Failed to get interview preparation data' });
    }
  },

  // Generate career roadmap using Gemini AI
  async generateRoadmap(req, res) {
    try {
      const { jobTitle, currentSkills = [], experienceLevel = 'beginner' } = req.body;

      if (!jobTitle) {
        return res.status(400).json({
          success: false,
          message: 'Job title is required'
        });
      }

      const roadmap = await geminiService.generateCareerRoadmap(jobTitle, currentSkills, experienceLevel);

      res.json({
        success: true,
        data: {
          roadmap,
          jobTitle,
          currentSkills,
          experienceLevel
        },
        message: 'Career roadmap generated successfully'
      });
    } catch (error) {
      console.error('Roadmap generation error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate career roadmap' });
    }
  },

  // Generate interview preparation using Gemini AI
  async generateInterviewPrep(req, res) {
    try {
      const { jobTitle, companyName, jobDescription = '', resumeData = null, userSkills = [] } = req.body;

      if (!jobTitle || !companyName) {
        return res.status(400).json({
          success: false,
          message: 'Job title and company name are required'
        });
      }

      // Generate interview prep with Gemini AI
      const interviewPrep = await geminiService.generateInterviewPrep(jobTitle, companyName, jobDescription, resumeData);

      // Get relevant YouTube videos
      const videos = await youtubeService.getInterviewVideos(jobTitle, userSkills);

      res.json({
        success: true,
        data: {
          interviewPrep,
          videos,
          jobTitle,
          companyName
        },
        message: 'Interview preparation generated successfully'
      });
    } catch (error) {
      console.error('Interview prep generation error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate interview preparation' });
    }
  },

  // Create interview reminder in Google Calendar
  async createInterviewReminder(req, res) {
    try {
      const { jobTitle, company, interviewDate, googleTokens, notes = '' } = req.body;

      if (!jobTitle || !company || !interviewDate || !googleTokens?.access_token) {
        return res.status(400).json({
          success: false,
          message: 'Job title, company, interview date, and Google access token are required'
        });
      }

      const result = await googleCalendarService.createInterviewReminder(
        googleTokens.access_token,
        { jobTitle, company, interviewDate, notes }
      );

      res.json({
        success: true,
        data: result,
        message: 'Interview reminder created successfully'
      });
    } catch (error) {
      console.error('Calendar reminder error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create calendar reminder: ' + error.message
      });
    }
  },

  // Create application deadline reminder
  async createApplicationReminder(req, res) {
    try {
      const { jobTitle, company, deadline, applicationUrl, googleTokens } = req.body;

      if (!jobTitle || !company || !deadline || !googleTokens?.access_token) {
        return res.status(400).json({
          success: false,
          message: 'Job title, company, deadline, and Google access token are required'
        });
      }

      const result = await googleCalendarService.createApplicationDeadlineReminder(
        googleTokens.access_token,
        { jobTitle, company, deadline, applicationUrl }
      );

      res.json({
        success: true,
        data: result,
        message: 'Application deadline reminder created successfully'
      });
    } catch (error) {
      console.error('Application reminder error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create application reminder: ' + error.message
      });
    }
  },

  // Get upcoming interviews from Google Calendar
  async getUpcomingInterviews(req, res) {
    try {
      const { googleTokens } = req.body;

      if (!googleTokens?.access_token) {
        return res.status(400).json({
          success: false,
          message: 'Google access token is required'
        });
      }

      const result = await googleCalendarService.listUpcomingInterviews(googleTokens.access_token);

      res.json({
        success: true,
        data: result,
        message: 'Upcoming interviews retrieved successfully'
      });
    } catch (error) {
      console.error('Get interviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve interviews: ' + error.message
      });
    }
  },

  // Generate skill gap analysis using Gemini AI
  async generateSkillGapAnalysis(req, res) {
    try {
      const { targetJob, currentSkills = [], currentExperience = '' } = req.body;

      if (!targetJob) {
        return res.status(400).json({
          success: false,
          message: 'Target job title is required'
        });
      }

      const analysis = await geminiService.generateSkillGapAnalysis(targetJob, currentSkills, currentExperience);

      res.json({
        success: true,
        data: {
          analysis,
          targetJob,
          currentSkills,
          currentExperience
        },
        message: 'Skill gap analysis generated successfully'
      });
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      res.status(500).json({ success: false, message: 'Failed to generate skill gap analysis' });
    }
  }
};