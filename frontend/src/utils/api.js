import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

// Add a request interceptor to add the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if 401 occurs on protected data endpoints, NEVER on auth requests (login/register/reset)
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/');
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');

    if (error.response && error.response.status === 401 && !isAuthEndpoint && !isAuthPage) {
      // Token expired or invalid on a protected route
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
