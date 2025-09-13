import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CartPage = () => {
  const { items, tableId, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleSubmitOrder = async () => {
    if (!tableId) {
      setError('Please scan a table QR code first');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const orderData = {
        tableId,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        })),
        specialInstructions
      };

      console.log('Submitting order:', orderData);

      const response = await orderService.createOrder(orderData);
      console.log('Order created successfully:', response.data);
      
      clearCart();
      navigate(`/order-status/${response.data._id}`, { 
        state: { order: response.data } 
      });
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          'Failed to place order. Please try again.';
      setError(errorMessage);
      console.error('Order submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-amber-600">🛒</span>
            </div>
            <h2 className="text-2xl font-bold text-amber-900 mb-3">Your Cart is Empty</h2>
            <p className="text-amber-700 mb-6">Scan a table QR code and add some delicious items!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-full font-semibold transition-colors duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2">Your Order</h2>
          <p className="text-amber-700">Table #{tableId}</p>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-amber-900 mb-4 border-b border-amber-100 pb-3">Order Items</h3>
          
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-5 border-b border-amber-100 last:border-b-0">
              <div className="flex items-center gap-4 flex-1">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg shadow-sm"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900">{item.name}</h4>
                  <p className="text-amber-600 font-medium">₹{item.price}</p>
                  {item.specialInstructions && (
                    <p className="text-sm text-amber-500 mt-1">
                      Special: {item.specialInstructions}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-amber-100 rounded-full">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="w-8 h-8 bg-amber-200 hover:bg-amber-300 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium text-amber-900">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="w-8 h-8 bg-amber-200 hover:bg-amber-300 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-2 text-red-500 hover:text-red-700 transition-colors duration-200 p-2"
                  title="Remove item"
                >
                  <span className="text-lg">🗑️</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Special Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-amber-900 mb-4 border-b border-amber-100 pb-3">
            Special Instructions
          </h3>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Any special requests or dietary restrictions? (e.g., no onions, extra spicy, allergies)"
            className="w-full h-24 px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-amber-900 mb-4 border-b border-amber-100 pb-3">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-amber-700">
              <span>Subtotal:</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-amber-700">
              <span>GST (18%):</span>
              <span>₹{(getTotal() * 0.18).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-amber-200 pt-3 font-bold text-lg text-amber-900">
              <span>Total:</span>
              <span>₹{(getTotal() * 1.18).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-800 px-6 py-3 rounded-xl font-semibold transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            ← Back to Menu
          </button>
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="small" />
                <span>Placing Order...</span>
              </>
            ) : (
              <>
                <span>✅</span>
                <span>Place Order (₹{(getTotal() * 1.18).toFixed(2)})</span>
              </>
            )}
          </button>
        </div>

        {/* Order Note */}
        <div className="text-center mt-6">
          <p className="text-amber-600 text-sm">
            Your order will be prepared fresh and served at your table
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;