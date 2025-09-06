import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Customer Pages
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import OrderStatus from './pages/customer/OrderStatus';
import PaymentPage from './pages/customer/PaymentPage';

function App() {
  return (
    <Router>
      <CartProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>

                {/* Customer Routes */}
                <Route path="/menu/:tableId" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/order-status/:orderId" element={<OrderStatus />} />
                <Route path="/payment" element={<PaymentPage />} />
                



                {/* Default route */}
                <Route path="/" element={
                  <div className="container mx-auto px-4 py-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                      Welcome to QR Restaurant
                    </h1>
                    <p className="text-gray-600">
                      Scan the QR code on your table to view the menu and order
                    </p>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </SocketProvider>
      </CartProvider>
    </Router>
  );
}

export default App;