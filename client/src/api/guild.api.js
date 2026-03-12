import axios from './axios';

export const getGuilds = async () => {
    try {
        const response = await axios.get('/guilds');
        return response.data;
    } catch (error) {
        console.error("fetchGuilds Error:", error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};

export const createGuild = async (data) => {
    try {
        const response = await axios.post('/guilds', data);
        return response.data;
    } catch (error) {
        console.error("createGuild Error:", error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};

export const getGuildDetails = async (id) => {
    try {
        const response = await axios.get(`/guilds/${id}`);
        return response.data;
    } catch (error) {
        console.error("getGuildDetails Error:", error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};

export const joinGuild = async (id) => {
    try {
        const response = await axios.post(`/guilds/${id}/join`);
        return response.data;
    } catch (error) {
        console.error("joinGuild Error:", error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};

export const contributeMission = async (id, progress = 1) => {
    try {
        const response = await axios.post(`/guilds/${id}/contribute`, { progress });
        return response.data;
    } catch (error) {
        console.error("contribute Error:", error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};
