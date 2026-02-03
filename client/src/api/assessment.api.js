import axios from './axios';

// Get dynamic onboarding questions
export const getOnboardingQuestions = async () => {
    try {
        const response = await axios.get('/assessments/onboarding-questions');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Start a domain specific assessment
export const startAssessment = async (domain) => {
    try {
        const response = await axios.get(`/assessments/${domain}/start`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Submit assessment results
export const submitAssessment = async (domain, answers) => {
    try {
        const response = await axios.post(`/assessments/${domain}/submit`, { answers });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
