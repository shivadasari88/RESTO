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
    // FIX: Use the correct variable name - 'orderData' should be the object we're creating
    const orderData = {
      tableId,
      items: items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      })),
      specialInstructions
    };

    console.log('Submitting order:', orderData); // Add this for debugging

    const response = await orderService.createOrder(orderData);
    
    // The response should contain the full order details
    console.log('Order created successfully:', response.data);
    
    // Clear cart on successful order
    clearCart();
    
    // Redirect to order status page
    navigate(`/order-status/${response.data._id}`, {
      state: { order: response.data } // Pass the order data
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Scan a table QR code and add some delicious items!</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Order</h2>
        <p className="text-gray-600 mb-6">Table #{tableId}</p>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Order Items</h3>
          
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
              <div className="flex items-center space-x-4 flex-1">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{item.name}</h4>
                  <p className="text-gray-600">₹{item.price}</p>
                  {item.specialInstructions && (
                    <p className="text-sm text-gray-500">
                      Special: {item.specialInstructions}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Special Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Special Instructions</h3>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Any special requests or dietary restrictions?"
            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>₹{(getTotal() * 0.18).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-lg">
              <span>Total:</span>
              <span>₹{(getTotal() * 1.18).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
          >
            Back to Menu
          </button>
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {isSubmitting ? <LoadingSpinner size="small" /> : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;