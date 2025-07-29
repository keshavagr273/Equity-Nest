import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Axios Request:', config.method?.toUpperCase(), config.url);
    console.log('🚀 Axios Base URL:', config.baseURL);
    console.log('🚀 Axios With Credentials:', config.withCredentials);
    
    // Add JWT token from localStorage to Authorization header
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('🚀 Axios: Added Authorization header with token');
    } else {
      console.log('🚀 Axios: No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('🚀 Axios Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('🚀 Axios Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('🚀 Axios Response Error:', error.response?.status, error.response?.data);
    console.error('🚀 Axios Error Config:', error.config?.url);
    
    // Handle 401 errors by clearing token and redirecting to login
    if (error.response?.status === 401) {
      console.log('🚀 Axios: 401 error, clearing token and redirecting to login');
      localStorage.removeItem('jwt');
      window.location.href = '/signin';
    }
    
    return Promise.reject(error);
  }
);

export default api;
