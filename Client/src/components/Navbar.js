import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserIcon, ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import LoginModal from './LoginModal';

const Navbar = ({ user, onLogin, onLogout }) => {
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = user ? [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/artists', label: 'Artists' },
    { path: '/raags', label: 'Raags' },
    { path: '/taals', label: 'Taals' },
  ] : [];

  const handleLogin = (userData) => {
    onLogin(userData);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    onLogout();
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg border-b border-gray-800 shadow-2xl sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
                  🎵 RagaBot
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-gray-800 bg-opacity-50 text-green-400 shadow-sm border border-gray-700'
                      : 'text-gray-300 hover:text-green-400 hover:bg-gray-800 hover:bg-opacity-30'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* User Menu / Login */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 hover:bg-opacity-50"
                  >
                    {mobileMenuOpen ? (
                      <XMarkIcon className="h-6 w-6" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" />
                    )}
                  </button>

                  {/* User dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium bg-gray-800 bg-opacity-50 border border-gray-700 hover:border-green-500/50 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="hidden sm:block">{user.profile?.firstName || user.username}</span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-gray-900 bg-opacity-95 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl py-2 z-50 border border-gray-800">
                        <div className="px-4 py-3 border-b border-gray-800">
                          <div className="font-medium text-white">{user.profile?.firstName} {user.profile?.lastName}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                          <div className="text-xs text-green-400 mt-1 capitalize">{user.role}</div>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 hover:bg-opacity-50 transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          👤 Profile Settings
                        </Link>
                        <Link
                          to="/activity"
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 hover:bg-opacity-50 transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          📊 My Activity
                        </Link>
                        <div className="border-t border-gray-800 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 hover:bg-opacity-50 transition-colors duration-200"
                          >
                            🚪 Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center px-6 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  🔐 Login to Access
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {user && mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-800 bg-gray-900 bg-opacity-90 backdrop-filter backdrop-blur-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-gray-800 bg-opacity-50 text-green-400 border border-gray-700'
                        : 'text-gray-300 hover:text-green-400 hover:bg-gray-800 hover:bg-opacity-30'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
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