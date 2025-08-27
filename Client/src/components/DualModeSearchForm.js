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
  const [useStructuredMode, setUseStructuredMode] = useState(true);
  const [useAllAboutMode, setUseAllAboutMode] = useState(false);
  
  // Structured Mode AI Settings
  const [structuredUseAI, setStructuredUseAI] = useState(false);
  const [structuredProvider, setStructuredProvider] = useState('');
  const [structuredModel, setStructuredModel] = useState('');
  const [structuredModelData, setStructuredModelData] = useState(null);
  
  // All About Mode AI Settings
  const [allAboutProvider, setAllAboutProvider] = useState('perplexity');
  const [allAboutModel, setAllAboutModel] = useState('sonar-pro');
  const [allAboutModelData, setAllAboutModelData] = useState(null);

  const handleStructuredModelChange = ({ provider, model, modelData: data }) => {
    setStructuredProvider(provider);
    setStructuredModel(model);
    setStructuredModelData(data);
  };

  const handleAllAboutModelChange = ({ provider, model, modelData: data }) => {
    setAllAboutProvider(provider);
    setAllAboutModel(model);
    setAllAboutModelData(data);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error(`Please enter a ${category} name`);
      return;
    }

    // Validate AI settings if structured mode with AI is selected
    if (useStructuredMode && structuredUseAI && (!structuredProvider || !structuredModel)) {
      toast.error('Please select both AI provider and model for structured search');
      return;
    }

    // Validate AI settings for All About mode
    if (useAllAboutMode && (!allAboutProvider || !allAboutModel)) {
      toast.error('Please select both AI provider and model for All About search');
      return;
    }

    const searchPromises = [];

    // Execute structured search if selected
    if (useStructuredMode) {
      searchPromises.push(
        onStructuredSearch(searchQuery, structuredUseAI, structuredProvider, structuredModel, structuredModelData)
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
      console.error('Search error:', error);
      // Individual search functions handle their own error messages
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl mb-8">
      <div className="px-6 py-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Search for {category === 'artist' ? 'an Artist' : category === 'raag' ? 'a Raag' : 'a Taal'}
        </h3>
        <p className="text-gray-600 mb-6">
          Choose your search mode and enter the name to search for information.
        </p>
        
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Search Input */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-lg"
              placeholder={placeholder}
            />
          </div>

          {/* Search Mode Selection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Search Modes</h4>
            
            {/* Option 1: Structured Mode */}
            <div className="mb-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={useStructuredMode}
                  onChange={(e) => setUseStructuredMode(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Option 1: Structured Mode (Current System)
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Uses structured prompts to generate organized field data (Name, Guru, Gharana, etc.)
                  </p>
                  
                  {/* AI Settings for Structured Mode */}
                  {useStructuredMode && (
                    <div className="mt-4 pl-4 border-l-2 border-blue-200">
                      <div className="flex items-center space-x-4 mb-3">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={structuredUseAI}
                            onChange={(e) => setStructuredUseAI(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700 font-medium">Use AI Research</span>
                        </label>
                        {!structuredUseAI && (
                          <span className="text-sm text-gray-500">
                            (Will use web scraping)
                          </span>
                        )}
                      </div>
                      
                      {/* AI Model Selection */}
                      {structuredUseAI && (
                        <div className="mt-3">
                          <AIModelSelector
                            onModelChange={handleStructuredModelChange}
                            selectedProvider={structuredProvider}
                            selectedModel={structuredModel}
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Option 2: All About Mode */}
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={useAllAboutMode}
                  onChange={(e) => setUseAllAboutMode(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Option 2: "All About" Mode (Perplexity Raw)
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Automatically runs "all about {name}" and displays raw AI response with Answer, Images, and Sources
                  </p>
                  
                  {/* AI Settings for All About Mode */}
                  {useAllAboutMode && (
                    <div className="mt-4 pl-4 border-l-2 border-purple-200">
                      <AIModelSelector
                        onModelChange={handleAllAboutModelChange}
                        selectedProvider={allAboutProvider}
                        selectedModel={allAboutModel}
                        className="text-sm"
                      />
                      <p className="text-xs text-purple-600 mt-2">
                        ⚡ No prompt optimization - pure raw "all about" response
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading || (!useStructuredMode && !useAllAboutMode)}
            className="w-full px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <ClockIcon className="animate-spin h-5 w-5 mr-2" />
                Searching...
              </div>
            ) : (
              `Search ${category === 'artist' ? 'Artist' : category === 'raag' ? 'Raag' : 'Taal'}`
            )}
          </button>

          {/* Mode Selection Validation */}
          {!useStructuredMode && !useAllAboutMode && (
            <p className="text-sm text-red-600 text-center">
              Please select at least one search mode
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default DualModeSearchForm;