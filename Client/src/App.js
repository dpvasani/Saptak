import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ArtistSearch from './pages/ArtistSearch';
import RaagSearch from './pages/RaagSearch';
import TaalSearch from './pages/TaalSearch';
import VerificationPage from './pages/VerificationPage';
import VerificationDetail from './pages/VerificationDetail';
import ArtistMarkdownView from './pages/ArtistMarkdownView';
import UserProfile from './pages/UserProfile';
import UserActivity from './pages/UserActivity';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
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
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-green-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-green-900">
        <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                user ? <Navigate to="/dashboard" replace /> : 
                <Home onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/artists" 
              element={
                <ProtectedRoute>
                  <ArtistSearch user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/raags" 
              element={
                <ProtectedRoute>
                  <RaagSearch user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/taals" 
              element={
                <ProtectedRoute>
                  <TaalSearch user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/verification/:category" 
              element={
                <ProtectedRoute>
                  <VerificationPage user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/verification/:category/:id" 
              element={
                <ProtectedRoute>
                  <VerificationDetail user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/view/:category/:id" 
              element={
                <ProtectedRoute>
                  <ArtistMarkdownView user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile user={user} onUserUpdate={setUser} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/activity" 
              element={
                <ProtectedRoute>
                  <UserActivity user={user} />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastStyle={{
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            color: '#f3f4f6'
          }}
        />
      </div>
    </Router>
  );
}

export default App;