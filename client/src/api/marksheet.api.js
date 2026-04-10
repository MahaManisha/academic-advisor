// client/src/api/marksheet.api.js
import axios from './axios';

// Get all marksheets for the current student
export const getMarksheets = async () => {
  try {
    const response = await axios.get('/marksheets');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add / upload a new marksheet
export const addMarksheet = async (marksheetData) => {
  try {
    const response = await axios.post('/marksheets', marksheetData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Extract marksheet structured data from image
export const extractMarksheetFromImage = async (base64Image) => {
  try {
    const response = await axios.post('/marksheets/extract', { image: base64Image });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Extract marksheet structured data from PDF
export const extractMarksheetFromPdf = async (base64Pdf) => {
  try {
    const response = await axios.post('/marksheets/extract-pdf', { pdfBase64: base64Pdf });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Extract marksheet structured data from Raw Text (e.g. from local PDF parsing)
export const extractMarksheetFromText = async (text) => {
  try {
    const response = await axios.post('/marksheets/extract-text', { text });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a marksheet by ID
export const deleteMarksheet = async (id) => {
  try {
    const response = await axios.delete(`/marksheets/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Trigger full AI analysis of a marksheet
export const analyzeMarksheet = async (id) => {
  try {
    const response = await axios.post(`/marksheets/${id}/analyze`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Trigger AI advice for a specific subject (by index in the subjects array)
export const analyzeSubject = async (marksheetId, subjectIndex) => {
  try {
    const response = await axios.post(`/marksheets/${marksheetId}/subject/${subjectIndex}/analyze`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
