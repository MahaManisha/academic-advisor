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

// Extract subjects from syllabus content or URL
export const extractSubjects = async (data) => {
    try {
        // data can be { url: string, context: string }
        const response = await axios.post('/nlp/extract-subjects', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
