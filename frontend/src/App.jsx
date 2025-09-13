import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Customer Pages
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import OrderStatus from './pages/customer/OrderStatus';
import PaymentPage from './pages/customer/PaymentPage';

// Staff Pages
import StaffLogin from './pages/staff/StaffLogin';
import KitchenDashboard from './pages/staff/KitchenDashboard';
import RunnerDashboard from './pages/staff/RunnerDashboard';

import AdminDashboard from './pages/admin/AdminDashboard';
import TableManagement from './pages/admin/Tablemanagement';
import MenuManagement from './pages/admin/MenuManagement';
import './App.css';

import { NotificationProvider } from './contexts/NotificationContext';
import ToastNotification from './components/common/ToastNotification';

function App() {
  return (
    <Router>
      <CartProvider>
        <SocketProvider>
          <NotificationProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Only show header/footer for customer pages */}
            <Routes>
              <Route path="/staff/*" element={null} />
              <Route path="*" element={<Header />} />
            </Routes>
            
            <main className="flex-grow">
              <Routes>
                {/* Customer Routes */}
                <Route path="/menu/:tableId" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/order-status/:orderId" element={<OrderStatus />} />
                <Route path="/payment" element={<PaymentPage />} />
                
                {/* Staff Routes */}
                <Route path="/staff/login" element={<StaffLogin />} />
                <Route path="/staff/kitchen" element={
                  <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
                    <KitchenDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/staff/runner" element={
                  <ProtectedRoute allowedRoles={['runner', 'admin']}>
                    <RunnerDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Default route */}
                <Route path="/" element={
  <div className="min-h-screen bg-amber-50 flex flex-col">
    {/* Main Content */}
    <main className="flex-grow flex items-center justify-center py-12">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
            Welcome to Delicious Bites
          </h1>
          <p className="text-xl text-amber-700 mb-6">
            Experience the future of dining with our digital menu system
          </p>
          <div className="w-24 h-1 bg-amber-600 mx-auto mb-8"></div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-100 p-4 rounded-full">
              <span className="text-3xl text-amber-600">📱</span>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-amber-900 mb-4">
            How to Order
          </h2>
          <ol className="text-left max-w-md mx-auto space-y-3 text-amber-700">
            <li className="flex items-start">
              <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">1</span>
              <span>Scan the QR code on your table with your phone's camera</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2</span>
              <span>Browse our digital menu and select your items</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3</span>
              <span>Place your order and pay securely online</span>
            </li>
            <li className="flex items-start">
              <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">4</span>
              <span>Relax while we prepare your delicious meal</span>
            </li>
          </ol>
        </div>

        {/* Staff Access Section */}
        <div>
          <h2 className="text-2xl font-semibold text-amber-900 mb-6">Staff Access</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/staff/login" 
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Kitchen Dashboard
            </a>
            <a 
              href="/staff/login" 
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-8 py-3 rounded-full font-semibold transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Staff Login
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-amber-600 text-2xl mb-4">⚡</div>
            <h3 className="font-semibold text-amber-900 mb-2">Fast Ordering</h3>
            <p className="text-amber-700 text-sm">No waiting for servers - order at your own pace</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-amber-600 text-2xl mb-4">📸</div>
            <h3 className="font-semibold text-amber-900 mb-2">Visual Menu</h3>
            <p className="text-amber-700 text-sm">See photos of every dish before you order</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-amber-600 text-2xl mb-4">💳</div>
            <h3 className="font-semibold text-amber-900 mb-2">Easy Payment</h3>
            <p className="text-amber-700 text-sm">Pay securely with multiple payment options</p>
          </div>
        </div>
      </div>
    </main>

    {/* Decorative Elements */}
    <div className="absolute top-0 left-0 w-32 h-32 bg-amber-200 rounded-full -translate-x-16 -translate-y-16 opacity-50"></div>
    <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-200 rounded-full translate-x-24 translate-y-24 opacity-50"></div>
  </div>
} />
                <Route path="/admin/menu" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <MenuManagement />
  </ProtectedRoute>
} />
              </Routes>
            </main>

            {/* Only show footer for customer pages */}
            <Routes>
              <Route path="/staff/*" element={null} />
              <Route path="*" element={<Footer />} />
                          <Route path="/admin/dashboard" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
<Route path="/admin/tables" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <TableManagement />
  </ProtectedRoute>
} />
            </Routes>
          </div>
          <ToastNotification />
      </NotificationProvider>
        </SocketProvider>
      </CartProvider>
    </Router>
  );
}

export default App;