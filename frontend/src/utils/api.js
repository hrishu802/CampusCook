// src/api.js
import axios from 'axios';

// For Create React App:api
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`, // -> https://campuscook.onrender.com/api in production
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
