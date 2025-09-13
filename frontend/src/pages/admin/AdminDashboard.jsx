import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { menuService } from '../../services/menuService';
import { tableService } from '../../services/tableService';
import StaffLayout from '../../components/staff/StaffLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    revenue: 0,
    activeTables: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load orders for stats
      const ordersResponse = await orderService.getOrders();
      const allOrders = ordersResponse.data;
      
      // Load menu items for popularity
      const menuResponse = await menuService.getMenuItems();
      
      // Load tables for status
      const tablesResponse = await tableService.getTables();
      
      // Calculate statistics
      const today = new Date().toDateString();
      const todayOrders = allOrders.filter(order => 
        new Date(order.createdAt).toDateString() === today
      );
      
      const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const activeTables = tablesResponse.data.filter(table => table.isOccupied).length;
      
      // Calculate popular items
      const itemCounts = {};
      allOrders.forEach(order => {
        order.items.forEach(item => {
          const itemId = item.menuItemId?._id || item.menuItemId;
          if (itemId) {
            itemCounts[itemId] = (itemCounts[itemId] || 0) + item.quantity;
          }
        });
      });
      
      const popular = menuResponse.data
        .map(item => ({
          ...item,
          orderCount: itemCounts[item._id] || 0
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5);

      setStats({
        totalOrders: allOrders.length,
        todayOrders: todayOrders.length,
        revenue: totalRevenue,
        activeTables: activeTables
      });
      
      setRecentOrders(allOrders.slice(0, 10));
      setPopularItems(popular);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <StaffLayout role="admin">
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </StaffLayout>
  );

  return (
    <StaffLayout role="admin">
      <div className="min-h-screen bg-amber-50 py-6">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-3xl font-bold text-amber-900">Admin Dashboard</h2>
              <p className="text-amber-700 mt-1">Overview of restaurant operations</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Orders Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-amber-600">Total Orders</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            {/* Today's Orders Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-amber-600">Today's Orders</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.todayOrders}</p>
                </div>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-amber-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-amber-900">₹{stats.revenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Active Tables Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-amber-600">Active Tables</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.activeTables}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-amber-900">Recent Orders</h3>
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  {recentOrders.length} orders
                </span>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div>
                      <p className="font-semibold text-amber-900">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-sm text-amber-600">Table #{order.tableId?.tableNumber || 'N/A'}</p>
                      <span className={`text-xs px-2 py-1 rounded-full mt-1 ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'preparing' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="font-bold text-amber-900 text-lg">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-amber-900">Popular Menu Items</h3>
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  Top {popularItems.length}
                </span>
              </div>
              <div className="space-y-4">
                {popularItems.map((item, index) => (
                  <div key={item._id} className="flex justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-amber-700 mr-3">{index + 1}.</span>
                      <div>
                        <p className="font-semibold text-amber-900">{item.name}</p>
                        <p className="text-sm text-amber-600">{item.orderCount} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-900">₹{item.price.toFixed(2)}</p>
                      <div className="w-20 bg-amber-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-amber-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((item.orderCount / Math.max(1, popularItems[0]?.orderCount)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-amber-900 mb-6">Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <div className="text-2xl font-bold text-amber-700">₹{(stats.revenue / Math.max(1, stats.totalOrders)).toFixed(2)}</div>
                <div className="text-sm text-amber-600">Average Order Value</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-700">{stats.activeTables}</div>
                <div className="text-sm text-green-600">Current Occupancy</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-700">{stats.todayOrders}</div>
                <div className="text-sm text-blue-600">Today's Covers</div>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mt-8 text-center">
            <button
              onClick={loadDashboardData}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-300 shadow-md hover:shadow-lg flex items-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default AdminDashboard;