import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import DualModeSearchForm from '../components/DualModeSearchForm';
import AllAboutDisplay from '../components/AllAboutDisplay';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowTopRightOnSquareIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ArtistSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [artist, setArtist] = useState(null);
  const [allAboutData, setAllAboutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedFields, setSelectedFields] = useState(new Set());

  const fields = [
    { key: 'name', label: 'Name' },
    { key: 'guru', label: 'Guru' },
    { key: 'gharana', label: 'Gharana' },
    { key: 'notableAchievements', label: 'Notable Achievements' },
    { key: 'disciples', label: 'Disciples' },
    { key: 'summary', label: 'Comprehensive Summary' }
  ];

  // Debounced structured search function
  const debouncedStructuredSearch = debounce(async (query, aiEnabled, provider, model, modelData) => {
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

  // All About search function
  const handleAllAboutSearch = async (query, provider, model, modelData) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/artists/all-about?name=${encodeURIComponent(query)}&aiProvider=${provider}&aiModel=${model}`);
      setAllAboutData(response.data.data);
      toast.success(`All About search completed using ${modelData?.name || model}`);
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Error in All About search');
      }
    } finally {
      setLoading(false);
    }
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

  const renderSources = (reference) => {
    if (!reference) return null;

    // Check if it's a "no source" message
    const noSourceIndicators = [
      'no authoritative sources',
      'information not found',
      'no reliable information',
      'no specific',
      'not available',
      'no official',
      'sources not found'
    ];

    const isNoSourceMessage = noSourceIndicators.some(indicator => 
      reference.toLowerCase().includes(indicator)
    );

    if (isNoSourceMessage) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">No Sources Available</p>
              <p className="text-sm text-amber-700 mt-1">{reference}</p>
            </div>
          </div>
        </div>
      );
    }

    // Check if it contains multiple sources (separated by |)
    const sources = reference.split(' | ').map(source => source.trim()).filter(source => source.length > 0);

    if (sources.length === 1) {
      // Single source
      const source = sources[0];
      const isValidUrl = source.startsWith('http://') || source.startsWith('https://');
      
      if (isValidUrl) {
        return (
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-green-700 hover:underline break-all"
          >
            {source}
            <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 flex-shrink-0" />
          </a>
        );
      } else {
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">{source}</p>
          </div>
        );
      }
    }

    // Multiple sources
    return (
      <div className="space-y-2">
        {sources.map((source, index) => {
          const isValidUrl = source.startsWith('http://') || source.startsWith('https://');
          
          return (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-sm font-medium text-gray-600 mt-1 flex-shrink-0">
                Link {index + 1}:
              </span>
              {isValidUrl ? (
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-green-700 hover:underline break-all"
                >
                  {source}
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 flex-shrink-0" />
                </a>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex-1">
                  <p className="text-sm text-gray-700">{source}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
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
              rows={field.key === 'summary' ? 8 : 3}
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
                {renderSources(reference)}
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
    <div className="max-w-6xl mx-auto">
      {/* Dual Mode Search Form */}
      <DualModeSearchForm
        onStructuredSearch={debouncedStructuredSearch}
        onAllAboutSearch={handleAllAboutSearch}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Enter artist name"
        category="artist"
      />

      {/* Results Container */}
      <div className="space-y-8">
        {/* Option 1: Structured Mode Results */}
        {artist && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                📊 Structured Mode Results
              </h3>
              <p className="text-gray-600">
                Organized field data with verification capabilities
              </p>
            </div>

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

        {/* Option 2: All About Mode Results */}
        {allAboutData && (
          <AllAboutDisplay data={allAboutData} category="artist" />
        )}
      </div>
    </div>
  );
};

export default ArtistSearch;