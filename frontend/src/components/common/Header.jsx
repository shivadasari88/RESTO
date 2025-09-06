import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const { getTotalItems, tableId } = useCart();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">QR Restaurant</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            {tableId && (
              <span className="text-sm text-gray-600 hidden md:block">
                Table #{tableId}
              </span>
            )}
            
            {getTotalItems() > 0 && (
              <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded">
                <span className="text-xl">🛒</span>
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;