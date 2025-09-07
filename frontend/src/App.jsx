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

function App() {
  return (
    <Router>
      <CartProvider>
        <SocketProvider>
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
                  <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                      Welcome to QR Restaurant
                    </h1>
                    <p className="text-gray-600">
                      Scan the QR code on your table to view the menu and order
                    </p>
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold mb-4">Staff Access</h2>
                      <div className="flex justify-center space-x-4">
                        <a 
                          href="/staff/login" 
                          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                        >
                          Staff Login
                        </a>
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
            </main>

            {/* Only show footer for customer pages */}
            <Routes>
              <Route path="/staff/*" element={null} />
              <Route path="*" element={<Footer />} />
            </Routes>
          </div>
        </SocketProvider>
      </CartProvider>
    </Router>
  );
}

export default App;