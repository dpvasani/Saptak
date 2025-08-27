import React from 'react';
import { useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { toast } from 'react-toastify';
import { 
  ArrowTopRightOnSquareIcon,
  PhotoIcon,
  LinkIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AllAboutDisplay = ({ data, category, onDataUpdate }) => {
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  if (!data) return null;

  const handleEdit = (field) => {
    setEditingField(field);
    setEditValue(localData[field]?.value || '');
  };

  const handleSave = async () => {
    try {
      // Update the All About data in database
      const updateData = {
        [editingField]: {
          ...localData[editingField],
          value: editValue
        }
      };
      
      // Use the appropriate API service method based on category
      if (category === 'artists') {
        await apiService.updateArtist(localData._id, updateData);
      } else if (category === 'raags') {
        await apiService.updateRaag(localData._id, updateData);
      } else if (category === 'taals') {
        await apiService.updateTaal(localData._id, updateData);
      }
      
      // Update local state
      const updatedData = {
        ...localData,
        [editingField]: {
          ...localData[editingField],
          value: editValue
        }
      };
      
      setLocalData(updatedData);
      if (onDataUpdate) {
        onDataUpdate(updatedData);
      }
      
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

  const handleVerification = async (field, currentStatus) => {
    try {
      const updateData = {
        [field]: {
          ...localData[field],
          verified: !currentStatus
        }
      };
      
      // Use the appropriate API service method based on category
      if (category === 'artists') {
        await apiService.updateArtist(localData._id, updateData);
      } else if (category === 'raags') {
        await apiService.updateRaag(localData._id, updateData);
      } else if (category === 'taals') {
        await apiService.updateTaal(localData._id, updateData);
      }
      
      // Update local state
      const updatedData = {
        ...localData,
        [field]: {
          ...localData[field],
          verified: !currentStatus
        }
      };
      
      setLocalData(updatedData);
      if (onDataUpdate) {
        onDataUpdate(updatedData);
      }
      
      toast.success(`${field} verification updated successfully`);
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification status');
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;

    // Simple and effective markdown parsing
    const lines = text.split('\n');
    const elements = [];
    let currentList = [];
    let listType = null;

    const flushList = () => {
      if (currentList.length > 0) {
        if (listType === 'ul') {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-4 ml-4">
              {currentList.map((item, idx) => (
                <li key={idx} className="text-gray-700 leading-relaxed">{item}</li>
              ))}
            </ul>
          );
        }
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushList();
        return;
      }

      // Headers
      if (trimmedLine.startsWith('### ')) {
        flushList();
        const headerText = trimmedLine.replace(/^### /, '').replace(/\*\*(.*?)\*\*/g, '$1');
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg font-semibold text-gray-800 mt-6 mb-3 border-b border-gray-200 pb-1">
            {headerText}
          </h3>
        );
      } else if (trimmedLine.startsWith('## ')) {
        flushList();
        const headerText = trimmedLine.replace(/^## /, '').replace(/\*\*(.*?)\*\*/g, '$1');
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-gray-800 mt-6 mb-4 border-b-2 border-gray-300 pb-2">
            {headerText}
          </h2>
        );
      } else if (trimmedLine.startsWith('# ')) {
        flushList();
        const headerText = trimmedLine.replace(/^# /, '').replace(/\*\*(.*?)\*\*/g, '$1');
        elements.push(
          <h1 key={`h1-${index}`} className="text-2xl font-bold text-gray-900 mt-6 mb-4 border-b-2 border-gray-400 pb-3">
            {headerText}
          </h1>
        );
      }
      // Bullet points
      else if (trimmedLine.startsWith('- ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        const listItem = trimmedLine.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        currentList.push(
          <span dangerouslySetInnerHTML={{ __html: listItem }} />
        );
      }
      // Horizontal rules
      else if (trimmedLine === '---') {
        flushList();
        elements.push(<hr key={`hr-${index}`} className="my-6 border-gray-300" />);
      }
      // Regular paragraphs
      else {
        flushList();
        const processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: processedLine }} />
        );
      }
    });

    // Flush any remaining list
    flushList();

    return (
      <div className="markdown-content prose prose-lg max-w-none">
        {elements}
      </div>
    );
  };

  const renderImages = () => {
    if (!localData.images || localData.images.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <PhotoIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No images found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {localData.images.map((image, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden border">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={image.url}
                alt={image.title || `Image ${index + 1}`}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden w-full h-48 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <PhotoIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Image unavailable</p>
                </div>
              </div>
            </div>
            {(image.title || image.description) && (
              <div className="p-3">
                {image.title && (
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{image.title}</h4>
                )}
                {image.description && (
                  <p className="text-xs text-gray-600">{image.description}</p>
                )}
                {image.source && (
                  <a
                    href={image.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-blue-600 hover:underline mt-1"
                  >
                    View Source
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSources = () => {
    if (!localData.sources || localData.sources.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <LinkIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No sources found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {localData.sources.map((source, index) => (
          <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 mb-1">
                  {source.title || `Source ${index + 1}`}
                </h4>
                {source.snippet && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                    {source.snippet}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {source.domain || 'Unknown Domain'}
                  </span>
                  <span className="capitalize">
                    {source.type || 'source'}
                  </span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium"
                >
                  Visit
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
            📝 "All About" Mode Results
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <ClockIcon className="h-4 w-4" />
            <span>{new Date(localData.metadata?.timestamp).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-green-400">Search Query:</span>
            <span className="text-gray-300 font-mono">{localData.metadata?.searchQuery}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="font-medium text-green-400">AI Provider:</span>
            <span className="text-gray-300">{localData.metadata?.aiProvider} - {localData.metadata?.aiModel}</span>
          </div>
        </div>
      </div>

      {/* Answer Section */}
      <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-2">
          <h4 className="text-xl font-semibold text-white flex items-center">
            📝 Answer
            {localData.answer?.verified ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500 ml-2" />
            )}
          </h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit('answer')}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors duration-200 rounded-lg hover:bg-gray-800 hover:bg-opacity-50"
              title="Edit answer"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleVerification('answer', localData.answer?.verified)}
              className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                localData.answer?.verified
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 shadow-sm'
                  : 'bg-red-100 text-red-800 hover:bg-red-200 shadow-sm'
              }`}
            >
              {localData.answer?.verified ? 'Verified' : 'Unverified'}
            </button>
          </div>
        </div>
        
        {editingField === 'answer' ? (
          <div className="space-y-4">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-white placeholder-gray-400"
              rows={12}
              placeholder="Edit answer content..."
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-lg max-w-none markdown-content bg-gray-800 bg-opacity-30 rounded-lg p-4 border border-gray-700">
            {renderMarkdown(localData.answer?.value || 'No answer provided')}
          </div>
        )}
      </div>

      {/* Images Section */}
      <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-800">
        <h4 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2 flex items-center">
          <PhotoIcon className="h-6 w-6 mr-2 text-green-400" />
          Images ({localData.images?.length || 0})
        </h4>
        {renderImages()}
      </div>

      {/* Sources Section */}
      <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-800">
        <h4 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2 flex items-center">
          <LinkIcon className="h-6 w-6 mr-2 text-green-400" />
          Sources ({localData.sources?.length || 0})
        </h4>
        {renderSources()}
      </div>

      

      {/* Citations Section */}
      {localData.citations && localData.citations.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-emerald-200">
          <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b border-emerald-200 pb-2">
            📚 Citations ({localData.citations.length})
          </h4>
          <div className="space-y-3">
            {localData.citations.map((citation, index) => (
              <div key={index} className="bg-emerald-50 rounded-lg p-3 text-sm border border-emerald-100">
                <div className="font-medium text-gray-900 mb-1">
                  [{index + 1}] {citation.title || 'Citation'}
                </div>
                {citation.url && (
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline break-all"
                  >
                    {citation.url}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAboutDisplay;