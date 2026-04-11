// client/src/api/career.api.js
import api from './axios';

// Fetch saved career profile (fast, cached)
export const getCareerProfile = async () => {
  const res = await api.get('/career/profile');
  return res.data;
};

// Run AI prediction and save to DB
export const predictCareer = async () => {
  const res = await api.post('/career/predict');
  return res.data;
};

// Get roadmap for a specific role by index
export const getCareerRoadmap = async (roleIndex) => {
  const res = await api.get(`/career/roadmap/${roleIndex}`);
  return res.data;
};
