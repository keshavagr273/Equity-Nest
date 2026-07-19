import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add JWT token to Authorization header
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors by clearing token and redirecting to login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('jwt');
      
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/signin' || currentPath === '/signup' || currentPath === '/oauth';
      const isValidateReq = error.config?.url?.includes('/validate');
      
      if (!isAuthPage && !isValidateReq) {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
