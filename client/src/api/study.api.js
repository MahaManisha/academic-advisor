import axios from './axios';

export const startStudySession = async (courseId) => {
    try {
        const response = await axios.post('/study/start', { courseId });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const endStudySession = async (payload) => {
    try {
        const response = await axios.post('/study/end', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getStudyHistory = async () => {
    try {
        const response = await axios.get('/study/history');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
