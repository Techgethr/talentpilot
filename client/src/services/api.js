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

// Create a separate instance for file uploads
const apiWithFiles = axios.create({
  baseURL: '/api',
});

// Chat endpoints
export const chatAPI = {
  sendMessage: (message) => 
    api.post('/chat', { message }),
};

// Candidate endpoints
export const candidateAPI = {
  uploadCV: (formData) => {
    // For file uploads, we need to use FormData and let axios set the correct headers
    return apiWithFiles.post('/candidates/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateCandidate: (id, formData) => {
    // For updates with potential file uploads, use FormData
    return apiWithFiles.put(`/candidates/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getCandidate: (id) => 
    api.get(`/candidates/${id}`),
  getAllCandidates: () => 
    api.get('/candidates'),
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