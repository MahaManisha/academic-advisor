import axios from './axios';

// Send message to AI Advisor
export const sendMessage = async (question) => {
    try {
        const response = await axios.post('/chat', { question });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
