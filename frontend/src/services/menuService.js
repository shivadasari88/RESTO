import api from './api';


export const menuService = {
   getMenuItems: async (params = {}) => {
    try {
      console.log('Fetching menu from backend...');
      const response = await api.get('/api/menu', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch menu from backend:', error);
      throw error; // Don't use mock data for now
    }
  },

  getMenuItem: async (id) => {
    try {
      const response = await api.get(`/api/menu/${id}`);
      return response.data;
    } catch (error) {
      console.error('Menu item error:', error);
      throw error;
    }
  },
};