import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Auth endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateUserProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/password', passwordData),
  getUserActivity: (params) => api.get(`/auth/activity?${params}`),

  // Artist endpoints
  searchArtist: (name, useAI = false, aiProvider = 'openai', aiModel = 'default') =>
    api.get(`/artists/search?name=${encodeURIComponent(name)}&useAI=${useAI}&aiProvider=${aiProvider}&aiModel=${aiModel}`),
  
  getAllAboutArtist: (name, aiProvider = 'perplexity', aiModel = 'sonar-pro', entityId = null) => {
    let url = `/artists/all-about?name=${encodeURIComponent(name)}&aiProvider=${aiProvider}&aiModel=${aiModel}`;
    if (entityId) {
      url += `&entityId=${entityId}`;
    }
    return api.get(url);
  },
  
  getAllArtists: () => api.get('/artists'),
  getArtistById: (id) => api.get(`/artists/${id}`),
  updateArtist: (id, data) => api.put(`/artists/${id}`, data),
  deleteArtist: (id) => api.delete(`/artists/${id}`),
  getVerifiedArtists: (field = '') => api.get(`/artists/verified${field ? `?field=${field}` : ''}`),
  getUnverifiedArtists: (field = '') => api.get(`/artists/unverified${field ? `?field=${field}` : ''}`),
  getArtistStats: () => api.get('/artists/stats'),
  exportArtists: (data) => api.post('/artists/export', data),

  // Raag endpoints
  searchRaag: (name, useAI = false, aiProvider = 'openai', aiModel = 'default') =>
    api.get(`/raags/search?name=${encodeURIComponent(name)}&useAI=${useAI}&aiProvider=${aiProvider}&aiModel=${aiModel}`),
  
  getAllAboutRaag: (name, aiProvider = 'perplexity', aiModel = 'sonar-pro', entityId = null) => {
    let url = `/raags/all-about?name=${encodeURIComponent(name)}&aiProvider=${aiProvider}&aiModel=${aiModel}`;
    if (entityId) {
      url += `&entityId=${entityId}`;
    }
    return api.get(url);
  },
  
  getAllRaags: () => api.get('/raags'),
  getRaagById: (id) => api.get(`/raags/${id}`),
  updateRaag: (id, data) => api.put(`/raags/${id}`, data),
  deleteRaag: (id) => api.delete(`/raags/${id}`),
  getVerifiedRaags: (field = '') => api.get(`/raags/verified${field ? `?field=${field}` : ''}`),
  getUnverifiedRaags: (field = '') => api.get(`/raags/unverified${field ? `?field=${field}` : ''}`),
  getRaagStats: () => api.get('/raags/stats'),
  exportRaags: (data) => api.post('/raags/export', data),

  // Taal endpoints
  searchTaal: (name, useAI = false, aiProvider = 'openai', aiModel = 'default') =>
    api.get(`/taals/search?name=${encodeURIComponent(name)}&useAI=${useAI}&aiProvider=${aiProvider}&aiModel=${aiModel}`),
  
  getAllAboutTaal: (name, aiProvider = 'perplexity', aiModel = 'sonar-pro', entityId = null) => {
    let url = `/taals/all-about?name=${encodeURIComponent(name)}&aiProvider=${aiProvider}&aiModel=${aiModel}`;
    if (entityId) {
      url += `&entityId=${entityId}`;
    }
    return api.get(url);
  },
  
  getAllTaals: () => api.get('/taals'),
  getTaalById: (id) => api.get(`/taals/${id}`),
  updateTaal: (id, data) => api.put(`/taals/${id}`, data),
  deleteTaal: (id) => api.delete(`/taals/${id}`),
  getVerifiedTaals: (field = '') => api.get(`/taals/verified${field ? `?field=${field}` : ''}`),
  getUnverifiedTaals: (field = '') => api.get(`/taals/unverified${field ? `?field=${field}` : ''}`),
  getTaalStats: () => api.get('/taals/stats'),
  exportTaals: (data) => api.post('/taals/export', data),

  // Dashboard endpoints
  getDashboardStats: () => api.get('/dashboard/stats'),
  getPendingVerification: (category = '', limit = 10) => 
    api.get(`/dashboard/pending-verification?category=${category}&limit=${limit}`),

  // All About Data endpoints
  getAllAboutData: (category = '', limit = 20, page = 1) =>
    api.get(`/all-about?category=${category}&limit=${limit}&page=${page}`),
  getAllAboutDataById: (id) => api.get(`/all-about/${id}`),
  updateAllAboutData: (id, data) => api.put(`/all-about/${id}`, data),
  deleteAllAboutData: (id) => api.delete(`/all-about/${id}`),
};

export default apiService;