import axios from './axios';

export const getAllCourses = async () => {
    try {
        const response = await axios.get('/courses');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createCourse = async (courseData) => {
    try {
        const response = await axios.post('/courses', courseData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateCourse = async (id, courseData) => {
    try {
        const response = await axios.put(`/courses/${id}`, courseData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteCourse = async (id) => {
    try {
        const response = await axios.delete(`/courses/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
