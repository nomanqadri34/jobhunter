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
            return this.getFallbackInterviewPrep(jobTitle, companyName, resumeData);
        }

        // Extract dynamic data from resume and job description
        const candidateSkills = resumeData?.Skills || resumeData?.skills || [];
        const workExperience = resumeData?.WorkExperience || [];
        const education = resumeData?.Education || [];
        const experienceLevel = resumeData?.ExperienceLevel || resumeData?.experienceLevel || '';
        
        // Build dynamic context
        const jobRequirements = this.extractJobRequirements(jobDescription);
        const skillGaps = this.identifySkillGaps(candidateSkills, jobRequirements.skills);
        
        const prompt = `
Generate highly personalized interview preparation for:
- Position: ${jobTitle} at ${companyName}
- Job Description: ${jobDescription}

Candidate Profile:
- Skills: ${candidateSkills.join(', ')}
- Experience Level: ${experienceLevel}
- Work History: ${workExperience.map(exp => `${exp.JobTitle} at ${exp.Company}`).join(', ')}
- Education: ${education.map(edu => `${edu.Degree} from ${edu.Institution}`).join(', ')}

Skill Analysis:
- Matching Skills: ${jobRequirements.skills.filter(skill => candidateSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))).join(', ')}
- Skills to Highlight: ${candidateSkills.slice(0, 5).join(', ')}
- Potential Gaps: ${skillGaps.join(', ')}

Generate SPECIFIC interview prep based on this EXACT job and candidate profile:

1. Technical questions that test the EXACT skills mentioned in job description
2. Behavioral questions that relate to candidate's ACTUAL experience
3. Company-specific research points for ${companyName}
4. Questions to ask that show understanding of THIS specific role
5. STAR examples using candidate's REAL work experience
6. Skills to emphasize based on job requirements match
7. Preparation timeline focused on addressing skill gaps

Return as JSON with dynamic, personalized content - NO generic responses.
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

    extractJobRequirements(jobDescription) {
        if (!jobDescription) return { skills: [], requirements: [] };
        
        const text = jobDescription.toLowerCase();
        const commonSkills = [
            'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
            'kubernetes', 'git', 'agile', 'scrum', 'leadership', 'communication',
            'project management', 'data analysis', 'machine learning', 'ai',
            'marketing', 'sales', 'finance', 'accounting', 'design', 'ui/ux'
        ];
        
        const foundSkills = commonSkills.filter(skill => text.includes(skill));
        const requirements = [];
        
        if (text.includes('bachelor') || text.includes('degree')) requirements.push('Bachelor\'s degree');
        if (text.includes('experience')) requirements.push('Relevant experience');
        if (text.includes('remote')) requirements.push('Remote work capability');
        
        return { skills: foundSkills, requirements };
    }
    
    identifySkillGaps(candidateSkills, jobSkills) {
        const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
        return jobSkills.filter(jobSkill => 
            !candidateSkillsLower.some(cs => cs.includes(jobSkill.toLowerCase()))
        );
    }

    getFallbackInterviewPrep(jobTitle, companyName, resumeData = null) {
        return {
            companyResearch: {
                keyFacts: [
                    `${companyName} is a leading company in their industry`,
                    `Research ${companyName}'s mission, vision, and values`,
                    `Look up recent news and developments about ${companyName}`,
                    `Understand ${companyName}'s products, services, and market position`
                ],
                recentNews: [
                    `Check ${companyName}'s latest press releases and announcements`,
                    `Review their social media updates and company blog`,
                    `Look for recent awards, partnerships, or expansions`
                ],
                culture: `Research ${companyName}'s work culture through employee reviews on Glassdoor, LinkedIn, and company website. Look for information about work-life balance, team dynamics, and company values.`
            },
            technicalQuestions: [
                `What experience do you have in ${jobTitle} roles?`,
                'Describe a challenging project you worked on and how you solved it',
                'How do you stay updated with industry trends and technologies?',
                'Walk me through your problem-solving approach',
                'What tools and technologies are you most comfortable with?',
                'How do you ensure quality in your work?',
                'Describe a time when you had to learn something new quickly'
            ],
            behavioralQuestions: [
                'Tell me about yourself and your career journey',
                `Why are you interested in working at ${companyName}?`,
                'Describe a time when you faced a difficult challenge at work',
                'How do you handle working under pressure or tight deadlines?',
                'Tell me about a time you had to work with a difficult team member',
                'Where do you see yourself in 5 years?',
                'What motivates you in your work?',
                'Describe a time when you had to adapt to significant changes'
            ],
            questionsToAsk: [
                'What does a typical day look like in this role?',
                'What are the biggest challenges facing the team right now?',
                'How do you measure success in this position?',
                'What opportunities are there for professional development?',
                `What do you enjoy most about working at ${companyName}?`,
                'What are the next steps in the interview process?',
                'How would you describe the team culture?'
            ],
            starExamples: [
                {
                    situation: 'Describe a specific challenging situation you faced in a previous role',
                    task: 'Explain what you needed to accomplish or the goal you were working toward',
                    action: 'Detail the specific actions you took to address the situation',
                    result: 'Share the positive outcome and what you learned from the experience'
                }
            ],
            preparationChecklist: [
                `Research ${companyName} thoroughly - history, mission, recent news`,
                'Review the job description and match your experience to requirements',
                'Prepare 3-5 STAR method examples from your experience',
                'Practice common interview questions out loud',
                'Prepare thoughtful questions to ask the interviewer',
                'Plan your outfit and route to the interview location',
                'Bring multiple copies of your resume and a notepad',
                'Get a good night\'s sleep before the interview'
            ]
        };
    }
}

export default new GeminiService();