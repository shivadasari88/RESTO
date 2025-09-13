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

  if (loading) return (
    <StaffLayout role="kitchen">
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </StaffLayout>
  );

  return (
    <StaffLayout role="kitchen">
      <div className="min-h-screen bg-amber-50 py-6">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-amber-900">Kitchen Dashboard</h2>
                  <p className="text-amber-700 mt-1">
                    Manage and track order preparation
                  </p>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {isConnected ? 'Live updates connected' : 'Connection offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* New Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-amber-900 flex items-center">
                  <span className="w-4 h-4 bg-blue-500 rounded-full mr-3"></span>
                  New Orders
                </h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {getOrdersByStatus('placed').length}
                </span>
              </div>
              
              {getOrdersByStatus('placed').length === 0 ? (
                <div className="text-center py-8 bg-amber-50 rounded-xl">
                  <div className="text-amber-400 text-5xl mb-3">🍳</div>
                  <p className="text-amber-700">No new orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getOrdersByStatus('placed').map((order) => (
                    <div key={order._id} className="border border-amber-200 rounded-xl p-5 bg-amber-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-amber-900 text-lg">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </h4>
                          <div className="flex items-center mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9" />
                            </svg>
                            <p className="text-sm text-amber-700">Table #{order.tableId?.tableNumber || 'N/A'}</p>
                          </div>
                          <p className="text-xs text-amber-500 mt-1">
                            {getTimeSince(order.createdAt)}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          ₹{(order.totalAmount * 1.18).toFixed(2)}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-amber-900 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Items:
                        </h5>
                        <ul className="text-sm space-y-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <div>
                                <span className="font-medium text-amber-900">
                                  {item.quantity}x {item.menuItemId?.name}
                                </span>
                                {item.specialInstructions && (
                                  <p className="text-xs text-amber-600 mt-1 ml-4">
                                    📝 {item.specialInstructions}
                                  </p>
                                )}
                              </div>
                              <span className="text-amber-700">
                                ₹{((item.price || 0) * item.quantity).toFixed(2)}
                              </span>
                            </li>
                          ))}
                          {order.items.length > 3 && (
                            <li className="text-xs text-amber-500">
                              +{order.items.length - 3} more items
                            </li>
                          )}
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
                        onClick={() => updateOrderStatus(order._id, 'preparing')}
                        disabled={updatingOrder === order._id}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {updatingOrder === order._id ? (
                          <>
                            <LoadingSpinner size="small" />
                            <span className="ml-2">Starting...</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Start Preparing
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orders in Preparation */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-amber-900 flex items-center">
                  <span className="w-4 h-4 bg-amber-500 rounded-full mr-3"></span>
                  In Preparation
                </h3>
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  {getOrdersByStatus('preparing').length}
                </span>
              </div>
              
              {getOrdersByStatus('preparing').length === 0 ? (
                <div className="text-center py-8 bg-amber-50 rounded-xl">
                  <div className="text-amber-400 text-5xl mb-3">👨‍🍳</div>
                  <p className="text-amber-700">No orders in preparation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getOrdersByStatus('preparing').map((order) => (
                    <div key={order._id} className="border border-amber-200 rounded-xl p-5 bg-amber-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-amber-900 text-lg">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </h4>
                          <div className="flex items-center mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9" />
                            </svg>
                            <p className="text-sm text-amber-700">Table #{order.tableId?.tableNumber || 'N/A'}</p>
                          </div>
                          <p className="text-xs text-amber-500 mt-1">
                            Started: {getTimeSince(order.preparedAt || order.createdAt)}
                          </p>
                        </div>
                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                          ₹{(order.totalAmount * 1.18).toFixed(2)}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-amber-900 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Items:
                        </h5>
                        <ul className="text-sm space-y-2">
                          {order.items.map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span className="font-medium text-amber-900">
                                {item.quantity}x {item.menuItemId?.name}
                              </span>
                              <span className="text-amber-700">
                                ₹{((item.price || 0) * item.quantity).toFixed(2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => updateOrderStatus(order._id, 'ready')}
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
                            Mark as Ready
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
        </div>
      </div>
    </StaffLayout>
  );
};

export default KitchenDashboard;