// client/src/api/peer.api.js
import axios from './axios';

// ─── Existing ───

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

// ─── New: Peer Connection APIs ───

export const getPeerList = async () => {
    try {
        const response = await axios.get('/peer/list');
        return response.data;
    } catch (error) {
        console.error('Error fetching peer list:', error);
        return { success: false, peers: [] };
    }
};

export const sendConnectionRequest = async (targetId) => {
    try {
        const response = await axios.post(`/peer/request/${targetId}`);
        return response.data;
    } catch (error) {
        console.error('Error sending connection request:', error);
        return { success: false, message: error.response?.data?.message || 'Failed to send request' };
    }
};

export const respondToRequest = async (requesterId, action) => {
    try {
        const response = await axios.post('/peer/respond', { requesterId, action });
        return response.data;
    } catch (error) {
        console.error('Error responding to request:', error);
        return { success: false, message: error.response?.data?.message || 'Failed to respond' };
    }
};

export const getChatMessages = async (peerId) => {
    try {
        const response = await axios.get(`/peer/messages/${peerId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return { success: false, messages: [] };
    }
};
