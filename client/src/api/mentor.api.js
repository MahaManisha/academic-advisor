// client/src/api/mentor.api.js
import axios from './axios';

export const getMentorChatList = async () => {
    try {
        const response = await axios.get('/mentor/chat-list');
        return response.data;
    } catch (error) {
        console.error('Error fetching chat list:', error);
        return { success: false, list: [] };
    }
};

export const getMentorChatMessages = async (peerId) => {
    try {
        const response = await axios.get(`/mentor/messages/${peerId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return { success: false, messages: [] };
    }
};
