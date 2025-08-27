import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const AIModelSelector = ({ onModelChange, selectedProvider, selectedModel, className = '' }) => {
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);

  // AI Model Configuration with clear provider and source distinction
  const aiModels = {
    perplexity: {
      name: 'Perplexity',
      models: [
        {
          id: 'sonar-pro',
          name: 'Sonar Pro',
          description: 'Comprehensive answers with large context window',
          source: 'Perplexity'
        },
        {
          id: 'sonar-deep-research',
          name: 'Sonar Deep Research',
          description: 'Multi-step reasoning and deep research tasks',
          source: 'Perplexity'
        },
        {
          id: 'sonar-reasoning-pro',
          name: 'Sonar Reasoning Pro',
          description: 'Advanced reasoning for challenging inquiries',
          source: 'Perplexity'
        },
        {
          id: 'sonar-reasoning',
          name: 'Sonar Reasoning',
          description: 'Fast and efficient for general reasoning tasks',
          source: 'Perplexity'
        },
        {
          id: 'r1-1776',
          name: 'R1-1776',
          description: 'Specialized model focused on factuality and precision',
          source: 'Perplexity'
        },
        {
          id: 'sonar',
          name: 'Sonar',
          description: 'Lightweight, scalable Q&A model for speedy responses',
          source: 'Perplexity'
        },
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo (via Perplexity)',
          description: 'OpenAI GPT-4 Turbo through Perplexity Pro',
          source: 'OpenAI via Perplexity'
        },
        {
          id: 'claude-3-sonnet',
          name: 'Claude 3 Sonnet (via Perplexity)',
          description: 'Anthropic Claude 3 through Perplexity Pro',
          source: 'Anthropic via Perplexity'
        },
        {
          id: 'gemini-1.5-pro',
          name: 'Gemini 1.5 Pro (via Perplexity)',
          description: 'Google Gemini 1.5 Pro through Perplexity Pro',
          source: 'Google via Perplexity'
        }
      ]
    },
    openai: {
      name: 'OpenAI (ChatGPT)',
      models: [
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4.1 (via OpenAI)',
          description: 'Latest GPT-4 model directly from OpenAI',
          source: 'OpenAI Direct'
        },
        {
          id: 'gpt-4',
          name: 'GPT-4 (Classic)',
          description: 'Original GPT-4 model',
          source: 'OpenAI Direct'
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          description: 'Fast and efficient GPT-3.5',
          source: 'OpenAI Direct'
        },
        {
          id: 'gpt-4-vision',
          name: 'GPT-4 Vision',
          description: 'GPT-4 with image understanding',
          source: 'OpenAI Direct'
        },
        {
          id: 'code-interpreter',
          name: 'Code Interpreter',
          description: 'GPT-4 with code execution capabilities',
          source: 'OpenAI Direct'
        }
      ]
    },
    gemini: {
      name: 'Google Gemini',
      models: [
        {
          id: 'gemini-2.5-flash',
          name: 'Gemini 2.5 Flash',
          description: 'Efficient model for speed and cost-effectiveness, ideal for high-throughput metadata collection',
          source: 'Google Direct'
        },
        {
          id: 'gemini-2.5-pro',
          name: 'Gemini 2.5 Pro',
          description: 'Most advanced model for complex reasoning and comprehensive research tasks',
          source: 'Google Direct'
        },
        {
          id: 'gemini-2.5-flash-lite',
          name: 'Gemini 2.5 Flash-Lite',
          description: 'Most cost-effective and fastest model for high-throughput metadata extraction',
          source: 'Google Direct'
        },
        {
          id: 'gemini-embedding',
          name: 'Gemini Embedding',
          description: 'Specialized for semantic search and text classification tasks',
          source: 'Google Direct'
        },
        {
          id: 'gemma-3',
          name: 'Gemma 3',
          description: 'Lightweight open model for efficient execution and multimodal input',
          source: 'Google Direct'
        }
      ]
    }
  };

  const providers = Object.keys(aiModels);
  const selectedProviderData = selectedProvider ? aiModels[selectedProvider] : null;
  const availableModels = selectedProviderData ? selectedProviderData.models : [];

  // Handle provider selection
  const handleProviderSelect = (providerId) => {
    setIsProviderOpen(false);
    setIsModelOpen(false);
    
    // Reset model selection when provider changes
    onModelChange({
      provider: providerId,
      model: null,
      modelData: null
    });
  };

  // Handle model selection
  const handleModelSelect = (model) => {
    setIsModelOpen(false);
    
    onModelChange({
      provider: selectedProvider,
      model: model.id,
      modelData: model
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.ai-model-selector')) {
        setIsProviderOpen(false);
        setIsModelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`ai-model-selector space-y-4 ${className}`}>
      {/* Provider Dropdown */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          AI Provider
        </label>
        <button
          type="button"
          onClick={() => setIsProviderOpen(!isProviderOpen)}
          className="relative w-full bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg shadow-sm pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500/50 transition-colors duration-200 text-white"
        >
          <span className="block truncate">
            {selectedProviderData ? selectedProviderData.name : 'Select AI Provider'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isProviderOpen ? 'rotate-180' : ''
              }`} 
            />
          </span>
        </button>

        {isProviderOpen && (
          <div className="absolute z-50 mt-1 w-full bg-gray-900 bg-opacity-95 backdrop-filter backdrop-blur-lg shadow-2xl max-h-60 rounded-lg py-1 text-base border border-gray-700 overflow-auto focus:outline-none">
            {providers.map((providerId) => (
              <button
                key={providerId}
                onClick={() => handleProviderSelect(providerId)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-800 hover:bg-opacity-50 hover:text-green-400 transition-colors duration-150 ${
                  selectedProvider === providerId 
                    ? 'bg-gray-800 bg-opacity-50 text-green-400 font-medium border-l-2 border-green-500' 
                    : 'text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{aiModels[providerId].name}</span>
                  {selectedProvider === providerId && (
                    <span className="text-green-400">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Model Dropdown - Only show if provider is selected */}
      {selectedProvider && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            AI Model
          </label>
          <button
            type="button"
            onClick={() => setIsModelOpen(!isModelOpen)}
            className="relative w-full bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg shadow-sm pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500/50 transition-colors duration-200 text-white"
            disabled={!selectedProvider}
          >
            <span className="block truncate">
              {selectedModel && availableModels.find(m => m.id === selectedModel)
                ? availableModels.find(m => m.id === selectedModel).name
                : 'Select AI Model'
              }
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDownIcon 
                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                  isModelOpen ? 'rotate-180' : ''
                }`} 
              />
            </span>
          </button>

          {isModelOpen && (
            <div className="absolute z-50 mt-1 w-full bg-gray-900 bg-opacity-95 backdrop-filter backdrop-blur-lg shadow-2xl max-h-80 rounded-lg py-1 text-base border border-gray-700 overflow-auto focus:outline-none">
              {availableModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-800 hover:bg-opacity-50 hover:text-green-400 transition-colors duration-150 ${
                    selectedModel === model.id 
                      ? 'bg-gray-800 bg-opacity-50 text-green-400 border-l-2 border-green-500' 
                      : 'text-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {selectedModel === model.id && (
                          <span className="text-green-400 flex-shrink-0">✓</span>
                        )}
                        <span className="font-medium truncate">{model.name}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{model.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Source: {model.source}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Model Info */}
      {selectedModel && selectedProviderData && (
        <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-400 mb-2">Selected Configuration</h4>
          <div className="text-sm text-gray-300">
            <p><span className="font-medium">Provider:</span> {selectedProviderData.name}</p>
            <p><span className="font-medium">Model:</span> {availableModels.find(m => m.id === selectedModel)?.name}</p>
            <p><span className="font-medium">Source:</span> {availableModels.find(m => m.id === selectedModel)?.source}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIModelSelector;