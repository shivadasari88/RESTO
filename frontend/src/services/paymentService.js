import api from './api';

export const paymentService = {
  // Create payment
  createPayment: async (paymentData) => {
    const response = await api.post('/api/payments/create', paymentData);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (orderId) => {
    const response = await api.get(`/api/payments/status/${orderId}`);
    return response.data;
  },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    const response = await api.get(`/api/payments/${paymentId}`);
    return response.data;
  }
};