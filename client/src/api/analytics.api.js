import axios from './axios';

// Get Admin Dashboard Analytics
export const getDashboardAnalytics = async () => {
    try {
        const response = await axios.get('/analytics/dashboard');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Generate analytics (original function)
export const generateAnalytics = async (domain) => {
    try {
        const response = await axios.post(`/analytics/${domain}/generate`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
