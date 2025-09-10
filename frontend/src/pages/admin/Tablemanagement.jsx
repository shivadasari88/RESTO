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

  if (loading) return <LoadingSpinner />;

  return (
    <StaffLayout role="admin">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Table Management</h2>
          <p className="text-gray-600">Manage restaurant tables and QR codes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Add New Table
        </button>
      </div>

      {/* Table Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingTable ? 'Edit Table' : 'Add New Table'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Table Number</label>
              <input
                type="text"
                required
                value={formData.tableNumber}
                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                className="input-field"
                placeholder="e.g., T01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                {editingTable ? 'Update Table' : 'Create Table'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTable(null);
                  setFormData({ tableNumber: '', capacity: 4, qrCode: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tables List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Tables</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <div key={table._id} className={`border rounded-lg p-4 ${
              table.isOccupied ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-lg">Table {table.tableNumber}</h4>
                  <p className="text-sm text-gray-600">Capacity: {table.capacity} people</p>
                  <p className={`text-sm ${
                    table.isOccupied ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {table.isOccupied ? 'Occupied' : 'Available'}
                  </p>
                </div>
                <span className={`w-3 h-3 rounded-full ${
                  table.isOccupied ? 'bg-red-500' : 'bg-green-500'
                }`}></span>
              </div>
              
              <div className="mb-3">
                <p className="text-xs text-gray-500 break-all">
                  QR URL: {generateQRCode(table._id)}
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(table)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(table._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(generateQRCode(table._id))}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Copy URL
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
};

export default TableManagement;