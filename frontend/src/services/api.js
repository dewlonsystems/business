// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Create base API instance for authenticated requests
const api = axios.create({
  baseURL: API_BASE_URL,
  xsrfCookieName: false,  // Disable CSRF
  xsrfHeaderName: false,  // Disable CSRF
});

// Create auth API instance for authentication requests (no automatic token)
const authApi = axios.create({
  baseURL: API_BASE_URL,
  xsrfCookieName: false,  // Disable CSRF
  xsrfHeaderName: false,  // Disable CSRF
});

// Add token to requests automatically for the main API (authenticated endpoints)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Account services (use authApi which doesn't auto-add tokens)
export const authAPI = {
  login: (credentials) => authApi.post('/accounts/login/', credentials),
  register: (userData) => authApi.post('/accounts/register/', userData),
  logout: () => {
    // Remove token from localStorage and then make the API call
    localStorage.removeItem('token');
    return api.post('/accounts/logout/'); // Use regular API after removing token
  },
  getProfile: () => api.get('/accounts/profile/'), // Use regular API after login
};

// Payment services (require authentication)
export const paymentAPI = {
  initiatePayment: (paymentData) => api.post('/payments/initiate/', paymentData),
  getPaymentStatus: (referenceId) => api.get(`/payments/status/${referenceId}/`),
  getPaymentList: () => api.get('/payments/list/'),
  verifyPayment: (referenceId) => api.post(`/payments/verify/${referenceId}/`),
  getDailySummary: (params) => api.get('/payments/analytics/daily/', { params }),
  getUserSummary: (params) => api.get('/payments/analytics/user/', { params }),
  getOverallStats: () => api.get('/payments/analytics/stats/'),
};

// Receipt services (require authentication)
export const receiptAPI = {
  getReceipts: () => api.get('/receipts/'),
  getReceipt: (id) => api.get(`/receipts/${id}/`),
  generateReceipt: (paymentId) => api.post(`/receipts/generate/${paymentId}/`),
  exportReceipt: (id) => api.get(`/receipts/export/${id}/`, { responseType: 'blob' }),
  getReceiptByPayment: (paymentReferenceId) => api.get(`/receipts/payment/${paymentReferenceId}/`),
};

export default api;