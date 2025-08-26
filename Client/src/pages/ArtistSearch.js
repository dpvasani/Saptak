import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import AIModelSelector from '../components/AIModelSelector';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowTopRightOnSquareIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ArtistSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [modelData, setModelData] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedFields, setSelectedFields] = useState(new Set());

  const fields = [
    { key: 'name', label: 'Name' },
    { key: 'guru', label: 'Guru' },
    { key: 'gharana', label: 'Gharana' },
    { key: 'notableAchievements', label: 'Notable Achievements' },
    { key: 'disciples', label: 'Disciples' }
  ];

  // Debounced search function
  const debouncedSearch = debounce(async (query, aiEnabled, provider, model) => {
    if (!query.trim()) {
      toast.error('Please enter an artist name');
      return;
    }

    if (aiEnabled && (!provider || !model)) {
      toast.error('Please select both AI provider and model');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/artists/search?name=${encodeURIComponent(query)}&useAI=${aiEnabled}&aiProvider=${provider}&aiModel=${model}`);
      setArtist(response.data);
      toast.success(`Artist data ${aiEnabled ? `researched using ${modelData?.name || model}` : 'scraped from web'} successfully`);
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Error searching for artist');
      }
    } finally {
      setLoading(false);
    }
  }, 1000);

  const handleSearch = (e) => {
    e.preventDefault();
    debouncedSearch(searchQuery, useAI, selectedProvider, selectedModel);
  };

  const handleModelChange = ({ provider, model, modelData: data }) => {
    setSelectedProvider(provider);
    setSelectedModel(model);
    setModelData(data);
  };

  const updateArtistField = (field, updates) => {
    setArtist(prevArtist => ({
      ...prevArtist,
      [field]: {
        ...prevArtist[field],
        ...updates
      }
    }));
  };

  const handleFieldUpdate = async (field, value) => {
    if (!artist) return;

    const updatedArtist = {
      ...artist,
      [field]: {
        ...artist[field],
        value,
      },
    };

    try {
      const response = await axios.put(`http://localhost:5000/api/artists/${artist._id}`, updatedArtist);
      setArtist(response.data);
      toast.success('Artist updated successfully');
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Error updating artist');
      }
    }
  };

  const handleVerification = async (field, currentStatus) => {
    if (!artist) return;

    try {
      const updatedArtist = {
        ...artist,
        [field]: {
          ...artist[field],
          verified: !currentStatus
        }
      };

      await axios.put(`http://localhost:5000/api/artists/${artist._id}`, updatedArtist);
      
      // Update local state immediately
      updateArtistField(field, { verified: !currentStatus });
      
      toast.success(`${field} verification updated successfully`);
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error('Failed to update verification status');
      }
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setEditValue(artist[field]?.value || '');
  };

  const handleSave = async () => {
    try {
      const updatedArtist = {
        ...artist,
        [editingField]: {
          ...artist[editingField],
          value: editValue
        }
      };

      await axios.put(`http://localhost:5000/api/artists/${artist._id}`, updatedArtist);
      
      // Update local state immediately
      updateArtistField(editingField, { value: editValue });
      
      setEditingField(null);
      setEditValue('');
      
      toast.success('Field updated successfully');
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error('Failed to update field');
      }
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  // Bulk verification functions
  const handleSelectAll = () => {
    if (selectedFields.size === fields.length) {
      setSelectedFields(new Set());
    } else {
      setSelectedFields(new Set(fields.map(field => field.key)));
    }
  };

  const handleFieldSelect = (fieldKey) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldKey)) {
      newSelected.delete(fieldKey);
    } else {
      newSelected.add(fieldKey);
    }
    setSelectedFields(newSelected);
  };

  const handleBulkVerification = async (verify) => {
    if (selectedFields.size === 0) {
      toast.warning('Please select fields to verify/unverify');
      return;
    }

    try {
      const updatedArtist = { ...artist };
      
      selectedFields.forEach(field => {
        updatedArtist[field] = {
          ...updatedArtist[field],
          verified: verify
        };
      });

      await axios.put(`http://localhost:5000/api/artists/${artist._id}`, updatedArtist);
      setArtist(updatedArtist);
      setSelectedFields(new Set());
      
      toast.success(`${selectedFields.size} fields ${verify ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error('Failed to update verification status');
      }
    }
  };

  const renderField = (field) => {
    if (!artist) return null;

    const value = artist[field.key]?.value || '';
    const verified = artist[field.key]?.verified || false;
    const reference = artist[field.key]?.reference || '';
    const isEditing = editingField === field.key;
    const isSelected = selectedFields.has(field.key);

    return (
      <div key={field.key} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-200 hover:border-green-300 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleFieldSelect(field.key)}
              className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            />
            <h3 className="text-lg font-semibold text-gray-900">{field.label}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit(field.key)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
              title="Edit field"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleVerification(field.key, verified)}
              className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                verified
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 shadow-sm'
                  : 'bg-red-100 text-red-800 hover:bg-red-200 shadow-sm'
              }`}
            >
              {verified ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Verified
                </>
              ) : (
                <>
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Unverified
                </>
              )}
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={3}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              {value ? (
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{value}</p>
              ) : (
                <p className="text-gray-500 italic">No data available</p>
              )}
            </div>

            {reference && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Source:</p>
                <a
                  href={reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-green-700 hover:underline break-all"
                >
                  {reference}
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 flex-shrink-0" />
                </a>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const verifiedFields = artist ? fields.filter(field => artist?.[field.key]?.verified) : [];
  const verificationPercentage = artist && verifiedFields.length >= 0 ? Math.round((verifiedFields.length / fields.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Form */}
      <div className="bg-white shadow-lg rounded-xl mb-8">
        <div className="px-6 py-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Search for an Artist
          </h3>
          <p className="text-gray-600 mb-6">
            Enter the name of an Indian Classical Music artist to search for their information.
          </p>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                  placeholder="Enter artist name"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 font-medium">Use AI Research</span>
                </label>
              </div>
            </div>
            
            {/* AI Model Selection */}
            {useAI && (
              <div className="mt-4">
                <AIModelSelector
                  onModelChange={handleModelChange}
                  selectedProvider={selectedProvider}
                  selectedModel={selectedModel}
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <ClockIcon className="animate-spin h-5 w-5 mr-2" />
                  {useAI ? `${modelData?.name || 'AI'} Researching...` : 'Web Searching...'}
                </div>
              ) : (
                useAI ? 'AI Research' : 'Web Search'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Artist Information */}
      {artist && (
        <div className="space-y-6">
          {/* Header with Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {artist.name?.value || 'Artist Information'}
              </h3>
              <span className="text-sm text-gray-600">
                {verifiedFields.length}/{fields.length} fields verified ({verificationPercentage}%)
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  verificationPercentage === 100 ? 'bg-green-500' :
                  verificationPercentage > 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${verificationPercentage}%` }}
              ></div>
            </div>

            {/* Bulk Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    {selectedFields.size === fields.length ? 'Unselect All' : 'Select All'}
                  </button>
                  <span className="text-sm text-gray-600">
                    {selectedFields.size} of {fields.length} fields selected
                  </span>
                </div>
                
                {selectedFields.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkVerification(true)}
                      className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Verify Selected ({selectedFields.size})
                    </button>
                    <button
                      onClick={() => handleBulkVerification(false)}
                      className="flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Unverify Selected ({selectedFields.size})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-6">
            {fields.map(renderField)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistSearch;