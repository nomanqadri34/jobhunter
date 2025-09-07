import axios from 'axios';

const RAW_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = (RAW_BASE || '').replace(/\/$/, '');

class InterviewService {
    async generatePrep(data) {
        try {
            const response = await axios.post(`${API_BASE}/interview/prepare`, data);
            return response.data;
        } catch (error) {
            console.error('Generate prep error:', error);
            throw error;
        }
    }

    async generateInterviewPrep(data) {
        try {
            const response = await axios.post(`${API_BASE}/jobs/api/generate-interview-prep`, data);
            return response.data;
        } catch (error) {
            console.error('Generate interview prep error:', error);
            throw error;
        }
    }

    async createReminder(data) {
        try {
            const response = await axios.post(`${API_BASE}/interview/reminder`, data);
            return response.data;
        } catch (error) {
            console.error('Create reminder error:', error);
            throw error;
        }
    }

    async createApplicationReminder(data) {
        try {
            const response = await axios.post(`${API_BASE}/interview/application-reminder`, data);
            return response.data;
        } catch (error) {
            console.error('Create application reminder error:', error);
            throw error;
        }
    }
}

export const interviewService = new InterviewService();