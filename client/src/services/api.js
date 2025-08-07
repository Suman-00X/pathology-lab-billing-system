import axios from 'axios';

// Use localhost for development, production URL for production
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : 'https://pathology-lab-billing-system.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Only redirect to login if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Lab API
export const labAPI = {
  get: () => api.get('/api/lab'),
  create: (data) => api.post('/api/lab', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/api/lab/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/api/lab/${id}`)
};

// Test Groups API
export const testGroupAPI = {
  getAll: (params) => api.get('/api/test-groups', { params }),
  getById: (id) => api.get(`/api/test-groups/${id}`),
  create: (data) => api.post('/api/test-groups', data),
  update: (id, data) => api.put(`/api/test-groups/${id}`, data),
  delete: (id) => api.delete(`/api/test-groups/${id}`),
  // Methods for tests within a group
  addTest: (groupId, testData) => api.post(`/api/test-groups/${groupId}/tests`, testData),
  updateTest: (testId, testData) => api.put(`/api/test-groups/tests/${testId}`, testData),
  removeTest: (groupId, testId) => api.delete(`/api/test-groups/${groupId}/tests/${testId}`)
};

// Bills API
export const billAPI = {
  getAll: (params) => api.get('/api/bills', { params }),
  getById: (id) => api.get(`/api/bills/${id}`),
  getByNumber: (billNumber) => api.get(`/api/bills/number/${billNumber}`),
  create: (data) => api.post('/api/bills', data),
  update: (id, data) => api.put(`/api/bills/${id}`, data),
  delete: (id, secretPin) => api.post(`/api/bills/${id}/delete`, { "secretPin": secretPin }),
  updatePayment: (id, data) => api.put(`/api/bills/${id}/payment`, data),
  getStats: (params) => api.get('/api/bills/stats/summary', { params })
};

// Reports API
export const reportAPI = {
  getByBillId: (billId) => api.get(`/api/reports/bill/${billId}`),
  update: (reportId, updateData) => api.put(`/api/reports/${reportId}`, updateData)
};

// Payment Modes API
export const paymentModeAPI = {
  getAll: () => api.get('/api/payment-modes'),
  getById: (id) => api.get(`/api/payment-modes/${id}`),
  create: (data) => api.post('/api/payment-modes', data),
  update: (id, data) => api.put(`/api/payment-modes/${id}`, data),
  delete: (id) => api.delete(`/api/payment-modes/${id}`)
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/api/settings'),
  update: (data) => api.put('/api/settings', data)
};

// Referred Doctors API
export const referredDoctorAPI = {
  getAll: (params) => api.get('/api/referred-doctors', { params }),
  getById: (id) => api.get(`/api/referred-doctors/${id}`),
  searchByMobile: (mobile) => api.get(`/api/referred-doctors/search/mobile/${mobile}`, { timeout: 15000 }), // 15 second timeout for search
  create: (data) => api.post('/api/referred-doctors', data),
  update: (id, data) => api.put(`/api/referred-doctors/${id}`, data),
  delete: (id) => api.delete(`/api/referred-doctors/${id}`),
  getBills: (id, params) => api.get(`/api/referred-doctors/${id}/bills`, { params })
};

export default api; 