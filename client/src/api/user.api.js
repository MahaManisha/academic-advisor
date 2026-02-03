import axios from './axios';

// Get all users (Admin)
export const getAllUsers = async (page = 1, limit = 10) => {
    try {
        const response = await axios.get(`/users?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get user stats (Admin)
export const getUserStats = async () => {
    try {
        const response = await axios.get('/users/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update user status (Admin)
export const updateUserStatus = async (userId, status) => {
    try {
        const response = await axios.patch(`/users/${userId}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
