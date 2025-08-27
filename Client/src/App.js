import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-green-900">
      <Router>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/artists" element={<ArtistSearch />} />
            <Route path="/raags" element={<RaagSearch />} />
            <Route path="/taals" element={<TaalSearch />} />
            <Route path="/verification/:category" element={<VerificationPage />} />
            <Route path="/verification/:category/:id" element={<VerificationDetail />} />
            <Route path="/view/:category/:id" element={<ArtistMarkdownView />} />
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
      </Router>
    </div>
  );
}

export default App;