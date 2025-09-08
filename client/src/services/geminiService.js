import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const API_BASE = import.meta.env.VITE_API_URL || 'https://jobhunter-dd9n.onrender.com/api';

export const geminiService = {
  generateInterviewPrep: async (companyName, jobTitle, userSkills = []) => {
    try {
      // Use backend API that includes YouTube videos
      const response = await fetch(`${API_BASE}/jobs/api/generate-interview-prep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle,
          companyName,
          userSkills
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Interview prep API error:", error);
      
      // Fallback to direct Gemini API if backend fails
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are an interview preparation assistant. 
Generate structured interview preparation for a candidate applying to ${jobTitle} at ${companyName}. 

The output must be in valid JSON format with the following keys:
{
  "companyResearch": {
    "keyFacts": ["..."],
    "recentNews": ["..."],
    "culture": "..."
  },
  "technicalQuestions": ["..."],
  "behavioralQuestions": ["..."],
  "questionsToAsk": ["..."],
  "starExamples": [{
    "situation": "...",
    "task": "...",
    "action": "...",
    "result": "..."
  }],
  "preparationChecklist": ["..."]
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let jsonData;
        try {
          const cleanText = text.replace(/```json\n?|```\n?/g, '').trim();
          jsonData = JSON.parse(cleanText);
        } catch (e) {
          jsonData = {
            companyResearch: {
              keyFacts: [`Research ${companyName}'s background and recent developments`],
              recentNews: [`Check ${companyName}'s latest news and updates`],
              culture: `Learn about ${companyName}'s work culture and values`
            },
            technicalQuestions: [
              `What experience do you have with ${jobTitle} responsibilities?`,
              'Describe a challenging technical problem you solved',
              'How do you approach learning new technologies?'
            ],
            behavioralQuestions: [
              'Tell me about yourself',
              `Why do you want to work at ${companyName}?`,
              'Describe a time you overcame a difficult challenge'
            ],
            questionsToAsk: [
              'What does a typical day look like in this role?',
              'What are the biggest challenges facing the team?',
              'How do you measure success in this position?'
            ],
            starExamples: [{
              situation: 'Describe a specific challenging situation',
              task: 'Explain what you needed to accomplish',
              action: 'Detail the actions you took',
              result: 'Share the positive outcome'
            }],
            preparationChecklist: [
              `Research ${companyName} thoroughly`,
              'Review the job requirements',
              'Prepare STAR method examples',
              'Practice common interview questions'
            ],
            rawOutput: text
          };
        }

        return jsonData;
      } catch (fallbackError) {
        console.error("Fallback Gemini API error:", fallbackError);
        throw error;
      }
    }
  },
};