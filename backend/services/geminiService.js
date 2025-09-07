import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class GeminiService {
    constructor() {
        // Support both GOOGLE_API_KEY (official var) and GEMINI_API_KEY (legacy)
        this.apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            console.warn('Google Generative AI key not found (set GOOGLE_API_KEY or GEMINI_API_KEY) - using fallback methods');
            this.model = null;
            return;
        }

        try {
            this.genAI = new GoogleGenerativeAI(this.apiKey.trim());
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            console.log('✅ Gemini API initialized successfully');
        } catch (error) {
            console.warn('Failed to initialize Gemini API:', error.message);
            this.model = null;
        }
    }

    async generateCareerRoadmap(jobTitle, currentSkills = [], experienceLevel = 'beginner') {
        if (!this.model) {
            throw new Error('Gemini API not properly configured');
        }

        const prompt = `
Create a comprehensive career roadmap for becoming a ${jobTitle}.

Current Context:
- Experience Level: ${experienceLevel}
- Current Skills: ${currentSkills.join(', ') || 'None specified'}

Please provide a detailed roadmap with the following structure:

1. **Overview**: Brief description of the ${jobTitle} role
2. **Prerequisites**: What someone needs before starting
3. **Learning Path** (organized by phases):
   - Phase 1: Foundation (0-3 months)
   - Phase 2: Intermediate (3-6 months) 
   - Phase 3: Advanced (6-12 months)
   - Phase 4: Specialization (12+ months)

For each phase, include:
- Key skills to learn
- Recommended resources (courses, books, tools)
- Practical projects to build
- Estimated time commitment

4. **Career Progression**: Different levels and salary expectations
5. **Industry Trends**: Current market demands and future outlook
6. **Networking & Community**: Where to connect with professionals
7. **Portfolio Requirements**: What to showcase to employers

Format the response in clear, actionable sections with specific recommendations.
Make it practical and achievable for someone at the ${experienceLevel} level.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            // Downgrade noisy stack traces and stop retrying with a bad key
            console.warn('Gemini unreachable or key invalid. Using local fallback for roadmap.');
            this.model = null;
            throw new Error('Gemini not available');
        }
    }

    async generateInterviewPrep(jobTitle, companyName, jobDescription = '', resumeData = null) {
        if (!this.model) {
            console.log('Using fallback interview prep (Gemini API not available)');
            return this.getFallbackInterviewPrep(jobTitle, companyName, resumeData);
        }

        const prompt = `
Generate comprehensive interview preparation materials for a ${jobTitle} position at ${companyName}.

Job Context:
${jobDescription ? `Job Description: ${jobDescription}` : ''}

${resumeData ? `
Candidate Profile:
- Skills: ${resumeData.skills ? resumeData.skills.join(', ') : 'Not specified'}
- Experience: ${resumeData.experience || 'Not specified'}
- Education: ${resumeData.education || 'Not specified'}
- Summary: ${resumeData.summary || 'Not specified'}
` : ''}

Please provide a JSON response with the following structure:
{
  "companyResearch": {
    "keyFacts": ["fact1", "fact2", "fact3"],
    "recentNews": ["news1", "news2"],
    "culture": "description of company culture",
    "values": ["value1", "value2", "value3"]
  },
  "technicalQuestions": [
    "question1",
    "question2",
    "question3"
  ],
  "behavioralQuestions": [
    "question1",
    "question2",
    "question3"
  ],
  "questionsToAsk": [
    "question1",
    "question2",
    "question3"
  ],
  "technicalTopics": [
    "topic1",
    "topic2",
    "topic3"
  ],
  "skillsToHighlight": [
    "skill1",
    "skill2",
    "skill3"
  ],
  "mockScenarios": [
    "scenario1",
    "scenario2",
    "scenario3"
  ],
  "preparationChecklist": [
    "task1",
    "task2",
    "task3"
  ],
  "redFlags": [
    "flag1",
    "flag2",
    "flag3"
  ],
  "timeline": {
    "week1": "Week 1 preparation tasks",
    "week2": "Week 2 preparation tasks",
    "week3": "Week 3 preparation tasks",
    "final": "Final preparation tasks"
  },
  "starExamples": [
    {
      "situation": "Example situation",
      "task": "What you needed to do",
      "action": "Actions you took",
      "result": "Outcome achieved"
    }
  ]
}

Make sure the response is valid JSON and tailored specifically to the ${jobTitle} role at ${companyName}.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Try to parse as JSON, fallback to structured text if it fails
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch (parseError) {
                console.warn('Gemini returned non-JSON. Falling back to structured text.');
            }

            // If JSON parsing fails, return structured fallback
            return this.parseTextToStructure(text, jobTitle, companyName);
        } catch (error) {
            // Quiet, user-friendly fallback without stack spam
            console.warn('Gemini unreachable or key invalid. Using local fallback for interview prep.');
            // Disable further remote attempts this runtime to avoid repeated errors
            this.model = null;
            return this.getFallbackInterviewPrep(jobTitle, companyName, resumeData);
        }
    }

    async generateSkillGapAnalysis(targetJob, currentSkills, currentExperience) {
        if (!this.model) {
            throw new Error('Gemini API not properly configured');
        }

        const prompt = `
Analyze the skill gap for someone wanting to become a ${targetJob}.

Current Profile:
- Current Skills: ${currentSkills.join(', ') || 'None specified'}
- Experience: ${currentExperience || 'No experience specified'}

Please provide:

1. **Skills Assessment**:
   - Skills you already have that are relevant
   - Skills you're missing for the target role
   - Skills that need improvement

2. **Priority Learning Plan**:
   - High priority skills (must learn first)
   - Medium priority skills (learn next)
   - Nice-to-have skills (learn later)

3. **Learning Resources**:
   - Free resources for each skill
   - Paid courses worth the investment
   - Hands-on practice opportunities

4. **Timeline Estimate**:
   - Realistic timeline to become job-ready
   - Milestones to track progress
   - When to start applying for jobs

5. **Portfolio Projects**:
   - Specific projects to demonstrate skills
   - How to showcase your learning journey

Be specific and actionable. Focus on the most efficient path to becoming employable.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.warn('Gemini unreachable or key invalid. Skill gap analysis not available.');
            this.model = null;
            throw new Error('Gemini not available');
        }
    }

    parseTextToStructure(text, jobTitle, companyName) {
        // Extract sections from text response and structure them
        return {
            companyResearch: {
                keyFacts: [`Research ${companyName}'s mission and values`, `Look up recent company news`, `Understand their products/services`],
                recentNews: [`Check ${companyName}'s latest press releases`, `Review their social media updates`],
                culture: `Research ${companyName}'s work culture and employee reviews`,
                values: ['Innovation', 'Teamwork', 'Excellence']
            },
            technicalQuestions: [
                `What experience do you have with ${jobTitle} responsibilities?`,
                'Describe a challenging technical problem you solved',
                'How do you stay updated with industry trends?',
                'Walk me through your development process',
                'How do you ensure code quality?'
            ],
            behavioralQuestions: [
                'Tell me about yourself',
                'Why do you want to work here?',
                'Describe a time you faced a difficult situation',
                'How do you handle conflicts with team members?',
                'Where do you see yourself in 5 years?'
            ],
            questionsToAsk: [
                'What does a typical day look like in this role?',
                'What are the biggest challenges facing the team?',
                'How do you measure success in this position?',
                'What opportunities are there for growth?'
            ],
            technicalTopics: ['Problem Solving', 'System Design', 'Best Practices', 'Industry Knowledge'],
            skillsToHighlight: ['Leadership', 'Communication', 'Adaptability', 'Technical Expertise'],
            mockScenarios: [
                'Technical problem-solving session',
                'System design discussion',
                'Code review simulation',
                'Project presentation'
            ],
            preparationChecklist: [
                'Research the company thoroughly',
                'Review job description and requirements',
                'Prepare STAR method examples',
                'Practice common questions out loud',
                'Prepare thoughtful questions to ask'
            ],
            redFlags: [
                'Vague job descriptions',
                'High employee turnover',
                'Poor communication during process',
                'Unrealistic expectations'
            ],
            timeline: {
                week1: 'Company research and job description analysis',
                week2: 'Technical skills review and practice questions',
                week3: 'Mock interviews and behavioral preparation',
                final: 'Final review and confidence building'
            },
            starExamples: [
                {
                    situation: 'Describe a specific challenging situation you faced',
                    task: 'Explain what you needed to accomplish',
                    action: 'Detail the specific actions you took',
                    result: 'Share the positive outcome and what you learned'
                }
            ]
        };
    }

    getFallbackInterviewPrep(jobTitle, companyName, resumeData = null) {
        const candidateSkills = resumeData?.skills || ['Communication', 'Problem Solving', 'Teamwork'];

        return {
            companyResearch: {
                keyFacts: [`Research ${companyName}'s mission and values`, `Look up recent company news`, `Understand their products/services`],
                recentNews: [`Check ${companyName}'s latest press releases`, `Review their social media updates`],
                culture: `Research ${companyName}'s work culture and employee reviews on Glassdoor`,
                values: ['Innovation', 'Teamwork', 'Excellence', 'Customer Focus']
            },
            technicalQuestions: [
                `What experience do you have with ${jobTitle} responsibilities?`,
                'Describe a challenging technical problem you solved recently',
                'How do you approach debugging and troubleshooting?',
                'What development methodologies are you familiar with?',
                'How do you ensure code quality in your projects?',
                'Describe your experience with version control systems',
                'How do you stay updated with industry trends?',
                'Walk me through your typical development workflow'
            ],
            behavioralQuestions: [
                'Tell me about yourself and your career journey',
                `Why are you interested in this ${jobTitle} position?`,
                'Describe a time when you had to work under pressure',
                'How do you handle conflicts with team members?',
                'Tell me about a time you had to learn something new quickly',
                'Describe a situation where you had to give constructive feedback',
                'How do you prioritize tasks when you have multiple deadlines?',
                'Tell me about a mistake you made and how you handled it'
            ],
            questionsToAsk: [
                'What does a typical day look like for this role?',
                'What are the biggest challenges facing the team right now?',
                'How do you measure success in this position?',
                'What opportunities are there for professional development?',
                'Can you tell me about the team I\'d be working with?',
                'What\'s the company culture like?',
                'What are the next steps in the interview process?'
            ],
            technicalTopics: candidateSkills.concat(['Problem Solving', 'System Design', 'Best Practices']),
            skillsToHighlight: candidateSkills.concat(['Leadership', 'Communication', 'Adaptability']),
            mockScenarios: [
                'Technical problem-solving session',
                'System design discussion',
                'Code review simulation',
                'Project presentation',
                'Pair programming exercise'
            ],
            preparationChecklist: [
                'Research the company thoroughly',
                'Review the job description and requirements',
                'Prepare specific examples using the STAR method',
                'Practice common interview questions out loud',
                'Prepare thoughtful questions to ask the interviewer',
                'Plan your outfit and route to the interview location',
                'Bring multiple copies of your resume',
                'Prepare a portfolio of your work (if applicable)'
            ],
            redFlags: [
                'Vague job descriptions or responsibilities',
                'High employee turnover rates',
                'Poor communication during the interview process',
                'Unrealistic expectations or timelines',
                'Lack of growth opportunities',
                'Poor work-life balance indicators'
            ],
            timeline: {
                week1: 'Company research and job description analysis',
                week2: 'Technical skills review and practice questions',
                week3: 'Mock interviews and behavioral question preparation',
                final: 'Final review, confidence building, and logistics planning'
            },
            starExamples: [
                {
                    situation: 'Working on a critical project with a tight deadline',
                    task: 'Deliver a high-quality solution within the time constraint',
                    action: 'Organized team meetings, prioritized features, implemented efficient solutions',
                    result: 'Delivered project on time with 95% client satisfaction'
                },
                {
                    situation: 'Disagreement with a team member about technical approach',
                    task: 'Resolve the conflict while maintaining team harmony',
                    action: 'Listened to their concerns, presented data-driven arguments, found compromise',
                    result: 'Improved team collaboration and delivered better solution'
                }
            ]
        };
    }
}

export default new GeminiService();