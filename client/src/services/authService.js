import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  async login(descopeToken) {
    try {
      if (!descopeToken) {
        throw new Error('Descope token is required');
      }

      const response = await axios.post(`${API_BASE}/auth/login`, {
        descopeToken
      });

      if (response.data.success) {
        this.token = response.data.token;
        localStorage.setItem('token', this.token);

        // Trigger a custom event to notify App component
        window.dispatchEvent(new CustomEvent('authStatusChanged'));

        return response.data;
      }

      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      throw error;
    }
  }

  async getGoogleAuthUrl() {
    try {
      const response = await axios.get(`${API_BASE}/auth/google/url`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getLinkedInAuthUrl() {
    try {
      const response = await axios.get(`${API_BASE}/auth/linkedin/url`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getConnectionStatus() {
    try {
      const response = await axios.get(`${API_BASE}/auth/connections`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async disconnectAccount(provider) {
    try {
      const response = await axios.delete(`${API_BASE}/auth/disconnect/${provider}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createCalendarEvent(eventData) {
    try {
      const response = await axios.post(`${API_BASE}/auth/calendar/event`, {
        eventData
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createInterviewReminder(jobTitle, company, interviewDate) {
    try {
      const response = await axios.post(`${API_BASE}/auth/calendar/interview-reminder`, {
        jobTitle,
        company,
        interviewDate
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await axios.get(`${API_BASE}/auth/me`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');

    // Trigger a custom event to notify App component
    window.dispatchEvent(new CustomEvent('authStatusChanged'));
  }

  isAuthenticated() {
    // Always check localStorage for the most current token state
    this.token = localStorage.getItem('token');
    return !!this.token;
  }

  getToken() {
    return this.token;
  }
}

export const authService = new AuthService();