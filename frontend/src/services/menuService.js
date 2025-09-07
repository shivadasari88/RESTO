import api from './api';

export const menuService = {
  // Get all menu items with optional filtering
  getMenuItems: async (params = {}) => {
    const response = await api.get('/api/menu', { params });
    return response.data;
  },

  // Get single menu item
  getMenuItem: async (id) => {
    const response = await api.get(`/api/menu/${id}`);
    return response.data;
  },

  // Get menu items by category
  getMenuByCategory: async (category) => {
    const response = await api.get('/api/menu', {
      params: { category }
    });
    return response.data;
  }
};