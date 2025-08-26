import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowTopRightOnSquareIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const VerificationDetail = () => {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectedFields, setSelectedFields] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');

  const categoryConfig = {
    artists: {
      title: 'Artist',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'guru', label: 'Guru' },
        { key: 'gharana', label: 'Gharana' },
        { key: 'notableAchievements', label: 'Notable Achievements' },
        { key: 'disciples', label: 'Disciples' },
        { key: 'summary', label: 'Comprehensive Summary' }
      ],
      color: 'green'
    },
    raags: {
      title: 'Raag',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'aroha', label: 'Aroha' },
        { key: 'avroha', label: 'Avroha' },
        { key: 'chalan', label: 'Chalan / Pakad' },
        { key: 'vadi', label: 'Vadi' },
        { key: 'samvadi', label: 'Samvadi' },
        { key: 'thaat', label: 'Thaat' },
        { key: 'rasBhaav', label: 'Ras-Bhaav' },
        { key: 'tanpuraTuning', label: 'Tanpura Tuning' },
        { key: 'timeOfRendition', label: 'Time of Rendition' }
      ],
      color: 'purple'
    },
    taals: {
      title: 'Taal',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'numberOfBeats', label: 'Number of Beats' },
        { key: 'divisions', label: 'Divisions' },
        { key: 'taali.count', label: 'Taali Count' },
        { key: 'taali.beatNumbers', label: 'Taali Beat Numbers' },
        { key: 'khaali.count', label: 'Khaali Count' },
        { key: 'khaali.beatNumbers', label: 'Khaali Beat Numbers' },
        { key: 'jaati', label: 'Jaati' }
      ],
      color: 'orange'
    }
  };

  const config = categoryConfig[category];
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      button: 'bg-green-600 hover:bg-green-700',
      badge: 'bg-green-100 text-green-800'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      button: 'bg-purple-600 hover:bg-purple-700',
      badge: 'bg-purple-100 text-purple-800'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      button: 'bg-orange-600 hover:bg-orange-700',
      badge: 'bg-orange-100 text-orange-800'
    }
  };

  const colors = colorClasses[config?.color] || colorClasses.green;

  useEffect(() => {
    if (config) {
      fetchItem();
    }
  }, [category, id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:5000/api/${category}/${id}`);
      setItem(response.data);
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      if (error.response?.status === 404) {
        setError(`${config.title} not found`);
      } else {
        setError(`Failed to load ${category}. Please try again.`);
      }
      toast.error(`Failed to load ${category}`);
    } finally {
      setLoading(false);
    }
  };

  const getFieldValue = (field) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return item[parent]?.[child]?.value || '';
    }
    return item[field]?.value || '';
  };

  const getFieldVerified = (field) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return item[parent]?.[child]?.verified || false;
    }
    return item[field]?.verified || false;
  };

  const getFieldReference = (field) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return item[parent]?.[child]?.reference || '';
    }
    return item[field]?.reference || '';
  };

  const updateItemField = (field, updates) => {
    setItem(prevItem => {
      const newItem = { ...prevItem };
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newItem[parent] = {
          ...newItem[parent],
          [child]: {
            ...newItem[parent][child],
            ...updates
          }
        };
      } else {
        newItem[field] = {
          ...newItem[field],
          ...updates
        };
      }
      
      return newItem;
    });
  };

  const handleVerification = async (field, currentStatus) => {
    try {
      const updatedItem = { ...item };
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        updatedItem[parent] = {
          ...updatedItem[parent],
          [child]: {
            ...updatedItem[parent][child],
            verified: !currentStatus
          }
        };
      } else {
        updatedItem[field] = {
          ...updatedItem[field],
          verified: !currentStatus
        };
      }

      await axios.put(`http://localhost:5000/api/${category}/${id}`, updatedItem);
      
      // Update local state immediately
      updateItemField(field, { verified: !currentStatus });
      
      toast.success(`${field} verification updated successfully`);
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification status');
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setEditValue(getFieldValue(field));
  };

  const handleSave = async () => {
    try {
      const updatedItem = { ...item };
      
      if (editingField.includes('.')) {
        const [parent, child] = editingField.split('.');
        updatedItem[parent] = {
          ...updatedItem[parent],
          [child]: {
            ...updatedItem[parent][child],
            value: editValue
          }
        };
      } else {
        updatedItem[editingField] = {
          ...updatedItem[editingField],
          value: editValue
        };
      }

      await axios.put(`http://localhost:5000/api/${category}/${id}`, updatedItem);
      
      // Update local state immediately
      updateItemField(editingField, { value: editValue });
      
      setEditingField(null);
      setEditValue('');
      
      toast.success('Field updated successfully');
    } catch (error) {
      console.error('Error updating field:', error);
      toast.error('Failed to update field');
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
            className={`inline-flex items-center text-sm ${colors.text} hover:underline break-all`}
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
                  className={`inline-flex items-center text-sm ${colors.text} hover:underline break-all`}
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
    if (selectedFields.size === config.fields.length) {
      setSelectedFields(new Set());
    } else {
      setSelectedFields(new Set(config.fields.map(field => field.key)));
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
      const updatedItem = { ...item };
      
      selectedFields.forEach(field => {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          updatedItem[parent] = {
            ...updatedItem[parent],
            [child]: {
              ...updatedItem[parent][child],
              verified: verify
            }
          };
        } else {
          updatedItem[field] = {
            ...updatedItem[field],
            verified: verify
          };
        }
      });

      await axios.put(`http://localhost:5000/api/${category}/${id}`, updatedItem);
      setItem(updatedItem);
      setSelectedFields(new Set());
      
      toast.success(`${selectedFields.size} fields ${verify ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Error in bulk verification:', error);
      toast.error('Failed to update verification status');
    }
  };

  const renderField = (field) => {
    if (!item) return null;

    const value = getFieldValue(field.key);
    const verified = getFieldVerified(field.key);
    const reference = getFieldReference(field.key);
    const isEditing = editingField === field.key;
    const isSelected = selectedFields.has(field.key);

    return (
      <div key={field.key} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-200 hover:border-primary-300 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleFieldSelect(field.key)}
              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className={`flex items-center px-4 py-2 ${colors.button} text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md`}
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

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Invalid category: {category}</p>
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading {config.title.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={fetchItem}
              className={`px-4 py-2 ${colors.button} text-white rounded-lg transition-colors duration-200`}
            >
              Retry
            </button>
            <Link 
              to={`/verification/${category}`}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const verifiedFields = config.fields.filter(field => getFieldVerified(field.key));
  const verificationPercentage = Math.round((verifiedFields.length / config.fields.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              to={`/verification/${category}`}
              className="mr-4 p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getFieldValue('name') || `${config.title} Details`}
              </h1>
              <p className="text-gray-600 mt-1">
                Verification: {verifiedFields.length}/{config.fields.length} fields ({verificationPercentage}%)
              </p>
            </div>
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
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  {selectedFields.size === config.fields.length ? 'Unselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedFields.size} of {config.fields.length} fields selected
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
          {config.fields.map(renderField)}
        </div>

        {/* Metadata */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Updated:</span>
              <span className="ml-2 text-gray-600">
                {new Date(item.updatedAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">ID:</span>
              <span className="ml-2 text-gray-600 font-mono text-xs">{item._id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Verification Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                verificationPercentage === 100 ? 'bg-green-100 text-green-800' :
                verificationPercentage > 0 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {verificationPercentage === 100 ? 'Fully Verified' :
                 verificationPercentage > 0 ? 'Partially Verified' :
                 'Unverified'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDetail;