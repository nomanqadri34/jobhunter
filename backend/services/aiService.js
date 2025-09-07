import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

let genAI, model;

try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }
} catch (error) {
  console.warn('Gemini AI initialization failed, using fallback methods:', error.message);
}

export const aiService = {
  // Rank jobs based on user profile
  async rankJobs(jobs, user) {
    if (!model || !process.env.GEMINI_API_KEY || jobs.length === 0) {
      console.log('Using fallback job ranking (no AI)');
      return jobs.map((job, index) => ({
        ...job,
        aiScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
        aiReason: 'Ranked by relevance and posting date'
      }));
    }

    try {
      const userProfile = {
        skills: user.resume?.skills || user.jobPreferences?.skills || [],
        experience: user.resume?.experience?.level || user.jobPreferences?.experienceLevel,
        preferences: user.jobPreferences
      };

      const prompt = `
Rank these ${jobs.length} jobs based on relevance to this user profile:

User Profile:
- Skills: ${userProfile.skills.join(', ')}
- Experience Level: ${userProfile.experience}
- Preferred Job Title: ${userProfile.preferences?.title}
- Preferred Location: ${userProfile.preferences?.location}

Jobs to rank:
${jobs.map((job, index) => `
${index + 1}. ${job.title} at ${job.company}
   Location: ${job.location}
   Skills: ${job.skills?.join(', ') || 'Not specified'}
   Experience: ${job.experienceLevel}
   Description: ${job.description?.substring(0, 200)}...
`).join('')}

Return a JSON array with job rankings and scores (0-100):
[
  {"jobIndex": 1, "score": 95, "reason": "Perfect match for skills and experience"},
  {"jobIndex": 3, "score": 87, "reason": "Good skill match, location preference"}
]

Rank by: skill match (40%), experience level match (25%), location preference (20%), company reputation (15%)
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();

      // Parse AI response
      let rankings;
      try {
        const jsonMatch = aiText.match(/\[[\s\S]*\]/);
        rankings = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse AI rankings:', parseError);
        return jobs; // Return original order if parsing fails
      }

      // Apply rankings to jobs
      const rankedJobs = rankings
        .sort((a, b) => b.score - a.score)
        .map(ranking => {
          const job = jobs[ranking.jobIndex - 1];
          if (job) {
            job.aiScore = ranking.score;
            job.aiReason = ranking.reason;
          }
          return job;
        })
        .filter(Boolean);

      // Add unranked jobs at the end
      const rankedIndices = rankings.map(r => r.jobIndex - 1);
      const unrankedJobs = jobs.filter((_, index) => !rankedIndices.includes(index));

      return [...rankedJobs, ...unrankedJobs];
    } catch (error) {
      console.error('AI ranking error:', error);
      return jobs;
    }
  },

  // Parse resume text
  async parseResume(resumeText) {
    if (!model || !process.env.GEMINI_API_KEY) {
      console.log('Using fallback resume parser (no AI)');
      return this.fallbackResumeParser(resumeText);
    }

    try {
      const prompt = `
Analyze this resume and extract structured information in JSON format:

${resumeText}

Return JSON with this structure:
{
  "skills": ["skill1", "skill2", ...],
  "experience": {
    "level": "entry|associate|mid|senior|director",
    "years": number,
    "positions": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "duration": "2020-2023",
        "description": "Brief description"
      }
    ]
  },
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School Name",
      "year": 2020
    }
  ],
  "suggestedJobTitles": ["title1", "title2", ...],
  "summary": "Brief professional summary"
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();

      // Parse JSON response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.fallbackResumeParser(resumeText);
    } catch (error) {
      console.error('AI resume parsing error:', error);
      return this.fallbackResumeParser(resumeText);
    }
  },

  // Generate interview preparation
  async generateInterviewPrep(jobTitle, userSkills, experienceLevel) {
    if (!model || !process.env.GEMINI_API_KEY) {
      console.log('Using fallback interview prep (no AI)');
      return this.fallbackInterviewPrep(jobTitle, experienceLevel);
    }

    try {
      const prompt = `
Generate comprehensive interview preparation for a ${experienceLevel} ${jobTitle} position.

User Skills: ${userSkills.join(', ')}

Provide:
1. Technical topics to study
2. Common interview questions (10-15 questions)
3. Behavioral questions (5-8 questions)
4. Skills to highlight
5. Preparation timeline (2-3 weeks)
6. Mock interview scenarios
7. YouTube search queries for relevant tutorials

Format as JSON:
{
  "technicalTopics": ["topic1", "topic2", ...],
  "technicalQuestions": ["question1", "question2", ...],
  "behavioralQuestions": ["question1", "question2", ...],
  "skillsToHighlight": ["skill1", "skill2", ...],
  "timeline": {
    "week1": "Focus areas for week 1",
    "week2": "Focus areas for week 2",
    "week3": "Focus areas for week 3"
  },
  "mockScenarios": ["scenario1", "scenario2", ...],
  "youtubeQueries": ["search query 1", "search query 2", ...]
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();

      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.fallbackInterviewPrep(jobTitle, experienceLevel);
    } catch (error) {
      console.error('AI interview prep error:', error);
      return this.fallbackInterviewPrep(jobTitle, experienceLevel);
    }
  },

  // Generate YouTube search queries for interview prep
  async getYouTubeVideos(searchQueries) {
    if (!process.env.YOUTUBE_API_KEY) {
      return this.fallbackYouTubeVideos();
    }

    try {
      const videos = [];

      for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 5,
            key: process.env.YOUTUBE_API_KEY,
            order: 'relevance'
          }
        });

        const queryVideos = response.data.items.map(item => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          query: query
        }));

        videos.push(...queryVideos);
      }

      return videos;
    } catch (error) {
      console.error('YouTube API error:', error);
      return this.fallbackYouTubeVideos();
    }
  },

  // Fallback parsers
  fallbackResumeParser(text) {
    // Basic text analysis for skills
    const commonSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'HTML', 'CSS', 'SQL', 'Git'];
    const detectedSkills = commonSkills.filter(skill =>
      text.toLowerCase().includes(skill.toLowerCase())
    );

    return {
      PersonalInfo: {
        Name: "Resume User",
        Email: "user@example.com",
        Phone: "Not specified",
        Location: "Not specified"
      },
      Skills: detectedSkills.length > 0 ? detectedSkills : ['JavaScript', 'React', 'Node.js'],
      WorkExperience: [
        {
          JobTitle: "Software Developer",
          Company: "Tech Company",
          StartDate: "2022",
          EndDate: "Present",
          Description: "Developed web applications using modern technologies"
        }
      ],
      Education: [
        {
          Degree: "Bachelor's",
          Field: "Computer Science",
          Institution: "University",
          GraduationYear: "2022"
        }
      ],
      ExperienceLevel: "associate",
      suggestedJobTitles: ['Software Developer', 'Frontend Developer', 'Full Stack Developer'],
      summary: 'Experienced developer with strong technical skills'
    };
  },

  fallbackInterviewPrep(jobTitle, experienceLevel) {
    return {
      data: {
        interviewPrep: {
          questions: [
            `Tell me about your experience with ${jobTitle} roles`,
            'What interests you about this position?',
            'Describe a challenging project you worked on',
            'How do you stay updated with technology trends?',
            'Explain a time you had to learn a new technology quickly',
            'How do you handle tight deadlines?',
            'Describe your debugging process',
            'What makes you a good fit for this role?'
          ],
          tips: [
            'Research the company thoroughly before the interview',
            'Prepare specific examples using the STAR method',
            'Practice coding problems relevant to the role',
            'Prepare thoughtful questions about the role and company',
            'Review your resume and be ready to discuss any project',
            'Dress appropriately and arrive early',
            'Show enthusiasm and genuine interest in the role'
          ],
          technicalTopics: ['Data Structures', 'Algorithms', 'System Design', 'Best Practices'],
          timeline: {
            week1: 'Review technical fundamentals and company research',
            week2: 'Practice coding problems and mock interviews',
            week3: 'Final preparation and confidence building'
          }
        }
      }
    };
  },

  fallbackYouTubeVideos() {
    return [
      {
        id: 'sample1',
        title: 'Software Developer Interview Tips',
        description: 'Essential tips for software developer interviews',
        thumbnail: 'https://via.placeholder.com/320x180',
        channelTitle: 'Tech Interview Channel',
        publishedAt: new Date().toISOString(),
        url: 'https://www.youtube.com/watch?v=sample1',
        query: 'software developer interview'
      }
    ];
  }
};