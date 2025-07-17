import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
  
    return Promise.reject(error);
  }
);

// Lab API
export const labAPI = {
  get: () => api.get('/lab'),
  create: (data) => api.post('/lab', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/lab/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/lab/${id}`)
};

// Test Groups API
export const testGroupAPI = {
  getAll: (params) => api.get('/test-groups', { params }),
  getById: (id) => api.get(`/test-groups/${id}`),
  create: (data) => api.post('/test-groups', data),
  update: (id, data) => api.put(`/test-groups/${id}`, data),
  delete: (id) => api.delete(`/test-groups/${id}`),
  // Methods for tests within a group
  addTest: (groupId, testData) => api.post(`/test-groups/${groupId}/tests`, testData),
  updateTest: (testId, testData) => api.put(`/test-groups/tests/${testId}`, testData),
  removeTest: (groupId, testId) => api.delete(`/test-groups/${groupId}/tests/${testId}`)
};

// Bills API
export const billAPI = {
  getAll: (params) => api.get('/bills', { params }),
  getById: (id) => api.get(`/bills/${id}`),
  getByNumber: (billNumber) => api.get(`/bills/number/${billNumber}`),
  create: (data) => api.post('/bills', data),
  update: (id, data) => api.put(`/bills/${id}`, data),
  delete: (id) => api.delete(`/bills/${id}`),
  updatePayment: (id, data) => api.put(`/bills/${id}/payment`, data),
  getStats: (params) => api.get('/bills/stats/summary', { params })
};

// Reports API
export const reportAPI = {
  getByBillId: (billId) => api.get(`/reports/bill/${billId}`),
  update: (reportId, updateData) => api.put(`/reports/${reportId}`, updateData)
};

// Payment Modes API
export const paymentModeAPI = {
  getAll: () => api.get('/payment-modes'),
  getById: (id) => api.get(`/payment-modes/${id}`),
  create: (data) => api.post('/payment-modes', data),
  update: (id, data) => api.put(`/payment-modes/${id}`, data),
  delete: (id) => api.delete(`/payment-modes/${id}`)
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
};

// Referred Doctors API
export const referredDoctorAPI = {
  getAll: (params) => api.get('/referred-doctors', { params }),
  getById: (id) => api.get(`/referred-doctors/${id}`),
  searchByMobile: (mobile) => api.get(`/referred-doctors/search/mobile/${mobile}`),
  create: (data) => api.post('/referred-doctors', data),
  update: (id, data) => api.put(`/referred-doctors/${id}`, data),
  delete: (id) => api.delete(`/referred-doctors/${id}`),
  getBills: (id, params) => api.get(`/referred-doctors/${id}/bills`, { params })
};

export default api; 