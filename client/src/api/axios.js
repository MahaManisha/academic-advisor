import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token to every request
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

// Response interceptor - handle 401 globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Redirect to login page
      window.location.href = '/login';
      
      // You can also dispatch a logout action here if needed
      // This makes it hook-ready for future AuthContext integration
      const logoutEvent = new CustomEvent('unauthorized');
      window.dispatchEvent(logoutEvent);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;