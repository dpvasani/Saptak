import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoginModal from '../components/LoginModal';

const Home = ({ onLogin }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const features = [
    {
      title: 'Artists Research',
      description: 'Comprehensive artist profiles with guru lineage, gharana traditions, and achievements.',
      icon: '🎤',
      stats: 'AI-powered research with verification workflows'
    },
    {
      title: 'Raags Analysis',
      description: 'Detailed raag structures, aroha-avroha, thaat classification, and performance guidelines.',
      icon: '🎼',
      stats: 'Musical theory with traditional knowledge'
    },
    {
      title: 'Taals Documentation',
      description: 'Rhythmic patterns, beat structures, taali-khaali positions, and mathematical analysis.',
      icon: '🥁',
      stats: 'Percussion mastery with technical precision'
    },
  ];

  const handleGetStarted = () => {
    setShowLoginModal(true);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto text-white">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="block">🎵 RagaBot</span>
            <span className="block bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent mt-2">
              Indian Classical Music
            </span>
            <span className="block bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent text-4xl sm:text-5xl md:text-6xl">
              Knowledge Platform
            </span>
          </motion.h1>
          
          <motion.p 
            className="mt-6 max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            A comprehensive platform for researching, organizing, and verifying knowledge about Indian classical music. 
            Powered by AI research and traditional web scraping with professional verification workflows.
          </motion.p>

          <motion.div 
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
            >
              🚀 Get Started
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="mt-4 text-sm text-gray-400">
              🔐 Login required to access research tools and data collection features
            </p>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="relative group bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-gray-800 hover:shadow-green-500/20 hover:border-green-500/50 hover:bg-opacity-90 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 bg-opacity-50 rounded-xl text-4xl mb-6 border border-gray-700 group-hover:border-green-500/50 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="inline-flex items-center px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                    {feature.stats}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why Choose RagaBot Section */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent mb-8">
            Why Choose RagaBot?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-semibold text-green-400 mb-3">🤖 AI-Powered Research</h3>
              <p className="text-gray-300">
                Advanced AI models (OpenAI, Gemini, Perplexity) for comprehensive music research with verification workflows.
              </p>
            </div>
            
            <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-semibold text-green-400 mb-3">🌐 Multi-Source Collection</h3>
              <p className="text-gray-300">
                Web scraping from 10+ specialized sources combined with traditional research methods.
              </p>
            </div>
            
            <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Verification System</h3>
              <p className="text-gray-300">
                Field-by-field verification with bulk operations and user activity tracking.
              </p>
            </div>
            
            <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-semibold text-green-400 mb-3">📊 Professional Dashboard</h3>
              <p className="text-gray-300">
                Real-time analytics, progress tracking, and comprehensive data management tools.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={onLogin}
      />
    </>
  );
};

export default Home;