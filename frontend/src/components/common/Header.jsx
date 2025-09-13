import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const { getTotalItems, tableId } = useCart();

  return (
    <header className="bg-amber-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-white">DELICIOUS BITES</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            {tableId && (
              <span className="text-sm text-amber-100 bg-amber-700 px-3 py-1 rounded-full hidden md:block">
                Table #{tableId}
              </span>
            )}
            
            {getTotalItems() > 0 && (
              <Link 
                to="/cart" 
                className="relative p-2 bg-amber-700 hover:bg-amber-800 rounded-full transition-colors"
              >
                <span className="text-xl">🛒</span>
                <span className="absolute -top-1 -right-1 bg-white text-amber-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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