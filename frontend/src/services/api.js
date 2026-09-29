import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('agri_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('agri_token');
      localStorage.removeItem('agri_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
