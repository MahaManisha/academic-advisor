import axiosInstance from './axios';

export const getInterviewRounds = async (company, role) => {
    try {
        const response = await axiosInstance.post('/interview/rounds', {
            company,
            role
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching interview rounds:', error);
        throw error;
    }
};

export const getInterviewQuestions = async (company, role, difficulty, round) => {
    try {
        const response = await axiosInstance.post('/interview/questions', {
            company,
            role,
            difficulty,
            round
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching interview questions:', error);
        throw error;
    }
};
