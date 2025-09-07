import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class RapidApiService {
  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY;
    console.log('RapidAPI Key loaded:', this.rapidApiKey ? 'Yes' : 'No');
    this.baseHeaders = {
      'x-rapidapi-key': this.rapidApiKey
    };
  }

  // Job Search API - Active ATS Expired
  async getActiveATSExpiredJobs() {
    try {
      const response = await axios.get('https://job-search-api2.p.rapidapi.com/active-ats-expired', {
        headers: {
          ...this.baseHeaders,
          'x-rapidapi-host': 'job-search-api2.p.rapidapi.com'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active ATS expired jobs:', error);
      throw error;
    }
  }

  // Glassdoor API - Interview Details
  async getInterviewDetails(interviewId) {
    try {
      const response = await axios.get(`https://glassdoor-real-time.p.rapidapi.com/companies/interview-details?interviewId=${interviewId}`, {
        headers: {
          ...this.baseHeaders,
          'x-rapidapi-host': 'glassdoor-real-time.p.rapidapi.com'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching interview details:', error);
      throw error;
    }
  }

  // JSearch API - Job Search
  async searchJobs(query, page = 1, numPages = 1, country = 'us', datePosted = 'all') {
    try {
      const params = new URLSearchParams({
        query,
        page: page.toString(),
        num_pages: numPages.toString(),
        country,
        date_posted: datePosted
      });

      const response = await axios.get(`https://jsearch.p.rapidapi.com/search?${params}`, {
        headers: {
          ...this.baseHeaders,
          'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  // Internships API - Active JB 7D
  async getActiveInternships() {
    try {
      const response = await axios.get('https://internships-api.p.rapidapi.com/active-jb-7d', {
        headers: {
          ...this.baseHeaders,
          'x-rapidapi-host': 'internships-api.p.rapidapi.com'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active internships:', error);
      throw error;
    }
  }

  // Resume Optimizer Pro API - Parse Resume
  async parseResume(resumeText) {
    try {
      const response = await axios.post('https://resumeoptimizerpro.p.rapidapi.com/parse', {
        ResumeText: resumeText
      }, {
        headers: {
          ...this.baseHeaders,
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'resumeoptimizerpro.p.rapidapi.com'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw error;
    }
  }

  // Combined job search across multiple APIs
  async searchAllJobs(query, location = '', page = 1) {
    try {
      const results = await Promise.allSettled([
        this.searchJobs(`${query} jobs in ${location}`, page),
        this.getActiveATSExpiredJobs(),
        this.getActiveInternships()
      ]);

      const combinedResults = {
        jsearch: results[0].status === 'fulfilled' ? results[0].value : null,
        atsExpired: results[1].status === 'fulfilled' ? results[1].value : null,
        internships: results[2].status === 'fulfilled' ? results[2].value : null,
        errors: results.filter(r => r.status === 'rejected').map(r => r.reason.message)
      };

      return combinedResults;
    } catch (error) {
      console.error('Error in combined job search:', error);
      throw error;
    }
  }

  // Get interview preparation data
  async getInterviewPrep(companyName, jobTitle) {
    try {
      // Search for interview experiences related to the company/role
      const searchQuery = `${companyName} ${jobTitle} interview`;
      const jobResults = await this.searchJobs(searchQuery, 1, 1);

      return {
        searchResults: jobResults,
        tips: [
          'Research the company thoroughly',
          'Practice common interview questions',
          'Prepare specific examples using STAR method',
          'Have questions ready for the interviewer'
        ]
      };
    } catch (error) {
      console.error('Error getting interview prep data:', error);
      throw error;
    }
  }
}

export default new RapidApiService();