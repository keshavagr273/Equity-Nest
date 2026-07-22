import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
  withCredentials: true, // Sends HttpOnly cookies automatically with every request
  timeout: 10000,
});

// H-1 FIX: Removed the request interceptor that read a JWT from localStorage
// and injected it as an Authorization header. Doing so defeated the purpose of
// HttpOnly cookies (which are XSS-inaccessible). The server sets the token via
// HttpOnly cookie; withCredentials: true above ensures it is sent automatically.

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // H-1 FIX: Removed localStorage.removeItem('jwt') — we no longer use localStorage.
      const currentPath = window.location.pathname;
      const isAuthPage =
        currentPath === '/signin' ||
        currentPath === '/signup' ||
        currentPath === '/oauth';
      const isValidateReq = error.config?.url?.includes('/validate');

      if (!isAuthPage && !isValidateReq) {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
