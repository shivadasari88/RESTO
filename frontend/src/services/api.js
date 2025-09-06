import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

console.log('API Base URL:', API_BASE_URL); // Add this for debugging

const api = axios.create({
  baseURL: API_BASE_URL,
  //withCredentials: true,
  timeout: 10000, // Add timeout
});

// Add better error handling
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

export default api;