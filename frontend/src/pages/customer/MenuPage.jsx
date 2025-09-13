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
      className="fixed bottom-6 right-6 bg-amber-600 text-white p-4 rounded-full shadow-lg hover:bg-amber-700 transition-colors z-50 flex items-center justify-center w-16 h-16"
    >
      <span className="text-lg">🛒</span>
      <span className="absolute -top-1 -right-1 bg-white text-amber-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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

  // Chef's specials - you might want to fetch this from your API or mark certain items as special
  const specialItems = menuItems.filter(item => item.isSpecial).slice(0, 2);

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
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full mr-4 transition-colors"
          >
            Retry Loading Menu
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Menu Section */}
      <section className="menu py-12">
        <div className="container mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2">Our Menu</h2>
            <p className="text-amber-700">Table #{tableId}</p>
          </div>

          {/* Category Filter */}
          <div className="menu-filters flex flex-wrap justify-center gap-3 mb-10">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => filterByCategory(category)}
                className={`px-4 py-2 rounded-full capitalize transition-all ${
                  selectedCategory === category
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white text-amber-800 hover:bg-amber-100 shadow-sm'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>

          {/* Chef's Specials (if any) */}
          {specialItems.length > 0 && (
            <div className="mb-12">
              <div className="specials-badge mb-6 text-center">
                <span className="inline-block bg-amber-100 text-amber-900 font-semibold text-lg px-6 py-2 rounded-full">
                  <span className="mr-2">⭐</span> Chef's Specials
                </span>
              </div>
              
              <div className="specials-container grid grid-cols-1 md:grid-cols-2 gap-6">
                {specialItems.map(item => (
                  <div key={item._id} className="special-item bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="menu-item-img relative overflow-hidden">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-60 object-cover transition-transform duration-500 hover:scale-105"
                        />
                      )}
                      <div className="menu-item-badges absolute top-3 left-3 flex gap-2">
                        <span className="badge-special bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Special
                        </span>
                        {item.isVegetarian && (
                          <span className="badge-vegan bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Vegetarian
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="menu-item-content p-6">
                      <h4 className="text-xl font-bold text-amber-900 mb-3">{item.name}</h4>
                      <p className="text-amber-700 mb-4">{item.description}</p>
                      <div className="menu-item-price text-amber-600 font-bold text-xl">
                        ₹{item.price}
                      </div>
                      <button
                        onClick={() => addItem(item)}
                        disabled={!item.availability}
                        className={`mt-4 w-full py-2 rounded-lg font-semibold transition-colors ${
                          item.availability
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {item.availability ? 'Add to Cart' : 'Not Available'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Menu Items */}
          <div className="menu-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item._id} className="menu-item bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex gap-4">
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="menu-img w-24 h-24 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                  />
                )}
                <div className="menu-content flex-1">
                  <h5 className="text-lg font-semibold text-amber-900 mb-1 flex items-center flex-wrap gap-2">
                    {item.name}
                    {item.isVegetarian && (
                      <span className="menu-tag bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Vegetarian
                      </span>
                    )}
                    {item.hasNuts && (
                      <span className="menu-tag bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                        Contains Nuts
                      </span>
                    )}
                  </h5>
                  <p className="text-amber-700 text-sm mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="price text-amber-600 font-bold text-lg">
                      ₹{item.price}
                    </span>
                    <button
                      onClick={() => addItem(item)}
                      disabled={!item.availability}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        item.availability
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {item.availability ? 'Add to Cart' : 'Not Available'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-amber-700 text-lg">No items found in this category</p>
            </div>
          )}

          {/* Download Menu Button */}
          <div className="text-center mt-10">
            <a 
              href="#" 
              className="download-menu inline-flex items-center bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300"
            >
              <span className="mr-2">📄</span> Download Full Menu
            </a>
          </div>
        </div>
      </section>

      <CartFloatingButton />
    </div>
  );
};

export default MenuPage;