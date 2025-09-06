import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { menuService } from '../../services/menuService';
import { useCart } from '../../contexts/CartContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';


const CartFloatingButton = () => {
  const { getTotalItems } = useCart();
  
  if (getTotalItems() === 0) return null;

  return (
    <Link
      to="/cart"
      className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-50"
    >
      <span className="text-lg">🛒</span>
      <span className="absolute -top-1 -right-1 bg-white text-primary-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
        {getTotalItems()}
      </span>
    </Link>
  );
};

const MenuPage = () => {
  const { tableId } = useParams();
  const { addItem, setTable } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Table ID from URL:', tableId);
    if (tableId) {
      setTable(tableId);
      loadMenu();
    } else {
      setError('Invalid table ID');
      setLoading(false);
    }
  }, [tableId]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading menu...');
      
      const response = await menuService.getMenuItems();
      console.log('Menu loaded successfully:', response.data.length, 'items');
      
      setMenuItems(response.data);
      setFilteredItems(response.data);
      
    } catch (err) {
      console.error('Menu loading failed:', err);
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          'Failed to load menu. Please check if the backend server is running.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter(item => item.category === category));
    }
  };

  const categories = ['all', 'starter', 'main', 'dessert', 'drink', 'side'];

  if (loading) return <LoadingSpinner />;
  
if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <h3 className="font-bold text-lg mb-2">Error Loading Menu</h3>
            <p>{error}</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">Troubleshooting Steps:</h4>
            <ul className="text-left text-blue-600 space-y-2">
              <li>• Ensure backend server is running on port 5000</li>
              <li>• Check browser console for detailed errors (F12)</li>
              <li>• Verify database connection in backend</li>
              <li>• Check network tab for API call details</li>
            </ul>
          </div>

          <button
            onClick={loadMenu}
            className="btn-primary mr-4"
          >
            Retry Loading Menu
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Menu</h1>
        <p className="text-gray-600">Table #{tableId}</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => filterByCategory(category)}
            className={`px-4 py-2 rounded-full capitalize ${
              selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item._id} className="card hover:shadow-lg transition-shadow">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-primary-600">
                  ₹{item.price}
                </span>
                {!item.availability && (
                  <span className="text-red-500 text-sm">Out of Stock</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {item.isVegetarian && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    Vegetarian
                  </span>
                )}
                {item.hasNuts && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Contains Nuts
                  </span>
                )}
              </div>

              <button
                onClick={() => addItem(item)}
                disabled={!item.availability}
                className="w-full btn-primary disabled:bg-gray-400"
              >
                {item.availability ? 'Add to Cart' : 'Not Available'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items found in this category</p>
        </div>
      )}
      <CartFloatingButton />

    </div>
  );
};

export default MenuPage;