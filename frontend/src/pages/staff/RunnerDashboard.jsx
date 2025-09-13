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

  if (loading) return (
    <StaffLayout role="runner">
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </StaffLayout>
  );

  return (
    <StaffLayout role="runner">
      <div className="min-h-screen bg-amber-50 py-6">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-amber-900">Runner Dashboard</h2>
                  <p className="text-amber-700 mt-1">
                    Deliver ready orders to customers
                  </p>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {isConnected ? 'Live updates connected' : 'Connection offline'}
                  </span>
                </div>
              </div>
              <div className="mt-4 bg-amber-100 p-3 rounded-xl">
                <p className="text-amber-800 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ready orders: <span className="font-bold ml-1">{orders.length}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Ready Orders */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-amber-900 flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                Ready for Delivery
              </h3>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {orders.length} orders
              </span>
            </div>
            
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-amber-50 rounded-xl">
                <div className="text-amber-400 text-6xl mb-4">🚀</div>
                <p className="text-amber-700 text-lg font-medium">No orders ready for delivery</p>
                <p className="text-amber-500 text-sm mt-1">Orders will appear here when kitchen marks them as ready</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order) => (
                  <div key={order._id} className="border border-green-200 rounded-xl p-5 bg-green-50 hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-green-900 text-lg">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h4>
                        <div className="flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9" />
                          </svg>
                          <p className="text-sm text-green-700">Table #{order.tableId?.tableNumber || 'N/A'}</p>
                        </div>
                        <p className="text-xs text-green-500 mt-1">
                          Ready: {getTimeSince(order.readyAt || order.createdAt)}
                        </p>
                      </div>
                      <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ₹{(order.totalAmount * 1.18).toFixed(2)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Items to Deliver:
                      </h5>
                      <ul className="text-sm space-y-2">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between">
                            <span className="font-medium text-green-900">
                              {item.quantity}x {item.menuItemId?.name}
                            </span>
                            <span className="text-green-700">
                              ₹{((item.price || 0) * item.quantity).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {order.preparationNote && (
                      <div className="mb-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
                        <p className="text-xs text-amber-800 flex items-start">
                          <span className="font-medium mr-1">Note:</span> 
                          {order.preparationNote}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => updateOrderStatus(order._id, 'delivered')}
                      disabled={updatingOrder === order._id}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {updatingOrder === order._id ? (
                        <>
                          <LoadingSpinner size="small" />
                          <span className="ml-2">Updating...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Mark as Delivered
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <div className="mt-8 text-center">
            <button
              onClick={loadOrders}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300 shadow-md hover:shadow-lg flex items-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Orders
            </button>
          </div>

          {/* Stats Card */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-4">Delivery Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-amber-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-amber-700">{orders.length}</div>
                <div className="text-sm text-amber-600">Pending Delivery</div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-700">0</div>
                <div className="text-sm text-green-600">Delivered Today</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-700">0</div>
                <div className="text-sm text-blue-600">Avg. Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default RunnerDashboard;