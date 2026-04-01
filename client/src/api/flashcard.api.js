import axios from './axios';

export const generateFlashcards = async (text, title) => {
    try {
        const response = await axios.post('/flashcards/generate', { text, title });
        return response.data;
    } catch (error) {
        console.error("Flashcards Generation Error:", error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};

export const getMyFlashcardSets = async () => {
    try {
        const response = await axios.get('/flashcards');
        return response.data;
    } catch (error) {
        console.error("fetch Flashcards Error:", error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};

export const getFlashcardSet = async (id) => {
    try {
        const response = await axios.get(`/flashcards/${id}`);
        return response.data;
    } catch (error) {
        console.error("fetch set Error:", error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};
