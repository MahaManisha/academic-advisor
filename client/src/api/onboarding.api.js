import axiosInstance from './axios';

// Get dynamic onboarding questions/configuration
export const getOnboardingQuestions = async () => {
    try {
        const response = await axiosInstance.get('/onboarding/questions');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch onboarding questions:', error);
        throw error;
    }
};

// Submit onboarding data
export const submitOnboarding = async (data) => {
    try {
        const response = await axiosInstance.post('/onboarding/submit', data);
        return response.data;
    } catch (error) {
        console.error('Failed to submit onboarding:', error);
        throw error;
    }
};
