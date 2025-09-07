import api from './api';

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },

  // Get order by ID
  getOrder: async (id) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  // Get order by ID (public access)
  getOrderPublic: async (id) => {
    const response = await api.get(`/api/orders/public/${id}`);
    return response.data;
  },

  // Get orders by table
  getOrdersByTable: async (tableId) => {
    const response = await api.get(`/api/orders/table/${tableId}`);
    return response.data;
  },

  // Get all orders (for staff)
  getOrders: async () => {
    const response = await api.get('/api/orders');
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/api/orders/${id}/status`, { status });
    return response.data;
  }
};