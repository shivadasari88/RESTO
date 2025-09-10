
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

  if (loading) return <LoadingSpinner />;

  return (
    <StaffLayout role="admin">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-gray-600">Overview of restaurant operations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Today's Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats.todayOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₹{stats.revenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <span className="text-2xl">🍽️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Tables</p>
              <p className="text-2xl font-bold text-gray-800">{stats.activeTables}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex justify-between items-center p-3 border-b">
                <div>
                  <p className="font-medium">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-600">Table #{order.tableId?.tableNumber}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="font-bold">₹{order.totalAmount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Menu Items</h3>
          <div className="space-y-3">
            {popularItems.map((item, index) => (
              <div key={item._id} className="flex justify-between items-center p-3 border-b">
                <div className="flex items-center">
                  <span className="text-lg mr-3">{index + 1}.</span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.orderCount} orders</p>
                  </div>
                </div>
                <p className="font-bold">₹{item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6">
        <button
          onClick={loadDashboardData}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Refresh Data
        </button>
      </div>
    </StaffLayout>
  );
};

export default AdminDashboard;