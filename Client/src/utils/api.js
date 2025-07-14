import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          toast.error(data.message || 'Invalid request');
          break;
        case 404:
          toast.error(data.message || 'Resource not found');
          break;
        case 500:
          toast.error(data.message || 'Server error. Please try again later.');
          break;
        case 503:
          toast.error(data.message || 'Service temporarily unavailable');
          break;
        default:
          toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Artists
  searchArtist: (name, useAI = false, aiProvider = 'openai') =>
    api.get(`/api/artists/search?name=${encodeURIComponent(name)}&useAI=${useAI}&aiProvider=${aiProvider}`),
  
  getAllArtists: () => api.get('/api/artists'),
  getArtistById: (id) => api.get(`/api/artists/${id}`),
  updateArtist: (id, data) => api.put(`/api/artists/${id}`, data),
  getVerifiedArtists: (field) => api.get(`/api/artists/verified${field ? `?field=${field}` : ''}`),
  getUnverifiedArtists: (field) => api.get(`/api/artists/unverified${field ? `?field=${field}` : ''}`),
  getArtistStats: () => api.get('/api/artists/stats'),

  // Raags
  searchRaag: (name, useAI = false, aiProvider = 'openai') =>
    api.get(`/api/raags/search?name=${encodeURIComponent(name)}&useAI=${useAI}&aiProvider=${aiProvider}`),
  
  getAllRaags: () => api.get('/api/raags'),
  getRaagById: (id) => api.get(`/api/raags/${id}`),
  updateRaag: (id, data) => api.put(`/api/raags/${id}`, data),
  getVerifiedRaags: (field) => api.get(`/api/raags/verified${field ? `?field=${field}` : ''}`),
  getUnverifiedRaags: (field) => api.get(`/api/raags/unverified${field ? `?field=${field}` : ''}`),
  getRaagStats: () => api.get('/api/raags/stats'),

  // Taals
  searchTaal: (name, useAI = false, aiProvider = 'openai') =>
    api.get(`/api/taals/search?name=${encodeURIComponent(name)}&useAI=${useAI}&aiProvider=${aiProvider}`),
  
  getAllTaals: () => api.get('/api/taals'),
  getTaalById: (id) => api.get(`/api/taals/${id}`),
  updateTaal: (id, data) => api.put(`/api/taals/${id}`, data),
  getVerifiedTaals: (field) => api.get(`/api/taals/verified${field ? `?field=${field}` : ''}`),
  getUnverifiedTaals: (field) => api.get(`/api/taals/unverified${field ? `?field=${field}` : ''}`),
  getTaalStats: () => api.get('/api/taals/stats'),

  // Dashboard
  getDashboardStats: () => api.get('/api/dashboard/stats'),
  getPendingVerification: (category, limit = 10) => 
    api.get(`/api/dashboard/pending-verification?category=${category}&limit=${limit}`),
};

export default api;