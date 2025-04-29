import axios from 'axios';

const API_BASE_URL = 'https://laudofy-backend-production-5b0a.up.railway.app/api';

// CSRF Service
const csrfService = {
  getToken: () => localStorage.getItem('csrfToken'),

  refreshToken: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/csrf-token`);
  
      const token = response.data.csrfToken;
      localStorage.setItem('csrfToken', token); // salva para reutilizar
  
      return token;
    } catch (error) {
      console.error('CSRF token refresh failed:', error);
      throw error;
    }
  }
  
};

// Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
api.interceptors.request.use(async (config) => {
  // Skip CSRF for these endpoints
  const excludedEndpoints = [
    '/csrf-token',
    '/auth/login',
    '/auth/refresh-token',
    '/auth/logout'
  ];

  if (excludedEndpoints.some(ep => config.url.includes(ep))) {
    return config;
  }

  // Add CSRF token for modifying requests
  if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
    try {
      let token = csrfService.getToken();
      if (!token) token = await csrfService.refreshToken();

      config.headers['X-CSRF-Token'] = token;
    } catch (error) {
      console.error('Failed to attach CSRF token:', error);
      throw error;
    }
  }

  return config;
});

// Response Interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    // Handle CSRF token errors
    if (error.response?.status === 403 && 
        error.response.data?.error === 'Invalid CSRF token') {
      try {
        const newToken = await csrfService.refreshToken();
        error.config.headers['X-CSRF-Token'] = newToken;
        return api.request(error.config);
      } catch (refreshError) {
        console.error('Failed to refresh CSRF token:', refreshError);
        window.location.href = '/login?error=session_expired';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const initializeCSRF = async () => {
  try {
    await csrfService.refreshToken();
  } catch (error) {
    console.error('CSRF initialization failed:', error);
    throw error;
  }
};

export default api;