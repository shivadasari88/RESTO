import api from './api';

const menuService = {
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

  // Create new menu item
  createMenuItem: async (menuData) => {
    const response = await api.post('/api/menu', menuData);
    return response.data;
  },

  // Update menu item
  updateMenuItem: async (id, menuData) => {
    const response = await api.put(`/api/menu/${id}`, menuData);
    return response.data;
  },

  // Delete menu item
  deleteMenuItem: async (id) => {
    const response = await api.delete(`/api/menu/${id}`);
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

// Use named exports instead of default export
export { menuService };