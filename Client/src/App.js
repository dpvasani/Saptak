import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
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
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
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

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={<Home onLogin={handleLogin} />} 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/artists" 
              element={user ? <ArtistSearch user={user} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/raags" 
              element={user ? <RaagSearch user={user} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/taals" 
              element={user ? <TaalSearch user={user} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/verification/:category" 
              element={user ? <VerificationPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/verification/:category/:id" 
              element={user ? <VerificationDetail /> : <Navigate to="/" />} 
            />
            <Route 
              path="/view/:category/:id" 
              element={user ? <ArtistMarkdownView /> : <Navigate to="/" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <UserProfile user={user} onUserUpdate={handleUserUpdate} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/activity" 
              element={user ? <UserActivity user={user} /> : <Navigate to="/" />} 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

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
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(75, 85, 99, 0.3)',
          }}
        />
      </div>
    </Router>
  );
}

export default App;