// /frontend/src/services/orderService.js
import api from './api';

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    console.log('Creating order with data:', orderData);
    try {
      const response = await api.post('/api/orders', orderData);
      console.log('Order creation successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Order creation failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get order by ID
  getOrder: async (id) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

getOrderPublic: async (id) => {
    const response = await api.get(`/api/orders/public/${id}`);
    return response.data;
  },

  // Get orders by table
  getOrdersByTable: async (tableId) => {
    const response = await api.get(`/api/orders/table/${tableId}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/api/orders/${id}/status`, { status });
    return response.data;
  }
};