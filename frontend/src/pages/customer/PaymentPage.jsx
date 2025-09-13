/*

import React from 'react';

const PaymentPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment</h2>
        <p className="text-gray-600 mb-6">Payment integration will be implemented soon</p>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          PhonePe payment gateway integration is in progress
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;


*/

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('phonepe');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderPublic(orderId);
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      alert('Payment would be processed here. In a real app, this would redirect to PhonePe.');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2">Complete Your Payment</h2>
            <p className="text-amber-700">
              {order ? `Order #${order._id.slice(-8).toUpperCase()}` : 'Secure payment processing'}
            </p>
          </div>
        </div>

        {order && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-amber-900 mb-4 border-b border-amber-100 pb-3">Order Summary</h3>
            
            <div className="space-y-3 mb-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-amber-900">{item.menuItemId?.name || 'Item'}</p>
                    <p className="text-sm text-amber-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-amber-900">
                    ₹{((item.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-amber-100 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-amber-700">Subtotal:</span>
                <span className="font-medium text-amber-900">₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-amber-700">GST (18%):</span>
                <span className="font-medium text-amber-900">₹{(order.totalAmount * 0.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-amber-100">
                <span className="text-amber-900">Total Amount:</span>
                <span className="text-amber-700">₹{(order.totalAmount * 1.18).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-amber-900 mb-4 border-b border-amber-100 pb-3">Select Payment Method</h3>
          
          <div className="space-y-4">
            <div 
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                paymentMethod === 'phonepe' 
                  ? 'border-amber-600 bg-amber-50' 
                  : 'border-amber-100 hover:border-amber-300'
              }`}
              onClick={() => setPaymentMethod('phonepe')}
            >
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4">
                {paymentMethod === 'phonepe' && (
                  <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                )}
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-4">
                  PP
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">PhonePe</h4>
                  <p className="text-sm text-amber-600">Pay securely with UPI, cards or wallet</p>
                </div>
              </div>
            </div>

            <div 
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                paymentMethod === 'card' 
                  ? 'border-amber-600 bg-amber-50' 
                  : 'border-amber-100 hover:border-amber-300'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4">
                {paymentMethod === 'card' && (
                  <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                )}
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-800 rounded-lg flex items-center justify-center text-white mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">Credit/Debit Card</h4>
                  <p className="text-sm text-amber-600">Pay with your card securely</p>
                </div>
              </div>
            </div>

            <div 
              className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                paymentMethod === 'cash' 
                  ? 'border-amber-600 bg-amber-50' 
                  : 'border-amber-100 hover:border-amber-300'
              }`}
              onClick={() => setPaymentMethod('cash')}
            >
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4">
                {paymentMethod === 'cash' && (
                  <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                )}
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-700 rounded-lg flex items-center justify-center text-white mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">Cash on Delivery</h4>
                  <p className="text-sm text-amber-600">Pay when your order arrives</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-amber-100 border border-amber-300 text-amber-800 px-6 py-4 rounded-2xl mb-6">
          <div className="flex items-start">
            <span className="text-xl mr-3">🔄</span>
            <div>
              <h4 className="font-semibold mb-1">PhonePe Integration</h4>
              <p className="text-sm">Payment gateway integration is in progress. In a real application, this would redirect to PhonePe's secure payment page.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-800 px-6 py-4 rounded-xl font-semibold transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            ← Back to Order
          </button>
          
          <button
            onClick={handlePayment}
            disabled={paymentProcessing}
            className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-6 py-4 rounded-xl font-semibold transition-colors duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center"
          >
            {paymentProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="small" />
                Processing...
              </span>
            ) : (
              `Pay ₹${order ? (order.totalAmount * 1.18).toFixed(2) : '0.00'}`
            )}
          </button>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center bg-amber-50 px-4 py-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm text-amber-700">Secure SSL Encryption • Your data is protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;