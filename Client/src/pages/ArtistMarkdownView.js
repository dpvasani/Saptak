import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../utils/api';
import { toast } from 'react-toastify';
import AllAboutDisplay from '../components/AllAboutDisplay';
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const ArtistMarkdownView = () => {
  const { category, id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllAboutData, setShowAllAboutData] = useState(false);

  const categoryConfig = {
    artists: {
      title: 'Artist',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'guru', label: 'Guru' },
        { key: 'gharana', label: 'Gharana' },
        { key: 'notableAchievements', label: 'Notable Achievements' },
        { key: 'disciples', label: 'Disciples' },
        { key: 'summary', label: 'Summary' }
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
        { key: 'timeOfRendition', label: 'Time of Rendition' },
        { key: 'summary', label: 'Summary' }
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
        { key: 'jaati', label: 'Jaati' },
        { key: 'summary', label: 'Summary' }
      ],
      color: 'orange'
    }
  };

  const config = categoryConfig[category];

  useEffect(() => {
    if (config) {
      fetchItem();
    }
  }, [category, id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (category === 'artists') {
        response = await apiService.getArtistById(id);
      } else if (category === 'raags') {
        response = await apiService.getRaagById(id);
      } else if (category === 'taals') {
        response = await apiService.getTaalById(id);
      }
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

  const handleExport = async (format) => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to export data');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/${category}/${id}/export?format=${format}`, {
        responseType: format === 'markdown' ? 'text' : 'json',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (format === 'markdown') {
        const blob = new Blob([response.data], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${getFieldValue('name').replace(/[^a-zA-Z0-9]/g, '-')}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast.success(`${config.title} exported successfully`);
    } catch (error) {
      console.error('Error exporting item:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to export data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        toast.error('Failed to export item');
      }
    }
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
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
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
            
            {/* Export Button */}
            <button
              onClick={() => handleExport('markdown')}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export Markdown
            </button>
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
        </div>

        {/* Markdown-style Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6 border-b-2 border-gray-200 pb-4">
            {getFieldValue('name')}
          </h1>

          {/* Summary Section */}
          {getFieldValue('summary') && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                Summary
                {getFieldVerified('summary') ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
                ) : (
                  <XCircleIcon className="h-6 w-6 text-red-500 ml-2" />
                )}
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {getFieldValue('summary')}
                </p>
                {getFieldReference('summary') && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm text-blue-600">
                      <strong>Source:</strong>{' '}
                      <a
                        href={getFieldReference('summary')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline inline-flex items-center"
                      >
                        {getFieldReference('summary')}
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details Section */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Details</h2>
          
          <div className="space-y-6">
            {config.fields
              .filter(field => field.key !== 'name' && field.key !== 'summary')
              .map((field) => {
                const value = getFieldValue(field.key);
                const verified = getFieldVerified(field.key);
                const reference = getFieldReference(field.key);

                if (!value) return null;

                return (
                  <div key={field.key} className="border-l-4 border-gray-300 pl-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                      {field.label}
                      {verified ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500 ml-2" />
                      )}
                    </h3>
                    <p className="text-gray-700 mb-2 whitespace-pre-wrap">{value}</p>
                    {reference && (
                      <p className="text-sm text-gray-500">
                        <strong>Source:</strong>{' '}
                        <a
                          href={reference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center"
                        >
                          {reference}
                          <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                        </a>
                      </p>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Summary Mode Data Section */}
          {item?.allAboutData && (
            <div className="mt-8">
              <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      📝 Summary Mode Data
                    </h3>
                    <button
                      onClick={() => setShowAllAboutData(!showAllAboutData)}
                      className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                      {showAllAboutData ? 'Hide' : 'Show'} Summary Data
                    </button>
                  </div>
                </div>
                
                {showAllAboutData && (
                  <div className="p-6">
                    <AllAboutDisplay
                      data={item.allAboutData}
                      category={category}
                      onDataUpdate={(updatedData) => {
                        setItem(prevItem => ({
                          ...prevItem,
                          allAboutData: updatedData
                        }));
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sources Section */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">All Sources</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-2">
              {config.fields.map((field) => {
                const reference = getFieldReference(field.key);
                if (!reference) return null;

                return (
                  <li key={field.key} className="flex items-start">
                    <span className="font-medium text-gray-700 min-w-0 flex-shrink-0 w-32">
                      {field.label}:
                    </span>
                    <a
                      href={reference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all inline-flex items-start ml-2"
                    >
                      {reference}
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1 flex-shrink-0 mt-0.5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Metadata Section */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">Metadata</h2>
          <div className="bg-gray-50 rounded-lg p-4">
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
    </div>
  );
};

export default ArtistMarkdownView;