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
    { status: 'placed', label: 'Order Placed', description: 'Your order has been received' },
    { status: 'preparing', label: 'Preparing', description: 'Kitchen is cooking your food' },
    { status: 'ready', label: 'Ready to Serve', description: 'Your order is ready!' },
    { status: 'delivered', label: 'Delivered', description: 'Enjoy your meal!' }
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

  // In your OrderStatus component, add this useEffect for reconnection
useEffect(() => {
  if (!isConnected && socket) {
    // Try to reconnect if disconnected
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

    // Listen for order status updates
    socket.on('orderStatusUpdated', (updatedOrder) => {
      console.log('Order status updated:', updatedOrder);
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
      }
    });

    // Listen for payment status updates
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
      preparing: 'bg-yellow-500',
      ready: 'bg-green-500',
      delivered: 'bg-green-700',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!order) return <div className="text-center py-8">Order not found</div>;

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Status</h2>
          <p className="text-gray-600">Order # {order._id.slice(-8).toUpperCase()}</p>
          <div className="mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-white ${getStatusColor(order.status)}`}>
              {order.status.toUpperCase()}
            </span>
          </div>
          {order.paymentStatus && (
            <div className="mt-1">
              <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-700 text-sm">
                Payment: {order.paymentStatus}
              </span>
            </div>
          )}
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            🔄 Real-time updates disconnected. Page will update automatically when connected.
          </div>
        )}

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -translate-y-1/2"></div>
            <div 
              className="absolute left-0 top-1/2 h-1 bg-primary-600 -translate-y-1/2 transition-all duration-300"
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            ></div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.status} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    index <= currentStepIndex ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < currentStepIndex ? '✓' : index + 1}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-800">{step.label}</p>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Order Details</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Table Number</p>
              <p className="font-medium">#{order.tableId?.tableNumber || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Time</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-medium">₹{(order.totalAmount * 1.18).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className="font-medium capitalize">{order.paymentStatus || 'pending'}</p>
            </div>
          </div>

          {/* Order Items */}
          <h4 className="font-semibold mb-3">Items Ordered</h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{item.menuItemId?.name || 'Item'}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  {item.specialInstructions && (
                    <p className="text-sm text-gray-500">Note: {item.specialInstructions}</p>
                  )}
                </div>
                <p className="font-medium">₹{((item.price || 0) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={loadOrder}
            disabled={loading}
            className="btn-secondary flex-1 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Status'}
          </button>
          {order.paymentStatus === 'pending' && (
            <button
              onClick={() => window.location.href = `/payment?orderId=${order._id}`}
              className="btn-primary flex-1"
            >
              Proceed to Payment
            </button>
          )}
        </div>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold mb-2">Debug Information:</h4>
            <p>Socket Connected: {isConnected ? 'Yes' : 'No'}</p>
            <p>Order ID: {orderId}</p>
            <p>Current Status: {order.status}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;