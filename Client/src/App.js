import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ArtistSearch from './pages/ArtistSearch';
import RaagSearch from './pages/RaagSearch';
import TaalSearch from './pages/TaalSearch';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artists" element={<ArtistSearch />} />
            <Route path="/raags" element={<RaagSearch />} />
            <Route path="/taals" element={<TaalSearch />} />
          </Routes>
        </main>
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App; 