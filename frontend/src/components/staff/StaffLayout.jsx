import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from '../common/NotificationBell';

const StaffLayout = ({ children, role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Safely get user data from localStorage
  let user = null;
  try {
    const userString = localStorage.getItem('user');
    if (userString) {
      user = JSON.parse(userString);
    }
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/staff/login');
  };

  const navigation = [
    { name: 'Kitchen Dashboard', href: '/staff/kitchen', role: 'kitchen', icon: '👨‍🍳' },
    { name: 'Runner Dashboard', href: '/staff/runner', role: 'runner', icon: '🚀' },
    { name: 'Admin Dashboard', href: '/admin/dashboard', role: 'admin', icon: '📊' },
    { name: 'Table Management', href: '/admin/tables', role: 'admin', icon: '🍽️' },
    { name: 'Menu Management', href: '/admin/menu', role: 'admin', icon: '📋' },
  ];

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'kitchen': return 'Kitchen Staff';
      case 'runner': return 'Service Runner';
      case 'admin': return 'Administrator';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link 
                to={role === 'admin' ? '/admin/dashboard' : role === 'kitchen' ? '/staff/kitchen' : '/staff/runner'} 
                className="flex items-center"
              >
                <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-3">
                  R
                </div>
                <h1 className="text-2xl font-bold text-amber-900">Restaurant Portal</h1>
              </Link>
              
              <nav className="ml-8 flex space-x-1">
                {navigation
                  .filter(item => item.role === role)
                  .map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-300 flex items-center ${
                        location.pathname === item.href
                          ? 'bg-amber-100 text-amber-800 shadow-inner'
                          : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell />
              
              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-amber-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-amber-600">{getRoleDisplay(role)}</p>
                </div>
                
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-300 flex items-center"
                  title="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-amber-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-amber-600">
              © {new Date().getFullYear()} Restaurant Management System
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-amber-500 bg-amber-100 px-2 py-1 rounded-full">
                {user?.email || 'user@example.com'}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                role === 'admin' ? 'bg-purple-100 text-purple-800' :
                role === 'kitchen' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {getRoleDisplay(role)}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StaffLayout;