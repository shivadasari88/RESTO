import React, { useState, useEffect } from 'react';
import { menuService } from '../../services/menuService';
import StaffLayout from '../../components/staff/StaffLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'main',
    isVegetarian: false,
    isVegan: false,
    hasNuts: false,
    availability: true,
    preparationTime: 15
  });

  const categories = [
    { value: 'starter', label: 'Starter' },
    { value: 'main', label: 'Main Course' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'drink', label: 'Drink' },
    { value: 'side', label: 'Side Dish' }
  ];

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menuService.getMenuItems();
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await menuService.updateMenuItem(editingItem._id, formData);
      } else {
        await menuService.createMenuItem(formData);
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'main',
        isVegetarian: false,
        isVegan: false,
        hasNuts: false,
        availability: true,
        preparationTime: 15
      });
      loadMenuItems();
    } catch (error) {
      console.error('Failed to save menu item:', error);
      alert('Failed to save menu item: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price || 0,
      category: item.category,
      isVegetarian: item.isVegetarian || false,
      isVegan: item.isVegan || false,
      hasNuts: item.hasNuts || false,
      availability: item.availability !== false,
      preparationTime: item.preparationTime || 15
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      await menuService.deleteMenuItem(id);
      loadMenuItems();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      alert('Failed to delete menu item: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await menuService.updateMenuItem(item._id, {
        availability: !item.availability
      });
      loadMenuItems();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      alert('Failed to update availability: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <StaffLayout role="admin">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Menu Management</h2>
          <p className="text-gray-600">Manage restaurant menu items</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Add New Item
        </button>
      </div>

      {/* Menu Item Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    price: e.target.value === '' ? 0 : parseFloat(e.target.value) 
                  })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="Item description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preparation Time (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isVegetarian}
                  onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Vegetarian</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isVegan}
                  onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Vegan</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasNuts}
                  onChange={(e) => setFormData({ ...formData, hasNuts: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Contains Nuts</span>
              </label>
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Available for ordering</span>
            </label>

            <div className="flex space-x-4">
              <button type="submit" className="btn-primary">
                {editingItem ? 'Update Item' : 'Create Item'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  setFormData({
                    name: '',
                    description: '',
                    price: 0,
                    category: 'main',
                    isVegetarian: false,
                    isVegan: false,
                    hasNuts: false,
                    availability: true,
                    preparationTime: 15
                  });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Menu Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{item.category}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{item.price?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      item.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleAvailability(item)}
                        className="text-yellow-600 hover:text-yellow-800 text-sm"
                      >
                        {item.availability ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StaffLayout>
  );
};

export default MenuManagement;