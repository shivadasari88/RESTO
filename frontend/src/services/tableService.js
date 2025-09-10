import api from './api';

export const tableService = {
  // Get all tables
  getTables: async () => {
    const response = await api.get('/api/tables');
    return response.data;
  },

  // Create new table
  createTable: async (tableData) => {
    const response = await api.post('/api/tables', tableData);
    return response.data;
  },

  // Update table
  updateTable: async (id, tableData) => {
    const response = await api.put(`/api/tables/${id}`, tableData);
    return response.data;
  },

  // Delete table
  deleteTable: async (id) => {
    const response = await api.delete(`/api/tables/${id}`);
    return response.data;
  },

  // Get available tables
  getAvailableTables: async () => {
    const response = await api.get('/api/tables/available');
    return response.data;
  }
};