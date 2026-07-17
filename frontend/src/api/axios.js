// api/axios.js — one shared HTTP client. Every page uses this instead of
// writing fetch() calls everywhere, and it automatically attaches the
// login token to every request once the user is logged in.

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://blaisetech-platform-production.up.railway.app/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
