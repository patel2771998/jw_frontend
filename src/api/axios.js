import axios from 'axios';

const raw = import.meta.env.VITE_API_URL || '';
// Ensure full URL: if set but missing protocol, prepend https://
const baseURL = raw
  ? raw.startsWith('http://') || raw.startsWith('https://')
    ? raw.replace(/\/+$/, '')
    : `https://${raw.replace(/\/+$/, '')}`
  : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});


api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
