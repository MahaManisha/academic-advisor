// client/src/api/career.api.js
import api from './axios';

// Get Mission 1: Academic Foundation Profile
export const getAcademicFoundation = async () => {
  const res = await api.get('/career/mission-1');
  return res.data;
};

// Submit Mission 1: Academic Foundation Profile
export const submitAcademicFoundation = async (formData) => {
  const res = await api.post('/career/mission-1', formData);
  return res.data;
};

// Get Mission 2: Career Interest Profile (AHP)
export const getCareerInterest = async () => {
  const res = await api.get('/career/mission-2');
  return res.data;
};

// Submit Mission 2: Career Interest Profile (AHP)
export const submitCareerInterest = async (data) => {
  const res = await api.post('/career/mission-2', data);
  return res.data;
};

// Get Mission 3: Learning Behaviour Profile (Fuzzy Logic)
export const getLearningBehaviour = async () => {
  const res = await api.get('/career/mission-3');
  return res.data;
};

// Submit Mission 3: Learning Behaviour Profile (Fuzzy Logic)
export const submitLearningBehaviour = async (data) => {
  const res = await api.post('/career/mission-3', data);
  return res.data;
};

// Get Mission 4: Cognitive & Behaviour Profile (Telemetry & Vector)
export const getCognitiveBehaviour = async () => {
  const res = await api.get('/career/mission-4');
  return res.data;
};

// Submit Mission 4: Cognitive & Behaviour Profile (Telemetry & Vector)
export const submitCognitiveBehaviour = async (data) => {
  const res = await api.post('/career/mission-4', data);
  return res.data;
};

// Get Mission 5: Career Compatibility Profile (Multi-Vector Synthesis)
export const getCareerCompatibility = async () => {
  const res = await api.get('/career/mission-5');
  return res.data;
};

// Submit Mission 5: Career Compatibility Analysis
export const submitCareerCompatibility = async () => {
  const res = await api.post('/career/mission-5', {});
  return res.data;
};

// Get Mission 6: Permanent Academic DNA Profile
export const getAcademicDna = async () => {
  const res = await api.get('/career/mission-6');
  return res.data;
};

// Submit Mission 6: Academic DNA Generation
export const submitAcademicDna = async () => {
  const res = await api.post('/career/mission-6', {});
  return res.data;
};






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
