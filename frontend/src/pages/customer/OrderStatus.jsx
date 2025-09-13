import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { orderService } from '../../services/orderService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderStatus = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { socket, isConnected } = useSocket();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');

  const statusSteps = [
    { status: 'placed', label: 'Order Placed', description: 'Your order has been received', icon: '📝' },
    { status: 'preparing', label: 'Preparing', description: 'Kitchen is cooking your food', icon: '👨‍🍳' },
    { status: 'ready', label: 'Ready to Serve', description: 'Your order is ready!', icon: '✅' },
    { status: 'delivered', label: 'Delivered', description: 'Enjoy your meal!', icon: '🍽️' }
  ];

  useEffect(() => {
    if (!order) {
      loadOrder();
    }
    setupSocketListeners();

    return () => {
      if (socket) {
        socket.off('orderStatusUpdated');
        socket.off('paymentStatusUpdated');
      }
    };
  }, [orderId, socket]);

  useEffect(() => {
    if (!isConnected && socket) {
      const reconnectTimer = setTimeout(() => {
        socket.connect();
      }, 2000);

      return () => clearTimeout(reconnectTimer);
    }
  }, [isConnected, socket]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderPublic(orderId);
      setOrder(response.data);
    } catch (err) {
      setError('Failed to load order details');
      console.error('Order loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on('orderStatusUpdated', (updatedOrder) => {
      console.log('Order status updated:', updatedOrder);
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
      }
    });

    socket.on('paymentStatusUpdated', (paymentData) => {
      console.log('Payment status updated:', paymentData);
      if (paymentData.orderId === orderId) {
        setOrder(prev => ({
          ...prev,
          paymentStatus: paymentData.status === 'captured' ? 'completed' : 'failed'
        }));
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setError('Connection error. Please refresh the page.');
    });
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex(step => step.status === order.status);
  };

  const getStatusColor = (status) => {
    const colors = {
      placed: 'bg-blue-500',
      preparing: 'bg-amber-500',
      ready: 'bg-green-500',
      delivered: 'bg-green-700',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="min-h-screen bg-amber-50 flex items-center justify-center text-red-600 text-xl">{error}</div>;
  if (!order) return <div className="min-h-screen bg-amber-50 flex items-center justify-center text-amber-900 text-xl">Order not found</div>;

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-amber-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-2">Order Status</h2>
            <p className="text-amber-700 mb-3">Order # {order._id.slice(-8).toUpperCase()}</p>
            
            <div className="flex flex-col items-center gap-2">
              <span className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
              
              {order.paymentStatus && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  order.paymentStatus === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Payment: {order.paymentStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-xl mb-6 flex items-center">
            <span className="text-lg mr-2">🔄</span>
            <span>Real-time updates disconnected. Page will update automatically when connected.</span>
          </div>
        )}

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-amber-900 mb-6 text-center">Order Progress</h3>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-4 right-4 top-1/2 h-2 bg-amber-100 -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute left-4 top-1/2 h-2 bg-amber-600 -translate-y-1/2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 80}%` }}
            ></div>

            {/* Steps */}
            <div className="relative grid grid-cols-4 gap-4">
              {statusSteps.map((step, index) => (
                <div key={step.status} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 border-4 transition-all duration-300 ${
                    index <= currentStepIndex 
                      ? 'border-amber-600 bg-amber-600 text-white shadow-lg' 
                      : 'border-amber-100 bg-white text-amber-400'
                  }`}>
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-semibold ${
                      index <= currentStepIndex ? 'text-amber-900' : 'text-amber-600'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-amber-500 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-amber-900 mb-6 border-b border-amber-100 pb-3">Order Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-amber-50 p-4 rounded-xl">
              <p className="text-sm text-amber-600 font-medium">Table Number</p>
              <p className="font-semibold text-amber-900 text-lg">#{order.tableId?.tableNumber || 'Unknown'}</p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-xl">
              <p className="text-sm text-amber-600 font-medium">Order Time</p>
              <p className="font-semibold text-amber-900 text-lg">
                {new Date(order.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-xl">
              <p className="text-sm text-amber-600 font-medium">Total Amount</p>
              <p className="font-semibold text-amber-900 text-lg">
                ₹{(order.totalAmount * 1.18).toFixed(2)}
              </p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-xl">
              <p className="text-sm text-amber-600 font-medium">Payment Status</p>
              <p className="font-semibold text-amber-900 text-lg capitalize">
                {order.paymentStatus || 'pending'}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <h4 className="font-semibold text-amber-900 mb-4">Items Ordered</h4>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-amber-50 rounded-xl">
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">{item.menuItemId?.name || 'Item'}</p>
                  <p className="text-sm text-amber-600">Quantity: {item.quantity}</p>
                  {item.specialInstructions && (
                    <p className="text-sm text-amber-500 mt-1">Note: {item.specialInstructions}</p>
                  )}
                </div>
                <p className="font-bold text-amber-900 text-lg">
                  ₹{((item.price || 0) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={loadOrder}
            disabled={loading}
            className="flex-1 bg-amber-100 hover:bg-amber-200 disabled:bg-amber-50 text-amber-800 px-6 py-3 rounded-xl font-semibold transition-colors duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="small" />
                Refreshing...
              </span>
            ) : (
              '🔄 Refresh Status'
            )}
          </button>
          
          {order.paymentStatus === 'pending' && (
            <button
              onClick={() => window.location.href = `/payment?orderId=${order._id}`}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              💳 Proceed to Payment
            </button>
          )}
        </div>

        {/* Estimated Time (optional) */}
        {order.status === 'preparing' && (
          <div className="text-center mt-6 p-4 bg-amber-100 rounded-xl">
            <p className="text-amber-800 font-medium">
              ⏱️ Your food will be ready in approximately 15-20 minutes
            </p>
          </div>
        )}

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-amber-100 rounded-xl">
            <h4 className="font-semibold text-amber-900 mb-2">Debug Information:</h4>
            <p className="text-amber-700">Socket Connected: {isConnected ? 'Yes' : 'No'}</p>
            <p className="text-amber-700">Order ID: {orderId}</p>
            <p className="text-amber-700">Current Status: {order.status}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;