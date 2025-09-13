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
                  <h2 className="text-3xl font-bold text-amber-900">Menu Management</h2>
                  <p className="text-amber-700 mt-1">Manage restaurant menu items</p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Item
                </button>
              </div>
            </div>
          </div>

          {/* Menu Item Form */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-amber-900">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <button
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
                    <label className="block text-sm font-medium text-amber-700 mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-300"
                      placeholder="Item name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">Price (₹)</label>
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
                      className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-300"
                    rows="3"
                    placeholder="Item description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-300"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">Preparation Time (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-amber-50 rounded-xl">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isVegetarian}
                      onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                      className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                    />
                    <span className="ml-2 text-sm text-amber-700">Vegetarian</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isVegan}
                      onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                      className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                    />
                    <span className="ml-2 text-sm text-amber-700">Vegan</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hasNuts}
                      onChange={(e) => setFormData({ ...formData, hasNuts: e.target.checked })}
                      className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                    />
                    <span className="ml-2 text-sm text-amber-700">Contains Nuts</span>
                  </label>
                </div>

                <label className="flex items-center p-4 bg-amber-50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                    className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm text-amber-700">Available for ordering</span>
                </label>

                <div className="flex space-x-4">
                  <button 
                    type="submit" 
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300 shadow-md hover:shadow-lg"
                  >
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
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-6 py-3 rounded-xl font-medium transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Menu Items List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-amber-900">Menu Items</h3>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                {menuItems.length} items
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-900">Category</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-amber-900">Price</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-amber-900">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-amber-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {menuItems.map((item) => (
                    <tr key={item._id} className="hover:bg-amber-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-amber-900">{item.name}</p>
                          <p className="text-sm text-amber-600 mt-1">{item.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.isVegetarian && (
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Vegetarian
                              </span>
                            )}
                            {item.isVegan && (
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Vegan
                              </span>
                            )}
                            {item.hasNuts && (
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                Contains Nuts
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-amber-700">{item.category}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-amber-900">₹{item.price?.toFixed(2) || '0.00'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          item.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-amber-600 hover:text-amber-800 transition-colors duration-300"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleAvailability(item)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                            title={item.availability ? 'Disable' : 'Enable'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {item.availability ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              )}
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-300"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default MenuManagement;