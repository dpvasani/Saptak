import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../utils/api';

const VerificationPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending');

  useEffect(() => {
    if (id) {
      // If ID is provided, fetch specific item
      fetchItem();
    } else {
      // If no ID, fetch list of items that need verification
      fetchItemsForVerification();
    }
  }, [type, id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      let response;
      
      switch (type) {
        case 'artist':
          response = await fetch(`/api/artists/${id}`);
          break;
        case 'raag':
          response = await fetch(`/api/raags/${id}`);
          break;
        case 'taal':
          response = await fetch(`/api/taals/${id}`);
          break;
        default:
          throw new Error('Invalid type');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch item');
      }

      const data = await response.json();
      setItem(data);
      setVerificationStatus(data.verificationStatus || 'pending');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemsForVerification = async () => {
    try {
      setLoading(true);
      let response;
      
      switch (type) {
        case 'artist':
          response = await apiService.getUnverifiedArtists();
          break;
        case 'raag':
          response = await apiService.getUnverifiedRaags();
          break;
        case 'taal':
          response = await apiService.getUnverifiedTaals();
          break;
        default:
          throw new Error('Invalid type');
      }

      console.log('API Response:', response); // Debug log
      
      // Handle different response structures
      let itemsArray = [];
      if (response && response.data) {
        // Server returns { count: number, data: array }
        if (response.data.data && Array.isArray(response.data.data)) {
          itemsArray = response.data.data;
        }
        // If response.data is an array, use it directly (fallback)
        else if (Array.isArray(response.data)) {
          itemsArray = response.data;
        } 
        // If response.data has a nested array property, try to find it
        else if (response.data.items && Array.isArray(response.data.items)) {
          itemsArray = response.data.items;
        }
        // If response.data has an array property matching the type, try to find it
        else if (response.data[type] && Array.isArray(response.data[type])) {
          itemsArray = response.data[type];
        }
        // If response.data is an object with array values, try to find any array
        else if (typeof response.data === 'object') {
          const arrayValues = Object.values(response.data).filter(val => Array.isArray(val));
          if (arrayValues.length > 0) {
            itemsArray = arrayValues[0];
          }
        }
      }
      
      console.log('Processed items array:', itemsArray); // Debug log
      setItems(itemsArray);
    } catch (err) {
      console.error('Error fetching items:', err); // Debug log
      setError(err.message);
      setItems([]); // Ensure items is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (status) => {
    try {
      let response;
      
      switch (type) {
        case 'artist':
          response = await apiService.verifyArtist(id, status);
          break;
        case 'raag':
          response = await apiService.verifyRaag(id, status);
          break;
        case 'taal':
          response = await apiService.verifyTaal(id, status);
          break;
        default:
          throw new Error('Invalid type');
      }

      if (response.success) {
        setVerificationStatus(status);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Failed to update verification status');
    }
  };

  // If no ID is provided, show list of items for verification
  if (!id) {
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  Verify {type.charAt(0).toUpperCase() + type.slice(1)}s
                </h1>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              {!Array.isArray(items) || items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {!Array.isArray(items) 
                      ? `Error: Expected array but got ${typeof items}. Check console for details.`
                      : `No ${type}s found that need verification.`
                    }
                  </p>
                  {!Array.isArray(items) && (
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Reload Page
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.name?.value || item.name || 'Unnamed'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Status: <span className="font-medium text-yellow-600">Pending Verification</span>
                      </p>
                      <button
                        onClick={() => navigate(`/verification/${type}/${item._id}`)}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                      >
                        Review & Verify
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original single item verification logic
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h1>
          <p className="text-gray-600 mb-4">The requested item could not be found.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderItemDetails = () => {
    switch (type) {
      case 'artist':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Name</h3>
              <p className="text-gray-700">{item.name?.value || 'N/A'}</p>
              {item.name?.reference && (
                <a href={item.name.reference} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                  Source
                </a>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Guru</h3>
              <p className="text-gray-700">{item.guru?.value || 'N/A'}</p>
              {item.guru?.reference && (
                <a href={item.guru.reference} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                  Source
                </a>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gharana</h3>
              <p className="text-gray-700">{item.gharana?.value || 'N/A'}</p>
              {item.gharana?.reference && (
                <a href={item.gharana.reference} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                  Source
                </a>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
              <p className="text-gray-700">{item.summary?.value || 'N/A'}</p>
              {item.summary?.reference && (
                <a href={item.summary.reference} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                  Source
                </a>
              )}
            </div>
          </div>
        );
      
      case 'raag':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Name</h3>
              <p className="text-gray-700">{item.name?.value || 'N/A'}</p>
              {item.name?.reference && (
                <a href={item.name.reference} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                  Source
                </a>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Thaat</h3>
              <p className="text-gray-700">{item.thaat?.value || 'N/A'}</p>
              {item.thaat?.reference && (
                <a href={item.thaat.reference} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                  Source
                </a>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <p className="text-gray-700">{item.description?.value || 'N/A'}</p>
              {item.description?.reference && (
                <a href={item.description.reference} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                  Source
                </a>
              )}
            </div>
          </div>
        );
      
      case 'taal':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Name</h3>
              <p className="text-gray-700">{item.name?.value || 'N/A'}</p>
              {item.name?.reference && (
                <a href={item.name.reference} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                  Source
                </a>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Beats</h3>
              <p className="text-gray-700">{item.beats?.value || 'N/A'}</p>
              {item.beats?.reference && (
                <a href={item.beats.reference} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                  Source
                </a>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <p className="text-gray-700">{item.description?.value || 'N/A'}</p>
              {item.description?.reference && (
                <a href={item.description.reference} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                  Source
                </a>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Verify {type.charAt(0).toUpperCase() + type.slice(1)}
              </h1>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                  verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h2>
                {renderItemDetails()}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Actions</h2>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Current Status</h3>
                    <p className="text-gray-600">
                      This {type} is currently marked as {verificationStatus}.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleVerification('verified')}
                      disabled={verificationStatus === 'verified'}
                      className={`w-full px-4 py-2 rounded-md font-medium ${
                        verificationStatus === 'verified'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      Mark as Verified
                    </button>
                    
                    <button
                      onClick={() => handleVerification('rejected')}
                      disabled={verificationStatus === 'rejected'}
                      className={`w-full px-4 py-2 rounded-md font-medium ${
                        verificationStatus === 'rejected'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      Mark as Rejected
                    </button>
                    
                    <button
                      onClick={() => handleVerification('pending')}
                      disabled={verificationStatus === 'pending'}
                      className={`w-full px-4 py-2 rounded-md font-medium ${
                        verificationStatus === 'pending'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      Mark as Pending
                    </button>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
