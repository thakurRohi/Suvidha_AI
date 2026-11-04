import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/auth/profile', userData);
    return response.data;
  },
};

// Post Services
export const postService = {
  uploadPost: async (formData) => {
    const response = await axiosInstance.post('/posts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  analyzePost: async (postId, data) => {
    const response = await axiosInstance.post(`/posts/${postId}/analyze`, data);
    return response.data;
  },

  getPosts: async () => {
    const response = await axiosInstance.get('/posts');
    return response.data;
  },

  getPost: async (postId) => {
    const response = await axiosInstance.get(`/posts/${postId}`);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await axiosInstance.delete(`/posts/${postId}`);
    return response.data;
  },

  updateMetrics: async (postId, metrics) => {
    const response = await axiosInstance.put(`/posts/${postId}/metrics`, metrics);
    return response.data;
  },

  // NEW ANALYTICS ENDPOINTS
  generateAnalytics: async (postId, data) => {
    const response = await axiosInstance.post(`/posts/${postId}/generate-analytics`, data);
    return response.data;
  },

  regenerateAlternatives: async (postId, data) => {
    const response = await axiosInstance.post(`/posts/${postId}/regenerate-alternatives`, data);
    return response.data;
  },

  getAnalytics: async (postId) => {
    const response = await axiosInstance.get(`/posts/${postId}/analytics`);
    return response.data;
  },

  compareVariations: async (postId) => {
    const response = await axiosInstance.get(`/posts/${postId}/compare-variations`);
    return response.data;
  },

  getImprovementSuggestions: async (postId, data) => {
    const response = await axiosInstance.post(`/posts/${postId}/suggestions`, data);
    return response.data;
  },

  getComprehensiveReport: async (postId, data) => {
    const response = await axiosInstance.post(`/posts/${postId}/comprehensive-report`, data);
    return response.data;
  },

  getTrends: async (niche = 'general') => {
    const response = await axiosInstance.get(`/posts/trends?niche=${niche}`);
    return response.data;
  },

  getContentCalendar: async (weekOffset = 0) => {
    const response = await axiosInstance.get(`/posts/calendar?week=${weekOffset}`);
    return response.data;
  },

  getAudienceInsights: async (period = '30d') => {
    const response = await axiosInstance.get(`/posts/insights?period=${period}`);
    return response.data;
  },
};

// Export axiosInstance as default for direct API calls
export default axiosInstance;
