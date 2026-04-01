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

export const getDiagnosticTest = async (domain) => {
    try {
        const response = await axiosInstance.post('/onboarding/diagnostic/test', {
            domain
        });
        return response.data;
    } catch (error) {
        console.error('Failed to get diagnostic test:', error);
        throw error;
    }
};

export const evaluateDiagnosticTest = async (domain, questions, answers) => {
    try {
        const response = await axiosInstance.post('/onboarding/diagnostic/evaluate', {
            domain, questions, answers
        });
        return response.data;
    } catch (error) {
        console.error('Failed to evaluate diagnostic test:', error);
        throw error;
    }
};
