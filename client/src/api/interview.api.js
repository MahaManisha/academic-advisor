import axiosInstance from './axios';

export const getInterviewQuestions = async (company, role, difficulty) => {
    try {
        const response = await axiosInstance.post('/interview/questions', {
            company,
            role,
            difficulty
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching interview questions:', error);
        throw error;
    }
};
