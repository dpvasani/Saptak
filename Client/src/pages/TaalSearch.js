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

const TaalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [taal, setTaal] = useState(null);
  const [allAboutData, setAllAboutData] = useState(null);
  const [loading, setLoading] = useState(false);
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

  // Debounced structured search function
  const debouncedStructuredSearch = debounce(async (query, aiEnabled, provider, model, modelData) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/taals/search?name=${encodeURIComponent(query)}&useAI=${aiEnabled}&aiProvider=${provider}&aiModel=${model}`);
      setTaal(response.data);
      toast.success(`Taal data ${aiEnabled ? `researched using ${modelData?.name || model}` : 'scraped from web'} successfully`);
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

  // All About search function
  const handleAllAboutSearch = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/taals/all-about?name=${encodeURIComponent(query)}`);
      setAllAboutData(response.data.data);
      toast.success('All About search completed successfully');
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

  const renderSources = (reference) => {
    if (!reference) return null;

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

    const sources = reference.split(' | ').map(source => source.trim()).filter(source => source.length > 0);

    if (sources.length === 1) {
      const source = sources[0];
      const isValidUrl = source.startsWith('http://') || source.startsWith('https://');
      
      if (isValidUrl) {
        return (
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-orange-700 hover:underline break-all"
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
                  className="inline-flex items-center text-sm text-orange-700 hover:underline break-all"
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
                <div className="space-y-2">
                  {renderSources(reference)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderSources = (reference) => {
    if (!reference) return null;

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

    const sources = reference.split(' | ').map(source => source.trim()).filter(source => source.length > 0);

    if (sources.length === 1) {
      const source = sources[0];
      const isValidUrl = source.startsWith('http://') || source.startsWith('https://');
      
      if (isValidUrl) {
        return (
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-orange-700 hover:underline break-all"
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
                  className="inline-flex items-center text-sm text-orange-700 hover:underline break-all"
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
                <div className="space-y-2">
                  {renderSources(reference)}
                </div>
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
    <div className="max-w-6xl mx-auto">
      {/* Dual Mode Search Form */}
      <DualModeSearchForm
        onStructuredSearch={debouncedStructuredSearch}
        onAllAboutSearch={handleAllAboutSearch}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Enter taal name"
        category="taal"
      />

      {/* Results Container */}
      <div className="space-y-8">
        {/* Option 1: Structured Mode Results */}
        {taal && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-6 border border-orange-200">
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

        {/* Option 2: All About Mode Results */}
        {allAboutData && (
          <AllAboutDisplay data={allAboutData} category="taal" />
        )}
      </div>
    </div>
  );
};

export default TaalSearch;