// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Create base API instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests automatically for the main API
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Create auth API instance without automatic token
const authApi = axios.create({
  baseURL: API_BASE_URL,
});

// Account services (use authApi which doesn't auto-add tokens)
export const authAPI = {
  login: (credentials) => authApi.post('/accounts/login/', credentials),
  register: (userData) => authApi.post('/accounts/register/', userData),
  logout: () => api.post('/accounts/logout/'),
  getProfile: () => api.get('/accounts/profile/'),
};

// Payment services
export const paymentAPI = {
  initiatePayment: (paymentData) => api.post('/payments/initiate/', paymentData),
  getPaymentStatus: (referenceId) => api.get(`/payments/status/${referenceId}/`),
  getPaymentList: () => api.get('/payments/list/'),
  verifyPayment: (referenceId) => api.post(`/payments/verify/${referenceId}/`),
  getDailySummary: (params) => api.get('/payments/analytics/daily/', { params }),
  getUserSummary: (params) => api.get('/payments/analytics/user/', { params }),
  getOverallStats: () => api.get('/payments/analytics/stats/'),
};

// Receipt services
export const receiptAPI = {
  getReceipts: () => api.get('/receipts/'),
  getReceipt: (id) => api.get(`/receipts/${id}/`),
  generateReceipt: (paymentId) => api.post(`/receipts/generate/${paymentId}/`),
  exportReceipt: (id) => api.get(`/receipts/export/${id}/`, { responseType: 'blob' }),
  getReceiptByPayment: (paymentReferenceId) => api.get(`/receipts/payment/${paymentReferenceId}/`),
};

export default api;