import axios from './axios';

export const createSession = async (sessionData) => {
  const response = await axios.post('/sessions', sessionData);
  return response.data;
};

export const getMySessions = async () => {
  const response = await axios.get('/sessions/my');
  return response.data;
};

export const updateSessionStatus = async (id, status) => {
  const response = await axios.patch(`/sessions/${id}`, { status });
  return response.data;
};

export const deleteSession = async (id) => {
  const response = await axios.delete(`/sessions/${id}`);
  return response.data;
};
