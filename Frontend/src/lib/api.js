import axios from 'axios';

// Get the base URL from environment or use the default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
