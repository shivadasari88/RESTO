import React, { useState, useEffect } from 'react';
import { tableService } from '../../services/tableService';
import StaffLayout from '../../components/staff/StaffLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    qrCode: ''
  });

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const response = await tableService.getTables();
      setTables(response.data);
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await tableService.updateTable(editingTable._id, formData);
      } else {
        await tableService.createTable(formData);
      }
      setShowForm(false);
      setEditingTable(null);
      setFormData({ tableNumber: '', capacity: 4, qrCode: '' });
      loadTables();
    } catch (error) {
      console.error('Failed to save table:', error);
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      qrCode: table.qrCode || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    
    try {
      await tableService.deleteTable(id);
      loadTables();
    } catch (error) {
      console.error('Failed to delete table:', error);
    }
  };

  const generateQRCode = (tableId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/menu/${tableId}`;
  };

  if (loading) return (
    <StaffLayout role="admin">
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </StaffLayout>
  );

  return (
    <StaffLayout role="admin">
      <div className="min-h-screen bg-amber-50 py-6">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-amber-900">Table Management</h2>
                  <p className="text-amber-700 mt-1">Manage restaurant tables and QR codes</p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Table
                </button>
              </div>
            </div>
          </div>

          {/* Table Form */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-amber-900">
                  {editingTable ? 'Edit Table' : 'Add New Table'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingTable(null);
                    setFormData({ tableNumber: '', capacity: 4, qrCode: '' });
                  }}
                  className="text-amber-600 hover:text-amber-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">Table Number</label>
                    <input
                      type="text"
                      required
                      value={formData.tableNumber}
                      onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-300"
                      placeholder="e.g., T01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      required
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-300"
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button 
                    type="submit" 
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300 shadow-md hover:shadow-lg"
                  >
                    {editingTable ? 'Update Table' : 'Create Table'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingTable(null);
                      setFormData({ tableNumber: '', capacity: 4, qrCode: '' });
                    }}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-6 py-3 rounded-xl font-medium transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tables List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-amber-900">All Tables</h3>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                {tables.length} tables
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => (
                <div key={table._id} className={`border rounded-2xl p-5 transition-all duration-300 hover:shadow-md ${
                  table.isOccupied 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg text-amber-900">Table {table.tableNumber}</h4>
                      <p className="text-sm text-amber-600">Capacity: {table.capacity} people</p>
                      <p className={`text-sm font-medium mt-1 ${
                        table.isOccupied ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {table.isOccupied ? 'Occupied' : 'Available'}
                      </p>
                    </div>
                    <span className={`w-4 h-4 rounded-full ${
                      table.isOccupied ? 'bg-red-500' : 'bg-green-500'
                    }`}></span>
                  </div>
                  
                  <div className="mb-4 p-3 bg-amber-100 rounded-lg">
                    <p className="text-xs text-amber-700 break-all mb-2">
                      QR URL: {generateQRCode(table._id)}
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(generateQRCode(table._id))}
                      className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded transition-colors duration-300 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy URL
                    </button>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(table)}
                      className="text-amber-600 hover:text-amber-800 transition-colors duration-300 flex items-center text-sm"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(table._id)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-300 flex items-center text-sm"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {tables.length === 0 && (
              <div className="text-center py-12 bg-amber-50 rounded-2xl">
                <div className="text-amber-400 text-6xl mb-4">🍽️</div>
                <p className="text-amber-700 text-lg font-medium">No tables found</p>
                <p className="text-amber-500 text-sm mt-1">Add your first table to get started</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-300"
                >
                  Create First Table
                </button>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-amber-900 mb-6">Table Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <div className="text-2xl font-bold text-amber-700">{tables.length}</div>
                <div className="text-sm text-amber-600">Total Tables</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-700">
                  {tables.filter(table => !table.isOccupied).length}
                </div>
                <div className="text-sm text-green-600">Available Tables</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-700">
                  {tables.filter(table => table.isOccupied).length}
                </div>
                <div className="text-sm text-red-600">Occupied Tables</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default TableManagement;