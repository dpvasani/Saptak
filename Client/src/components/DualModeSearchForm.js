import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import debounce from 'lodash.debounce';
import AIModelSelector from './AIModelSelector';
import { 
  MagnifyingGlassIcon,
  GlobeAltIcon,
  CpuChipIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const DualModeSearchForm = ({ 
  onStructuredSearch, 
  onAllAboutSearch, 
  loading, 
  searchQuery, 
  setSearchQuery,
  category = 'artists'
}) => {
  // Search method state
  const [searchMethod, setSearchMethod] = useState('ai');
  
  // AI Mode Selection
  const [useStructuredMode, setUseStructuredMode] = useState(true);
  const [useAllAboutMode, setUseAllAboutMode] = useState(true);
  
  // Structured Mode AI Configuration
  const [structuredProvider, setStructuredProvider] = useState('perplexity');
  const [structuredModel, setStructuredModel] = useState('sonar');
  const [structuredModelData, setStructuredModelData] = useState(null);
  
  // Summary Mode AI Configuration
  const [allAboutProvider, setAllAboutProvider] = useState('perplexity');
  const [allAboutModel, setAllAboutModel] = useState('sonar-pro');
  const [allAboutModelData, setAllAboutModelData] = useState(null);
  
  // UI State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Set default models when providers change
  useEffect(() => {
    if (structuredProvider === 'perplexity') {
      setStructuredModel('sonar');
    } else if (structuredProvider === 'openai') {
      setStructuredModel('gpt-4-turbo');
    } else if (structuredProvider === 'gemini') {
      setStructuredModel('gemini-2.5-flash');
    }
  }, [structuredProvider]);

  useEffect(() => {
    if (allAboutProvider === 'perplexity') {
      setAllAboutModel('sonar-pro');
    } else if (allAboutProvider === 'openai') {
      setAllAboutModel('gpt-4-turbo');
    } else if (allAboutProvider === 'gemini') {
      setAllAboutModel('gemini-2.5-pro');
    }
  }, [allAboutProvider]);

  const handleStructuredModelChange = ({ provider, model, modelData }) => {
    setStructuredProvider(provider);
    setStructuredModel(model);
    setStructuredModelData(modelData);
  };

  const handleAllAboutModelChange = ({ provider, model, modelData }) => {
    setAllAboutProvider(provider);
    setAllAboutModel(model);
    setAllAboutModelData(modelData);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }

    if (searchMethod === 'web') {
      // Web scraping mode
      await onStructuredSearch(searchQuery, false, '', '', null);
    } else {
      // AI mode with sequential processing
      const searchPromises = [];
      
      // Validate AI mode selections
      if (!useStructuredMode && !useAllAboutMode) {
        alert('Please select at least one AI search mode (Structured Mode or Summary Mode)');
        return;
      }

      if (useStructuredMode && (!structuredProvider || !structuredModel)) {
        alert('Please select AI provider and model for Structured Mode');
        return;
      }

      if (useAllAboutMode && (!allAboutProvider || !allAboutModel)) {
        alert('Please select AI provider and model for Summary Mode');
        return;
      }

      // 🔄 SEQUENTIAL PROCESSING: Execute searches in sequence
      try {
        let entityId = null;

        // Step 1: Execute structured search first (if selected)
        if (useStructuredMode) {
          console.log('🔄 Step 1: Starting Structured Mode search...');
          const structuredResult = await onStructuredSearch(
            searchQuery, 
            true, 
            structuredProvider, 
            structuredModel, 
            structuredModelData
          );
          
          // Extract entity ID from structured search result
          if (structuredResult && structuredResult._id) {
            entityId = structuredResult._id;
            console.log('✅ Step 1 Complete: Got entity ID:', entityId);
          }
        }

        // Step 2: Execute Summary Mode search second (if selected)
        if (useAllAboutMode) {
          console.log('🔄 Step 2: Starting Summary Mode search...');
          console.log('🔗 Using entity ID from Step 1:', entityId);
          
          await onAllAboutSearch(
            searchQuery, 
            allAboutProvider, 
            allAboutModel, 
            allAboutModelData,
            entityId // Pass the entity ID from Step 1
          );
          
          console.log('✅ Step 2 Complete: Summary Mode data saved');
        }

        console.log('🎉 Sequential processing completed successfully!');
      } catch (error) {
        console.error('❌ Sequential processing failed:', error);
        throw error;
      }
    }
  };

  const categoryLabels = {
    artists: 'Artist',
    raags: 'Raag', 
    taals: 'Taal'
  };

  return (
    <motion.div
      className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            {categoryLabels[category]} Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Enter ${categoryLabels[category].toLowerCase()} name...`}
              className="w-full px-4 py-3 pl-12 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400 backdrop-blur-sm"
              disabled={loading}
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Search Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Search Method
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSearchMethod('web')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                searchMethod === 'web'
                  ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-blue-400'
                  : 'border-gray-700 bg-gray-800 bg-opacity-50 text-gray-300 hover:border-blue-500/50'
              }`}
              disabled={loading}
            >
              <div className="flex items-center justify-center mb-2">
                <GlobeAltIcon className="h-6 w-6" />
              </div>
              <div className="text-sm font-medium">Web Scraping</div>
              <div className="text-xs text-gray-400 mt-1">Traditional web search</div>
            </button>

            <button
              type="button"
              onClick={() => setSearchMethod('ai')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                searchMethod === 'ai'
                  ? 'border-green-500 bg-green-500 bg-opacity-20 text-green-400'
                  : 'border-gray-700 bg-gray-800 bg-opacity-50 text-gray-300 hover:border-green-500/50'
              }`}
              disabled={loading}
            >
              <div className="flex items-center justify-center mb-2">
                <CpuChipIcon className="h-6 w-6" />
              </div>
              <div className="text-sm font-medium">AI Search</div>
              <div className="text-xs text-gray-400 mt-1">AI-powered research</div>
            </button>
          </div>
        </div>

        {/* AI Mode Options - Only shown when AI Search is selected */}
        {searchMethod === 'ai' && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            {/* AI Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                AI Search Modes (Sequential Processing)
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="structuredMode"
                    checked={useStructuredMode}
                    onChange={(e) => setUseStructuredMode(e.target.checked)}
                    className="rounded border-gray-600 text-green-500 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 bg-gray-700"
                    disabled={loading}
                  />
                  <label htmlFor="structuredMode" className="text-gray-200 font-medium">
                    🔍 Option 1: Structured Mode (Runs First)
                  </label>
                </div>
                <p className="text-sm text-gray-400 ml-6">
                  Generates organized field data (guru, gharana, achievements, etc.)
                </p>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allAboutMode"
                    checked={useAllAboutMode}
                    onChange={(e) => setUseAllAboutMode(e.target.checked)}
                    className="rounded border-gray-600 text-green-500 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 bg-gray-700"
                    disabled={loading}
                  />
                  <label htmlFor="allAboutMode" className="text-gray-200 font-medium">
                    📝 Option 2: Summary Mode (Runs Second)
                  </label>
                </div>
                <p className="text-sm text-gray-400 ml-6">
                  Generates comprehensive research summary with images and sources
                </p>
              </div>
            </div>

            {/* Structured Mode AI Configuration */}
            {useStructuredMode && (
              <motion.div
                className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                  🔍 Option 1: Structured Mode Configuration
                  <span className="ml-2 text-xs bg-green-500 bg-opacity-20 text-green-400 px-2 py-1 rounded-full">
                    Runs First
                  </span>
                </h4>
                <AIModelSelector
                  onModelChange={handleStructuredModelChange}
                  selectedProvider={structuredProvider}
                  selectedModel={structuredModel}
                  onDropdownStateChange={setIsDropdownOpen}
                />
              </motion.div>
            )}

            {/* Summary Mode AI Configuration */}
            {useAllAboutMode && (
              <motion.div
                className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                  📝 Option 2: Summary Mode Configuration
                  <span className="ml-2 text-xs bg-blue-500 bg-opacity-20 text-blue-400 px-2 py-1 rounded-full">
                    Runs Second
                  </span>
                </h4>
                <AIModelSelector
                  onModelChange={handleAllAboutModelChange}
                  selectedProvider={allAboutProvider}
                  selectedModel={allAboutModel}
                  onDropdownStateChange={setIsDropdownOpen}
                />
              </motion.div>
            )}

            {/* Sequential Processing Info */}
            <div className="bg-blue-500 bg-opacity-10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ClockIcon className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-1">Sequential Processing</h4>
                  <p className="text-xs text-blue-300">
                    When both modes are selected, Option 1 runs first and creates the document. 
                    Option 2 then uses the MongoDB ID to update the same document, ensuring all data is saved together.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Button */}
        <button
          type="submit"
          disabled={loading || !searchQuery.trim() || (searchMethod === 'ai' && !useStructuredMode && !useAllAboutMode) || isDropdownOpen}
          className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              {searchMethod === 'web' ? 'Web Scraping...' : 'AI Researching... (This may take up to 2 minutes)'}
            </>
          ) : (
            <>
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Search {categoryLabels[category]}
            </>
          )}
        </button>

        {/* Search Method Info */}
        {!loading && (
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              searchMethod === 'web' 
                ? 'bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500/30'
                : 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500/30'
            }`}>
              {searchMethod === 'web' ? (
                <>
                  <GlobeAltIcon className="h-3 w-3 mr-1" />
                  Web Scraping Mode
                </>
              ) : (
                <>
                  <CpuChipIcon className="h-3 w-3 mr-1" />
                  AI Research Mode
                  {useStructuredMode && useAllAboutMode && (
                    <span className="ml-1">(Both Options)</span>
                  )}
                  {useStructuredMode && !useAllAboutMode && (
                    <span className="ml-1">(Option 1 Only)</span>
                  )}
                  {!useStructuredMode && useAllAboutMode && (
                    <span className="ml-1">(Option 2 Only)</span>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default DualModeSearchForm;