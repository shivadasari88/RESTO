import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { orderService } from '../../services/orderService';
import StaffLayout from '../../components/staff/StaffLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const KitchenDashboard = () => {
  const { socket, isConnected } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    loadOrders();
    setupSocketListeners();

    return () => {
      if (socket) {
        socket.off('newOrder');
        socket.off('orderStatusUpdated');
      }
    };
  }, [socket]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders();
      // Filter for kitchen-relevant orders (placed and preparing)
      const kitchenOrders = response.data.filter(order => 
        ['placed', 'preparing'].includes(order.status)
      );
      setOrders(kitchenOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    socket.on('newOrder', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
    });
  };

const updateOrderStatus = async (orderId, status) => {
  try {
    setUpdatingOrder(orderId);
    console.log('Updating order:', orderId, 'to status:', status);
    
    const response = await orderService.updateOrderStatus(orderId, status);
    console.log('Update successful:', response);
    
    // Update local state immediately for better UX
    setOrders(prev => prev.map(order => 
      order._id === orderId 
        ? { ...order, status, 
            ...(status === 'preparing' && { preparedAt: new Date() }),
            ...(status === 'ready' && { readyAt: new Date() })
          }
        : order
    ));
    
  } catch (error) {
    console.error('Failed to update order status:', error);
    alert(`Failed to update order status: ${error.response?.data?.error || error.message}`);
  } finally {
    setUpdatingOrder(null);
  }
};

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
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
    <StaffLayout role="kitchen">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kitchen Dashboard</h2>
        <p className="text-gray-600">
          {isConnected ? '✅ Connected to real-time updates' : '❌ Disconnected'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            New Orders ({getOrdersByStatus('placed').length})
          </h3>
          
          {getOrdersByStatus('placed').length === 0 ? (
            <p className="text-gray-500 text-center py-8">No new orders</p>
          ) : (
            <div className="space-y-4">
              {getOrdersByStatus('placed').map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">Order #{order._id.slice(-8).toUpperCase()}</h4>
                      <p className="text-sm text-gray-600">Table #{order.tableId?.tableNumber}</p>
                      <p className="text-xs text-gray-500">{getTimeSince(order.createdAt)}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      ₹{(order.totalAmount * 1.18).toFixed(2)}
                    </span>
                  </div>

                 // In the order display section, add special instructions:
<div className="mb-3">
  <h5 className="text-sm font-medium mb-2">Items:</h5>
  <ul className="text-sm space-y-1">
    {order.items.slice(0, 3).map((item, index) => (
      <li key={index}>
        {item.quantity}x {item.menuItemId?.name}
        {item.specialInstructions && (
          <span className="text-xs text-orange-600 block ml-4">
            📝 {item.specialInstructions}
          </span>
        )}
      </li>
    ))}
    {order.items.length > 3 && (
      <li className="text-xs text-gray-500">
        +{order.items.length - 3} more items
      </li>
    )}
  </ul>
</div>

{order.preparationNote && (
  <div className="mb-3 p-2 bg-yellow-100 rounded">
    <p className="text-xs text-yellow-800">
      <strong>Order Note:</strong> {order.preparationNote}
    </p>
  </div>
)}
                  <button
                    onClick={() => updateOrderStatus(order._id, 'preparing')}
                    disabled={updatingOrder === order._id}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updatingOrder === order._id ? 'Updating...' : 'Start Preparing'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders in Preparation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            In Preparation ({getOrdersByStatus('preparing').length})
          </h3>
          
          {getOrdersByStatus('preparing').length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders in preparation</p>
          ) : (
            <div className="space-y-4">
              {getOrdersByStatus('preparing').map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">Order #{order._id.slice(-8).toUpperCase()}</h4>
                      <p className="text-sm text-gray-600">Table #{order.tableId?.tableNumber}</p>
                      <p className="text-xs text-gray-500">
                        Started: {getTimeSince(order.preparedAt || order.createdAt)}
                      </p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      ₹{(order.totalAmount * 1.18).toFixed(2)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h5 className="text-sm font-medium mb-2">Items:</h5>
                    <ul className="text-sm space-y-1">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.quantity}x {item.menuItemId?.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => updateOrderStatus(order._id, 'ready')}
                    disabled={updatingOrder === order._id}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {updatingOrder === order._id ? 'Updating...' : 'Mark as Ready'}
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

export default KitchenDashboard;