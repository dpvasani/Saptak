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
    <div className="bg-white shadow-lg rounded-xl mb-8">
      <div className="px-6 py-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Search for {category === 'artist' ? 'an Artist' : category === 'raag' ? 'a Raag' : 'a Taal'}
        </h3>
        <p className="text-gray-600 mb-6">
          Choose your search method and enter the name to search for information.
        </p>
        
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Search Input */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm text-lg bg-white/80 backdrop-blur-sm"
              placeholder={placeholder}
            />
          </div>

          {/* Main Search Method Selection */}
          <div className="bg-emerald-50/50 backdrop-blur-sm rounded-lg p-4 border border-emerald-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Search Method</h4>
            
            <div className="space-y-4">
              {/* Web Scraping Option */}
              <label className="flex items-start space-x-3 cursor-pointer bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-emerald-200 hover:border-emerald-300 transition-all duration-200">
                <input
                  type="radio"
                  name="searchMethod"
                  value="web"
                  checked={searchMethod === 'web'}
                  onChange={(e) => setSearchMethod(e.target.value)}
                  className="mt-1 text-emerald-600 border-emerald-300 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    🌐 Web Scraping
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Traditional web scraping from multiple sources (Wikipedia, music websites, etc.)
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    ⚡ Fast and reliable - No AI involved
                  </p>
                </div>
              </label>

              {/* AI Search Option */}
              <label className="flex items-start space-x-3 cursor-pointer bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-emerald-200 hover:border-emerald-300 transition-all duration-200">
                <input
                  type="radio"
                  name="searchMethod"
                  value="ai"
                  checked={searchMethod === 'ai'}
                  onChange={(e) => setSearchMethod(e.target.value)}
                  className="mt-1 text-emerald-600 border-emerald-300 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    🤖 AI Search
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Advanced AI-powered research with multiple modes and providers
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    🎯 Choose from multiple AI modes below
                  </p>
                </div>
              </label>
            </div>
            
            {/* AI Mode Options - Only shown when AI Search is selected */}
            {searchMethod === 'ai' && (
              <div className="mt-6 pl-4 border-l-4 border-emerald-400 bg-emerald-50/80 backdrop-blur-sm rounded-r-lg p-4">
                <h5 className="text-lg font-semibold text-emerald-900 mb-4">🤖 AI Search Modes</h5>
                <p className="text-sm text-emerald-700 mb-4">
                  Choose one or both AI search modes. Each mode can use different AI providers and models.
                </p>
                
                <div className="space-y-6">
                  {/* Option 1: Structured Mode */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-emerald-300 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <input
                        id="structured-mode-checkbox"
                        type="checkbox"
                        checked={useStructuredMode}
                        onChange={(e) => handleStructuredModeToggle(e.target.checked)}
                        className="mt-1 rounded border-emerald-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                      />
                      <div className="flex-1">
                        <label htmlFor="structured-mode-checkbox" className="cursor-pointer select-none block">
                          <span className="text-sm font-medium text-gray-900">
                            📊 Option 1: Structured Mode
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            Uses structured prompts to generate organized field data (Name, Guru, Gharana, etc.)
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            ✅ Perfect for verification workflows and data management
                          </p>
                        </label>
                        {/* AI Settings for Structured Mode */}
                        {structuredExpanded && (
                          <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200" onClick={(e) => e.stopPropagation()}>
                            <AIModelSelector
                              onModelChange={handleStructuredModelChange}
                              selectedProvider={structuredProvider}
                              selectedModel={structuredModel}
                              className="text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Summary Mode */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-green-300 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <input
                        id="allabout-mode-checkbox"
                        type="checkbox"
                        checked={useAllAboutMode}
                        onChange={(e) => handleAllAboutModeToggle(e.target.checked)}
                        className="mt-1 rounded border-green-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      />
                      <div className="flex-1">
                        <label htmlFor="allabout-mode-checkbox" className="cursor-pointer select-none block">
                          <span className="text-sm font-medium text-gray-900">
                            📝 Option 2: Summary Mode
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            Generates a research summary in markdown with Answer, Images, and Sources
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            ⚡ No prompt optimization - pure raw response in markdown format
                          </p>
                          <p className="text-xs text-green-600">
                        {/* AI Settings for All About Mode */}
                        {allAboutExpanded && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200" onClick={(e) => e.stopPropagation()}>
                            <AIModelSelector
                              onModelChange={handleAllAboutModelChange}
                              selectedProvider={allAboutProvider}
                              selectedModel={allAboutModel}
                              className="text-sm"
                            />
                            <div className="mt-2 p-2 bg-white rounded border border-green-100">
                              <p className="text-xs text-green-700">
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
            className="w-full px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-emerald-400 disabled:to-green-400 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02]"
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
            <p className="text-sm text-red-600 text-center bg-red-50 rounded-lg p-3 border border-red-200">
              ⚠️ Please select at least one AI search mode above
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default DualModeSearchForm;