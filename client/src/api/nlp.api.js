import axios from './axios';

// Analyze course using NLP engine
export const analyzeCourse = async (courseName) => {
    try {
        const response = await axios.post('/nlp/analyze-course', { course: courseName });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
