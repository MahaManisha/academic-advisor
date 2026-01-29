// client/src/api/auth.api.js
import axios from './axios';

// Login user with credentials
export const login = async (credentials) => {
  const response = await axios.post('/auth/login', credentials);
  return response.data;
};

// Register new user
export const register = async (data) => {
  const response = await axios.post('/auth/register', data);
  return response.data;
};

// Get current authenticated user
export const getMe = async () => {
  const response = await axios.get('/auth/me');
  return response.data;
};

// Admin login with default credentials
export const adminLogin = async () => {
  const adminCredentials = {
    email: 'admin@gmail.com',
    password: '12345678'
  };
  const response = await axios.post('/auth/login', adminCredentials);
  return response.data;
};