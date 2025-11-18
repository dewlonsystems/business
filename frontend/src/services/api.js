// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
console.log("API_BASE_URL is:", API_BASE_URL); // Debug log to ensure correct backend URL

// Create base API instance for authenticated requests
const api = axios.create({
  baseURL: API_BASE_URL,
  xsrfCookieName: false,  // Disable CSRF
  xsrfHeaderName: false,  // Disable CSRF
});

// Create auth API instance for authentication requests (no automatic token)
const authApi = axios.create({
  baseURL: API_BASE_URL,
  xsrfCookieName: false,
  xsrfHeaderName: false,
});

// Add token to requests automatically for the main API (authenticated endpoints)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Account services (use authApi which doesn't auto-add tokens)
export const authAPI = {
  login: async (credentials) => {
    console.log("Logging in with:", credentials); // Debug login data
    try {
      const response = await authApi.post('/accounts/login/', credentials, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log("Login response:", response.data); // Debug response
      return response;
    } catch (error) {
      if (error.response) {
        console.error("Login error response:", error.response.data);
      } else {
        console.error("Login error:", error.message);
      }
      throw error;
    }
  },

  register: (userData) => authApi.post('/accounts/register/', userData, {
    headers: { 'Content-Type': 'application/json' }
  }),

  logout: async () => {
    localStorage.removeItem('token');
    try {
      const response = await api.post('/accounts/logout/');
      console.log("Logout response:", response.data);
      return response;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/accounts/profile/');
      console.log("Profile response:", response.data);
      return response;
    } catch (error) {
      console.error("GetProfile error:", error);
      throw error;
    }
  },
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
