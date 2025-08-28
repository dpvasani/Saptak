import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ClockIcon } from '@heroicons/react/24/outline';
import AIModelSelector from './AIModelSelector';

const DualModeSearchForm = ({ 
  onStructuredSearch, 
  onAllAboutSearch, 
  loading, 
  searchQuery, 
  setSearchQuery,
  placeholder = "Enter name",
  category = "artist"
}) => {
  // Main search method selection
  const [searchMethod, setSearchMethod] = useState('web'); // 'web' or 'ai'
  
  // AI Mode selections (only shown when searchMethod is 'ai')
  const [useStructuredMode, setUseStructuredMode] = useState(true);
  const [useAllAboutMode, setUseAllAboutMode] = useState(false);
  
  // Track if AI sections should be expanded
  const [structuredExpanded, setStructuredExpanded] = useState(true);
  const [allAboutExpanded, setAllAboutExpanded] = useState(false);
  
  // Track dropdown states to adjust Option 2 position
  const [structuredDropdownOpen, setStructuredDropdownOpen] = useState(false);
  const [allAboutDropdownOpen, setAllAboutDropdownOpen] = useState(false);
  
  // Structured Mode AI Settings
  const [structuredProvider, setStructuredProvider] = useState('');
  const [structuredModel, setStructuredModel] = useState('');
  const [structuredModelData, setStructuredModelData] = useState(null);
  
  // All About Mode AI Settings
  const [allAboutProvider, setAllAboutProvider] = useState('perplexity');
  const [allAboutModel, setAllAboutModel] = useState('sonar-pro');
  const [allAboutModelData, setAllAboutModelData] = useState(null);

  const handleStructuredModelChange = ({ provider, model, modelData: data }) => {
    // Keep expanded when changing model settings - don't collapse
    setStructuredProvider(provider);
    setStructuredModel(model);
    setStructuredModelData(data);
    // Ensure it stays expanded
    if (useStructuredMode) {
      setStructuredExpanded(true);
    }
  };

  const handleAllAboutModelChange = ({ provider, model, modelData: data }) => {
    // Keep expanded when changing model settings - don't collapse
    setAllAboutProvider(provider);
    setAllAboutModel(model);
    setAllAboutModelData(data);
    // Ensure it stays expanded
    if (useAllAboutMode) {
      setAllAboutExpanded(true);
    }
  };

  const handleStructuredModeToggle = (checked) => {
    setUseStructuredMode(checked);
    setStructuredExpanded(checked); // Only collapse when unchecking
  };

  const handleAllAboutModeToggle = (checked) => {
    setUseAllAboutMode(checked);
    setAllAboutExpanded(checked); // Only collapse when unchecking
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error(`Please enter a ${category} name`);
      return;
    }

    if (searchMethod === 'web') {
      // Web scraping mode
      try {
        await onStructuredSearch(searchQuery, false, '', '', null);
      } catch (error) {
        console.error('Web scraping error:', error);
      }
    } else {
      // AI search mode - validate selections
      if (useStructuredMode && (!structuredProvider || !structuredModel)) {
        toast.error('Please select both AI provider and model for structured search');
        return;
      }

      if (useAllAboutMode && (!allAboutProvider || !allAboutModel)) {
        toast.error('Please select both AI provider and model for Summary search');
        return;
      }

      if (!useStructuredMode && !useAllAboutMode) {
        toast.error('Please select at least one AI search mode');
        return;
      }

      const searchPromises = [];

      // Execute structured search if selected
      if (useStructuredMode) {
        searchPromises.push(
          onStructuredSearch(searchQuery, true, structuredProvider, structuredModel, structuredModelData)
        );
      }

      // Execute "All About" search if selected
      if (useAllAboutMode) {
        searchPromises.push(
          onAllAboutSearch(searchQuery, allAboutProvider, allAboutModel, allAboutModelData)
        );
      }

      // Execute searches
      try {
        await Promise.all(searchPromises);
      } catch (error) {
        console.error('AI search error:', error);
      }
    }
  };

  return (
    <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg shadow-2xl rounded-xl mb-8 border border-gray-800">
      <div className="px-6 py-8">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text mb-2">
          Search for {category === 'artist' ? 'an Artist' : category === 'raag' ? 'a Raag' : 'a Taal'}
        </h3>
        <p className="text-gray-300 mb-6">
          Choose your search method and enter the name to search for information.
        </p>
        
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Search Input */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm text-lg text-white placeholder-gray-400 backdrop-blur-sm"
              placeholder={placeholder}
            />
          </div>

          {/* Main Search Method Selection */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <h4 className="text-lg font-semibold text-green-400 mb-4">Search Method</h4>
            
            <div className="space-y-4">
              {/* Web Scraping Option */}
              <label className="flex items-start space-x-3 cursor-pointer bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-all duration-200">
                <input
                  type="radio"
                  name="searchMethod"
                  value="web"
                  checked={searchMethod === 'web'}
                  onChange={(e) => setSearchMethod(e.target.value)}
                  className="mt-1 text-green-500 border-gray-600 focus:ring-green-500 bg-gray-700"
                />
                <div>
                  <span className="text-sm font-medium text-white">
                    🌐 Web Scraping
                  </span>
                  <p className="text-sm text-gray-300 mt-1">
                    Traditional web scraping from multiple sources (Wikipedia, music websites, etc.)
                  </p>
                  <p className="text-xs text-green-400 mt-1">
                    ⚡ Fast and reliable - No AI involved
                  </p>
                </div>
              </label>

              {/* AI Search Option */}
              <label className="flex items-start space-x-3 cursor-pointer bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-all duration-200">
                <input
                  type="radio"
                  name="searchMethod"
                  value="ai"
                  checked={searchMethod === 'ai'}
                  onChange={(e) => setSearchMethod(e.target.value)}
                  className="mt-1 text-green-500 border-gray-600 focus:ring-green-500 bg-gray-700"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-white">
                    🤖 AI Search
                  </span>
                  <p className="text-sm text-gray-300 mt-1">
                    Advanced AI-powered research with multiple modes and providers
                  </p>
                  <p className="text-xs text-green-400 mt-1">
                    🎯 Choose from multiple AI modes below
                  </p>
                </div>
              </label>
            </div>
            
            {/* AI Mode Options - Only shown when AI Search is selected */}
            {searchMethod === 'ai' && (
              <div className="mt-6 pl-4 border-l-4 border-green-500 bg-gray-800 bg-opacity-30 backdrop-blur-sm rounded-r-lg p-4">
                <h5 className="text-lg font-semibold text-green-400 mb-4">🤖 AI Search Modes</h5>
                <p className="text-sm text-gray-300 mb-4">
                  Choose one or both AI search modes. Each mode can use different AI providers and models.
                </p>
                
                <div className="space-y-6">
                  {/* Option 1: Structured Mode */}
                  <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border-2 border-gray-700 shadow-sm relative">
                    <div className="flex items-start space-x-3">
                      <input
                        id="structured-mode-checkbox"
                        type="checkbox"
                        checked={useStructuredMode}
                        onChange={(e) => handleStructuredModeToggle(e.target.checked)}
                        className="mt-1 rounded border-gray-600 text-green-500 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 bg-gray-700"
                      />
                      <div className="flex-1">
                        <label htmlFor="structured-mode-checkbox" className="cursor-pointer select-none block">
                          <span className="text-sm font-medium text-white">
                            📊 Option 1: Structured Mode
                          </span>
                          <p className="text-sm text-gray-300 mt-1">
                            Uses structured prompts to generate organized field data (Name, Guru, Gharana, etc.)
                          </p>
                          <p className="text-xs text-green-400 mt-1">
                            ✅ Perfect for verification workflows and data management
                          </p>
                        </label>
                        {/* AI Settings for Structured Mode */}
                        {structuredExpanded && (
                          <div className="mt-4 p-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 relative" onClick={(e) => e.stopPropagation()}>
                            <AIModelSelector
                              onModelChange={handleStructuredModelChange}
                              selectedProvider={structuredProvider}
                              selectedModel={structuredModel}
                              onDropdownStateChange={setStructuredDropdownOpen}
                              className="text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Summary Mode */}
                  <div className={`bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border-2 border-gray-700 shadow-sm relative transition-all duration-300 ${
                    structuredDropdownOpen ? 'mt-80' : ''
                  }`}>
                    <div className="flex items-start space-x-3">
                      <input
                        id="allabout-mode-checkbox"
                        type="checkbox"
                        checked={useAllAboutMode}
                        onChange={(e) => handleAllAboutModeToggle(e.target.checked)}
                        className="mt-1 rounded border-gray-600 text-green-500 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 bg-gray-700"
                      />
                      <div className="flex-1">
                        <label htmlFor="allabout-mode-checkbox" className="cursor-pointer select-none block">
                          <span className="text-sm font-medium text-white">
                            📝 Option 2: Summary Mode
                          </span>
                          <p className="text-sm text-gray-300 mt-1">
                            Generates a research summary in markdown with Answer, Images, and Sources
                          </p>
                          <p className="text-xs text-green-400 mt-1">
                            ⚡ No prompt optimization - pure raw response in markdown format
                          </p>
                        </label>
                        {/* AI Settings for All About Mode */}
                        {allAboutExpanded && (
                          <div className="mt-4 p-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600 relative" onClick={(e) => e.stopPropagation()}>
                            <AIModelSelector
                              onModelChange={handleAllAboutModelChange}
                              selectedProvider={allAboutProvider}
                              selectedModel={allAboutModel}
                              onDropdownStateChange={setAllAboutDropdownOpen}
                              className="text-sm"
                            />
                            <div className="mt-2 p-2 bg-gray-800 bg-opacity-50 rounded border border-gray-600">
                              <p className="text-xs text-green-400">
                                📝 <strong>Markdown Display:</strong> Beautifully formatted response
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading || (searchMethod === 'ai' && !useStructuredMode && !useAllAboutMode)}
           className="w-full px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <ClockIcon className="animate-spin h-5 w-5 mr-2" />
                {searchMethod === 'web' ? 'Web Scraping...' : 'AI Researching...'}
              </div>
            ) : (
              `🔍 Search ${category === 'artist' ? 'Artist' : category === 'raag' ? 'Raag' : 'Taal'} 
              ${searchMethod === 'web' ? '(Web Scraping)' : 
                `(AI: ${useStructuredMode && useAllAboutMode ? 'Both Modes' : 
                       useStructuredMode ? 'Structured' : 
                       useAllAboutMode ? 'Summary' : 'Select Mode'})`}`
            )}
          </button>

          {/* Validation Messages */}
          {searchMethod === 'ai' && !useStructuredMode && !useAllAboutMode && (
           <p className="text-sm text-red-400 text-center bg-red-900 bg-opacity-30 rounded-lg p-3 border border-red-800">
              ⚠️ Please select at least one AI search mode above
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default DualModeSearchForm;