// client/src/services/api.js
import axios from 'axios';

// Create axios instance with default config
// Using relative path because we have proxy setup for development
// In production, this will use the same domain as the frontend
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
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

// Auth endpoints
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  register: (name, email, password, role) => 
    api.post('/users', { name, email, password, role }),
};

// Chat endpoints
export const chatAPI = {
  sendMessage: (message) => 
    api.post('/chat', { message }),
};

// Candidate endpoints
export const candidateAPI = {
  uploadCV: (candidateData) => 
    api.post('/candidates/upload', candidateData),
  getCandidate: (id) => 
    api.get(`/candidates/${id}`),
};

// Job endpoints
export const jobAPI = {
  createJob: (jobData) => 
    api.post('/jobs', jobData),
  getJob: (id) => 
    api.get(`/jobs/${id}`),
  searchCandidates: (jobId) => 
    api.get(`/jobs/${jobId}/candidates`),
};

// User endpoints
export const userAPI = {
  getUser: (id) => 
    api.get(`/users/${id}`),
  updateUser: (id, userData) => 
    api.put(`/users/${id}`, userData),
  deleteUser: (id) => 
    api.delete(`/users/${id}`),
};

// Feedback endpoints
export const feedbackAPI = {
  submitFeedback: (feedbackData) => 
    api.post('/feedback', feedbackData),
  getFeedback: (jobId) => 
    api.get(`/feedback/${jobId}`),
};

export default api;