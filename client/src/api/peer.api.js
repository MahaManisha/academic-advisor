import axios from './axios';

export const getPeerSuggestions = async (skill) => {
    try {
        const response = await axios.get(`/peer/suggest`, { params: { skill } });
        return response.data;
    } catch (error) {
        console.error('Error fetching peers:', error);
        return { success: false, peers: [] };
    }
};

export const getChatHistory = async (roomId) => {
    try {
        const response = await axios.get(`/peer/chat/${roomId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return { success: false, chat: null };
    }
};
