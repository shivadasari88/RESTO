import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { orderService } from '../../services/orderService';
import StaffLayout from '../../components/staff/StaffLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RunnerDashboard = () => {
  const { socket, isConnected } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    loadOrders();
    setupSocketListeners();

    return () => {
      if (socket) {
        socket.off('orderStatusUpdated');
      }
    };
  }, [socket]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders();
      // Filter for ready orders only
      const readyOrders = response.data.filter(order => order.status === 'ready');
      setOrders(readyOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on('orderStatusUpdated', (updatedOrder) => {
      if (updatedOrder.status === 'ready') {
        // Add new ready order
        setOrders(prev => [updatedOrder, ...prev.filter(o => o._id !== updatedOrder._id)]);
      } else if (updatedOrder.status === 'delivered') {
        // Remove delivered orders
        setOrders(prev => prev.filter(order => order._id !== updatedOrder._id));
      }
    });
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrder(orderId);
      await orderService.updateOrderStatus(orderId, status);
      // Socket will handle the real-time update
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getTimeSince = (date) => {
    const now = new Date();
    const orderTime = new Date(date);
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <StaffLayout role="runner">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Runner Dashboard</h2>
        <p className="text-gray-600">
          {isConnected ? '✅ Connected to real-time updates' : '❌ Disconnected'}
        </p>
        <p className="text-sm text-gray-500">
          Ready orders: {orders.length}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Ready Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Ready for Delivery ({orders.length})
          </h3>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-gray-500 text-lg">No orders ready for delivery</p>
              <p className="text-gray-400 text-sm">Orders will appear here when kitchen marks them as ready</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <div key={order._id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-green-800">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h4>
                      <p className="text-sm text-green-600">Table #{order.tableId?.tableNumber}</p>
                      <p className="text-xs text-green-500">
                        Ready: {getTimeSince(order.readyAt || order.createdAt)}
                      </p>
                    </div>
                    <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded">
                      ₹{(order.totalAmount * 1.18).toFixed(2)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-2 text-green-700">Items to Deliver:</h5>
                    <ul className="text-sm space-y-1">
                      {order.items.map((item, index) => (
                        <li key={index} className="text-green-600">
                          {item.quantity}x {item.menuItemId?.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.preparationNote && (
                    <div className="mb-3 p-2 bg-yellow-100 rounded">
                      <p className="text-xs text-yellow-800">
                        <strong>Note:</strong> {order.preparationNote}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                    disabled={updatingOrder === order._id}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {updatingOrder === order._id ? 'Updating...' : 'Mark as Delivered'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6">
        <button
          onClick={loadOrders}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Refresh Orders
        </button>
      </div>
    </StaffLayout>
  );
};

export default RunnerDashboard;