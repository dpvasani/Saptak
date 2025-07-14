import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowTopRightOnSquareIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const TaalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [taal, setTaal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [aiProvider, setAiProvider] = useState('openai');
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedFields, setSelectedFields] = useState(new Set());

  const fields = [
    { key: 'name', label: 'Name' },
    { key: 'numberOfBeats', label: 'Number of Beats' },
    { key: 'divisions', label: 'Divisions' },
    { key: 'taali.count', label: 'Taali Count' },
    { key: 'taali.beatNumbers', label: 'Taali Beat Numbers' },
    { key: 'khaali.count', label: 'Khaali Count' },
    { key: 'khaali.beatNumbers', label: 'Khaali Beat Numbers' },
    { key: 'jaati', label: 'Jaati' }
  ];

  // Debounced search function
  const debouncedSearch = debounce(async (query, aiEnabled, provider) => {
    if (!query.trim()) {
      toast.error('Please enter a taal name');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/taals/search?name=${encodeURIComponent(query)}&useAI=${aiEnabled}&aiProvider=${provider}`);
      setTaal(response.data);
      toast.success(`Taal data ${aiEnabled ? `researched using ${provider.toUpperCase()} AI` : 'scraped from web'} successfully`);
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Error searching for taal');
      }
    } finally {
      setLoading(false);
    }
  }, 1000);

  const handleSearch = (e) => {
    e.preventDefault();
    debouncedSearch(searchQuery, useAI, aiProvider);
  };

  const getFieldValue = (field) => {
    if (!taal) return '';
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return taal[parent]?.[child]?.value || '';
    }
    return taal[field]?.value || '';
  };

  const getFieldVerified = (field) => {
    if (!taal) return false;
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return taal[parent]?.[child]?.verified || false;
    }
    return taal[field]?.verified || false;
  };

  const getFieldReference = (field) => {
    if (!taal) return '';
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return taal[parent]?.[child]?.reference || '';
    }
    return taal[field]?.reference || '';
  };

  const updateTaalField = (field, updates) => {
    setTaal(prevTaal => {
      const newTaal = { ...prevTaal };
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newTaal[parent] = {
          ...newTaal[parent],
          [child]: {
            ...newTaal[parent][child],
            ...updates
          }
        };
      } else {
        newTaal[field] = {
          ...newTaal[field],
          ...updates
        };
      }
      
      return newTaal;
    });
  };

  const handleFieldUpdate = async (field, value) => {
    if (!taal) return;

    const updatedTaal = { ...taal };
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedTaal[parent] = {
        ...updatedTaal[parent],
        [child]: {
          ...updatedTaal[parent][child],
          value
        }
      };
    } else {
      updatedTaal[field] = {
        ...updatedTaal[field],
        value
      };
    }

    try {
      const response = await axios.put(`http://localhost:5000/api/taals/${taal._id}`, updatedTaal);
      setTaal(response.data);
      toast.success('Taal updated successfully');
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Error updating taal');
      }
    }
  };

  const handleVerification = async (field, currentStatus) => {
    if (!taal) return;

    try {
      const updatedTaal = { ...taal };
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        updatedTaal[parent] = {
          ...updatedTaal[parent],
          [child]: {
            ...updatedTaal[parent][child],
            verified: !currentStatus
          }
        };
      } else {
        updatedTaal[field] = {
          ...updatedTaal[field],
          verified: !currentStatus
        };
      }

      await axios.put(`http://localhost:5000/api/taals/${taal._id}`, updatedTaal);
      
      // Update local state immediately
      updateTaalField(field, { verified: !currentStatus });
      
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
    setEditValue(getFieldValue(field));
  };

  const handleSave = async () => {
    try {
      const updatedTaal = { ...taal };
      
      if (editingField.includes('.')) {
        const [parent, child] = editingField.split('.');
        updatedTaal[parent] = {
          ...updatedTaal[parent],
          [child]: {
            ...updatedTaal[parent][child],
            value: editValue
          }
        };
      } else {
        updatedTaal[editingField] = {
          ...updatedTaal[editingField],
          value: editValue
        };
      }

      await axios.put(`http://localhost:5000/api/taals/${taal._id}`, updatedTaal);
      
      // Update local state immediately
      updateTaalField(editingField, { value: editValue });
      
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
      const updatedTaal = { ...taal };
      
      selectedFields.forEach(field => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          updatedTaal[parent] = {
            ...updatedTaal[parent],
            [child]: {
              ...updatedTaal[parent][child],
              verified: verify
            }
          };
        } else {
          updatedTaal[field] = {
            ...updatedTaal[field],
            verified: verify
          };
        }
      });

      await axios.put(`http://localhost:5000/api/taals/${taal._id}`, updatedTaal);
      setTaal(updatedTaal);
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
    if (!taal) return null;

    const value = getFieldValue(field.key);
    const verified = getFieldVerified(field.key);
    const reference = getFieldReference(field.key);
    const isEditing = editingField === field.key;
    const isSelected = selectedFields.has(field.key);

    return (
      <div key={field.key} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-200 hover:border-orange-300 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleFieldSelect(field.key)}
              className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
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
                  className="inline-flex items-center text-sm text-orange-700 hover:underline break-all"
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

  const verifiedFields = taal ? fields.filter(field => getFieldVerified(field.key)) : [];
  const verificationPercentage = taal && verifiedFields.length > 0 ? Math.round((verifiedFields.length / fields.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Form */}
      <div className="bg-white shadow-lg rounded-xl mb-8">
        <div className="px-6 py-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Search for a Taal
          </h3>
          <p className="text-gray-600 mb-6">
            Enter the name of a Taal to search for its information.
          </p>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                  placeholder="Enter taal name"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 font-medium">Use AI Research</span>
                </label>
                
                {useAI && (
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="rounded-lg border-gray-300 text-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                  >
                    <option value="openai">OpenAI (GPT-3.5)</option>
                    <option value="gemini">Google Gemini (Free)</option>
                  </select>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <ClockIcon className="animate-spin h-5 w-5 mr-2" />
                  {useAI ? `${aiProvider.toUpperCase()} Researching...` : 'Searching...'}
                </div>
              ) : (
                'Search'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Taal Information */}
      {taal && (
        <div className="space-y-6">
          {/* Header with Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {getFieldValue('name') || 'Taal Information'}
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
                    className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium"
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
                      className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Verify Selected ({selectedFields.size})
                    </button>
                    <button
                      onClick={() => handleBulkVerification(false)}
                      className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
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

export default TaalSearch;