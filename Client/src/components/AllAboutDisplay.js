import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  ArrowTopRightOnSquareIcon,
  PhotoIcon,
  LinkIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AllAboutDisplay = ({ data, category }) => {
  if (!data) return null;

  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (field) => {
    setEditingField(field);
    setEditValue(data[field]?.value || '');
  };

  const handleSave = async () => {
    try {
      // Update the All About data in database
      const response = await axios.put(`http://localhost:5000/api/all-about/${data._id}`, {
        [editingField]: {
          ...data[editingField],
          value: editValue
        }
      });
      
      // Update local state
      data[editingField] = {
        ...data[editingField],
        value: editValue
      };
      
      setEditingField(null);
      setEditValue('');
      
      toast.success('Field updated successfully');
    } catch (error) {
      toast.error('Failed to update field');
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleVerification = async (field, currentStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/all-about/${data._id}`, {
        [field]: {
          ...data[field],
          verified: !currentStatus
        }
      });
      
      // Update local state
      data[field].verified = !currentStatus;
      
      toast.success(`${field} verification updated successfully`);
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const renderImages = () => {
    if (!data.images || data.images.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <PhotoIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No images found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.images.map((image, index) => (
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
    if (!data.sources || data.sources.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <LinkIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No sources found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {data.sources.map((source, index) => (
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

  const renderRelatedQuestions = () => {
    if (!data.relatedQuestions || data.relatedQuestions.length === 0) {
      return null;
    }

    return (
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
          <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
          Related Questions
        </h4>
        <div className="space-y-2">
          {data.relatedQuestions.map((question, index) => (
            <div key={index} className="text-sm text-blue-800 bg-white rounded px-3 py-2">
              {question}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">
            "All About" Results
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ClockIcon className="h-4 w-4" />
            <span>{new Date(data.metadata?.timestamp).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-purple-100">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-purple-700">Search Query:</span>
            <span className="text-gray-600 font-mono">{data.metadata?.searchQuery}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="font-medium text-purple-700">AI Provider:</span>
            <span className="text-gray-600">{data.metadata?.aiProvider} - {data.metadata?.aiModel}</span>
          </div>
        </div>
      </div>

      {/* Answer Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
          <h4 className="text-xl font-semibold text-gray-900 flex items-center">
            📝 Answer
            {data.answer?.verified ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500 ml-2" />
            )}
          </h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit('answer')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
              title="Edit answer"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleVerification('answer', data.answer?.verified)}
              className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                data.answer?.verified
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 shadow-sm'
                  : 'bg-red-100 text-red-800 hover:bg-red-200 shadow-sm'
              }`}
            >
              {data.answer?.verified ? 'Verified' : 'Unverified'}
            </button>
          </div>
        </div>
        
        {editingField === 'answer' ? (
          <div className="space-y-4">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={12}
              placeholder="Edit answer content..."
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
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
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap markdown-content">
              {data.answer?.value || 'No answer provided'}
            </div>
          </div>
        )}
      </div>

      {/* Images Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2 flex items-center">
          <PhotoIcon className="h-6 w-6 mr-2 text-blue-600" />
          Images ({data.images?.length || 0})
        </h4>
        {renderImages()}
      </div>

      {/* Sources Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2 flex items-center">
          <LinkIcon className="h-6 w-6 mr-2 text-green-600" />
          Sources ({data.sources?.length || 0})
        </h4>
        {renderSources()}
      </div>

      {/* Related Questions Section */}
      {data.relatedQuestions && data.relatedQuestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Related Questions
          </h4>
          {renderRelatedQuestions()}
        </div>
      )}

      {/* Citations Section */}
      {data.citations && data.citations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
            📚 Citations ({data.citations.length})
          </h4>
          <div className="space-y-3">
            {data.citations.map((citation, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="font-medium text-gray-900 mb-1">
                  [{index + 1}] {citation.title || 'Citation'}
                </div>
                {citation.url && (
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
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