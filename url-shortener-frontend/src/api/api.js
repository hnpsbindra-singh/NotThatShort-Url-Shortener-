import axios from 'axios';

const BASE_URL = 'https://notthatshort-url-shortener.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nts_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/v1/api/auth/register', data);
export const verifyOtp = (data) => api.post('/v1/api/auth/verify-otp', data);
export const login = (data) => api.post('/v1/api/auth/login', data);
export const sendOtp = (username) =>
  api.post(`/v1/api/auth/send-otp?username=${encodeURIComponent(username)}`);
export const verifyResetOtp = (data) =>
  api.put('/v1/api/auth/verify-reset-otp', data);

// ─── URL ─────────────────────────────────────────────────────────────────────
export const shortenUrl = (data) => api.post('/v1/api/url/shorten', data);
export const getLink = (code) => api.get(`/v1/api/url/get/${code}`);
export const getAllLinks = () => api.get('/v1/api/url/get/All/me');
export const getUserProfile = () => api.get('/v1/api/url/get/me');
export const deleteLink = (code) => api.delete(`/v1/api/url/get/${code}`);

export default api;
