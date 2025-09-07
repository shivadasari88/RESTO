import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
    { name: 'Kitchen Dashboard', href: '/staff/kitchen', role: 'kitchen' },
    { name: 'Runner Dashboard', href: '/staff/runner', role: 'runner' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Staff Portal</h1>
              <nav className="ml-8 flex space-x-4">
                {navigation
                  .filter(item => item.role === role)
                  .map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === item.href
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Logged in as <strong>{user?.name || 'User'}</strong> ({role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default StaffLayout;