import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
});

// Request interceptor — attach nothing extra, just pass through
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Only force-redirect to /login when ALL of these are true:
    //  1. It's a 401
    //  2. It is NOT the silent getMe() session-restore call (we handle that in the slice)
    //  3. The user is currently on a protected/dashboard route (not a public page)
    const isGetMeCall = requestUrl.includes('/auth/me');
    const isOnProtectedRoute = window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/cashier') ||
      window.location.pathname.startsWith('/waiter') ||
      window.location.pathname.startsWith('/delivery') ||
      window.location.pathname.startsWith('/customer');

    if (status === 401 && !isGetMeCall && isOnProtectedRoute) {
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;