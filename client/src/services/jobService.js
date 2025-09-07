import axios from 'axios';

// Normalize API base to avoid URLs like ":8000/..." when env is misconfigured
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = (rawBase || '').replace(/\/$/, '');

class JobService {
  async generateRoadmap(jobTitle, currentSkills = [], experienceLevel = 'beginner') {
    try {
      const response = await axios.post(`${API_BASE}/jobs/api/generate-roadmap`, {
        jobTitle, currentSkills, experienceLevel
      });
      return response.data;
    } catch (error) {
      console.error('Generate roadmap error:', error);
      throw error;
    }
  }

  async generateSkillGapAnalysis(targetJob, currentSkills = [], currentExperience = '') {
    try {
      const response = await axios.post(`${API_BASE}/jobs/api/generate-skill-gap-analysis`, {
        targetJob, currentSkills, currentExperience
      });
      return response.data;
    } catch (error) {
      console.error('Generate skill gap analysis error:', error);
      throw error;
    }
  }
  async searchJobs(params) {
    try {
      const response = await axios.get(`${API_BASE}/jobs/search`, { params });
      return response.data;
    } catch (error) {
      console.error('Search jobs error:', error);
      throw error;
    }
  }

  async getRecommendations() {
    try {
      const response = await axios.get(`${API_BASE}/jobs/recommendations`);
      return response.data;
    } catch (error) {
      console.error('Get recommendations error:', error);
      throw error;
    }
  }

  async getJob(id) {
    try {
      const response = await axios.get(`${API_BASE}/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get job error:', error);
      throw error;
    }
  }

  async saveJob(jobId) {
    try {
      const response = await axios.post(`${API_BASE}/jobs/save`, { jobId });
      return response.data;
    } catch (error) {
      console.error('Save job error:', error);
      throw error;
    }
  }

  async applyJob(jobId) {
    try {
      const response = await axios.post(`${API_BASE}/jobs/apply`, { jobId });
      return response.data;
    } catch (error) {
      console.error('Apply job error:', error);
      throw error;
    }
  }

  async getSavedJobs() {
    try {
      const response = await axios.get(`${API_BASE}/jobs/saved`);
      return response.data;
    } catch (error) {
      console.error('Get saved jobs error:', error);
      throw error;
    }
  }

  async getAppliedJobs() {
    try {
      const response = await axios.get(`${API_BASE}/jobs/applied`);
      return response.data;
    } catch (error) {
      console.error('Get applied jobs error:', error);
      throw error;
    }
  }

  // RapidAPI methods
  async searchJobsJSearch(query, page = 1, numPages = 1, country = 'us', datePosted = 'all') {
    try {
      const params = { query, page, numPages, country, datePosted };
      const response = await axios.get(`${API_BASE}/jobs/api/jsearch`, { params });
      return response.data;
    } catch (error) {
      console.error('JSearch API error:', error);
      throw error;
    }
  }

  async getActiveATSJobs() {
    try {
      const response = await axios.get(`${API_BASE}/jobs/api/ats-jobs`);
      return response.data;
    } catch (error) {
      console.error('ATS jobs API error:', error);
      throw error;
    }
  }

  async getActiveInternships() {
    try {
      const response = await axios.get(`${API_BASE}/jobs/api/internships`);
      return response.data;
    } catch (error) {
      console.error('Internships API error:', error);
      throw error;
    }
  }

  async getInterviewDetails(interviewId) {
    try {
      const response = await axios.get(`${API_BASE}/jobs/api/interview/${interviewId}`);
      return response.data;
    } catch (error) {
      console.error('Interview details API error:', error);
      throw error;
    }
  }

  async parseResume(resumeText) {
    try {
      const response = await axios.post(`${API_BASE}/jobs/api/parse-resume`, { resumeText });
      return response.data;
    } catch (error) {
      console.error('Resume parsing API error:', error);
      throw error;
    }
  }

  async parseResumeFile(file) {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await axios.post(`${API_BASE}/jobs/api/parse-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Resume file parsing API error:', error);
      throw error;
    }
  }

  async searchAllJobs(query, location = '', page = 1) {
    try {
      const params = { query, location, page };
      const response = await axios.get(`${API_BASE}/jobs/api/search-all`, { params });
      return response.data;
    } catch (error) {
      console.error('Combined search API error:', error);
      throw error;
    }
  }

  async getInterviewPrep(companyName, jobTitle) {
    try {
      const params = { companyName, jobTitle };
      const response = await axios.get(`${API_BASE}/jobs/api/interview-prep`, { params });
      return response.data;
    } catch (error) {
      console.error('Interview prep API error:', error);
      throw error;
    }
  }

  // Gemini AI methods
  async generateRoadmap(jobTitle, currentSkills = [], experienceLevel = 'beginner') {
    try {
      const response = await axios.post(`${API_BASE}/jobs/api/generate-roadmap`, {
        jobTitle,
        currentSkills,
        experienceLevel
      });
      return response.data;
    } catch (error) {
      console.error('Roadmap generation error:', error);
      throw error;
    }
  }

  async generateInterviewPrep(jobTitle, companyName, jobDescription = '') {
    try {
      const response = await axios.post(`${API_BASE}/jobs/api/generate-interview-prep`, {
        jobTitle,
        companyName,
        jobDescription
      });
      return response.data;
    } catch (error) {
      console.error('Interview prep generation error:', error);
      throw error;
    }
  }

  async generateSkillGapAnalysis(targetJob, currentSkills = [], currentExperience = '') {
    try {
      const response = await axios.post(`${API_BASE}/jobs/api/generate-skill-gap-analysis`, {
        targetJob,
        currentSkills,
        currentExperience
      });
      return response.data;
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      throw error;
    }
  }
}

export const jobService = new JobService();