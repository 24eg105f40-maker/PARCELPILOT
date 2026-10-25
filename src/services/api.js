// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('parcelpilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors (like expired 401s)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login attempt failures
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('parcelpilot_token');
        localStorage.removeItem('parcelpilot_user');
        window.dispatchEvent(new Event('parcelpilot_auth_expired'));
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth Endpoints ────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};

// ── Shipments Endpoints ───────────────────────────────────────────────────────
export const shipmentApi = {
  list: async (params = {}) => {
    const res = await apiClient.get('/shipments', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/shipments/${id}`);
    return res.data;
  },
  // Public tracking (sanitized, no recipient phone/email)
  track: async (trackingId) => {
    const res = await apiClient.get(`/shipments/track/${trackingId}`);
    return res.data;
  },
  create: async (shipmentData) => {
    const res = await apiClient.post('/shipments', shipmentData);
    return res.data;
  },
  update: async (id, updateData) => {
    const res = await apiClient.patch(`/shipments/${id}`, updateData);
    return res.data;
  },
  updateStatus: async (id, status, locationHint, description) => {
    const res = await apiClient.patch(`/shipments/${id}/status`, {
      status,
      location: locationHint,
      description,
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/shipments/${id}`);
    return res.data;
  },
};

// ── Analytics & Feeds ─────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: async () => {
    const res = await apiClient.get('/dashboard/stats');
    return res.data;
  },
};

export const activityApi = {
  getActivity: async (limit = 20) => {
    const res = await apiClient.get('/activity', { params: { limit } });
    return res.data;
  },
};

export const reportsApi = {
  getReports: async () => {
    const res = await apiClient.get('/reports/shipments');
    return res.data;
  },
};

export const healthApi = {
  check: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },
};

export default apiClient;
