import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import LoginModal from './LoginModal';

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/artists', label: 'Artists' },
    { path: '/raags', label: 'Raags' },
    { path: '/taals', label: 'Taals' },
  ];

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-primary-600">
                  Indian Classical Music
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(link.path)
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <UserIcon className="h-5 w-5" />
                    <span>{user.profile?.firstName || user.username}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{user.profile?.firstName} {user.profile?.lastName}</div>
                        <div className="text-gray-500">{user.email}</div>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/activity"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Activity
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </>
  );
};

export default Navbar;