import api from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      console.log('Sending login request:', credentials);
      const response = await api.post('/api/auth/login', credentials);
      console.log('Login response:', response.data);
      return response;
    } catch (error) {
      console.error('Login API error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Register API error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response;
    } catch (error) {
      console.error('Get user API error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get user role
  getUserRole: () => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        return user.role;
      }
    } catch (error) {
      console.error('Error getting user role:', error);
    }
    return null;
  }
};