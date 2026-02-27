import axiosInstance from './axios';

export const getGamificationStats = async () => {
    try {
        const response = await axiosInstance.get('/gamification/me');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch gamification stats:', error);
        throw error;
    }
};

export const updateGamificationProgress = async (action, customXP = 0) => {
    try {
        const response = await axiosInstance.post('/gamification/update', { action, customXP });
        return response.data;
    } catch (error) {
        console.error('Failed to update gamification progress:', error);
        throw error;
    }
};
