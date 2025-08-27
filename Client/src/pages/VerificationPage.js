import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const VerificationPage = () => {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('markdown');
  const [bulkLoading, setBulkLoading] = useState(false);

  const categoryConfig = {
    artists: {
      title: 'Artists',
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
      title: 'Raags',
      fields: [
        { key: 'name', label: 'Name' },
        { key: 'aroha', label: 'Aroha' },
        { key: 'avroha', label: 'Avroha' },
        { key: 'chalan', label: 'Chalan' },
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
      title: 'Taals',
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
      badge: 'bg-green-100 text-green-800',
      tab: 'border-green-500 text-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      button: 'bg-purple-600 hover:bg-purple-700',
      badge: 'bg-purple-100 text-purple-800',
      tab: 'border-purple-500 text-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      button: 'bg-orange-600 hover:bg-orange-700',
      badge: 'bg-orange-100 text-orange-800',
      tab: 'border-orange-500 text-orange-600'
    }
  };

  const colors = colorClasses[config?.color] || colorClasses.green;

  useEffect(() => {
    if (config) {
      fetchData();
      fetchStats();
    }
  }, [category, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint = '';
      switch (activeTab) {
        case 'verified':
          endpoint = `http://localhost:5000/api/${category}/verified`;
          break;
        case 'unverified':
          endpoint = `http://localhost:5000/api/${category}/unverified`;
          break;
        case 'partial':
          endpoint = `http://localhost:5000/api/${category}/partial`;
          break;
        default:
          endpoint = `http://localhost:5000/api/${category}`;
      }
      
      const res = await axios.get(endpoint);
      
      // Handle different response formats
      if (res.data.data) {
        setItems(res.data.data);
      } else if (Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      setError(`Failed to load ${category}. Please try again.`);
      toast.error(`Failed to load ${category}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/${category}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error(`Error fetching ${category} stats:`, error);
    }
  };

  const getFieldValue = (item, field) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return item[parent]?.[child]?.value || '';
    }
    return item[field]?.value || '';
  };

  const getFieldVerified = (item, field) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return item[parent]?.[child]?.verified || false;
    }
    return item[field]?.verified || false;
  };

  const calculateVerificationPercentage = (item) => {
    if (!item || !config) return 0;
    
    const verifiedFields = config.fields.filter(field => getFieldVerified(item, field.key));
    return Math.round((verifiedFields.length / config.fields.length) * 100);
  };

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.warning('Please select items to delete');
      return;
    }

    setBulkLoading(true);
    try {
      const response = await axios.delete(`http://localhost:5000/api/${category}`, {
        data: { ids: Array.from(selectedItems) }
      });

      if (response.data.success) {
        toast.success(`${response.data.data.deletedCount} artists deleted successfully`);
        setSelectedItems(new Set());
        setShowDeleteConfirm(false);
        fetchData(); // Refresh the list
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting artists:', error);
      toast.error(error.response?.data?.message || 'Failed to delete artists');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = async (exportType = 'selected') => {
    setBulkLoading(true);
    try {
      let exportIds = null;
      let filename = '';
      
      if (exportType === 'selected') {
        if (selectedItems.size === 0) {
          toast.warning('Please select items to export');
          setBulkLoading(false);
          return;
        }
        exportIds = Array.from(selectedItems);
        filename = `selected-${config.title.toLowerCase()}-${exportIds.length}`;
      } else if (exportType === 'all') {
        exportIds = null; // Export all
        filename = `all-${config.title.toLowerCase()}-${items.length}`;
      }

      const response = await axios.post(`http://localhost:5000/api/${category}/export`, {
        format: exportFormat,
        ids: exportIds
      });

      if (exportFormat === 'markdown') {
        // Direct download for markdown
        const blob = new Blob([response.data], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Markdown file downloaded successfully');
      } else {
        // For PDF and Word, show data that can be processed by frontend
        console.log('Export data for frontend processing:', response.data);
        toast.success(`${exportFormat.toUpperCase()} export data prepared. Frontend processing needed.`);
        // Here you would integrate with a PDF/Word generation library
      }

      setShowExportModal(false);
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error(error.response?.data?.message || 'Failed to export data');
    } finally {
      setBulkLoading(false);
    }
  };

  const filterItemsByTab = (items) => {
    if (!items || !config) return [];

    switch (activeTab) {
      case 'verified':
        return items.filter(item => {
          const verifiedFields = config.fields.filter(field => getFieldVerified(item, field.key));
          return verifiedFields.length > 0;
        });
      
      case 'unverified':
        return items.filter(item => {
          const verifiedFields = config.fields.filter(field => getFieldVerified(item, field.key));
          return verifiedFields.length === 0;
        });
      
      case 'partial':
        return items.filter(item => {
          const verifiedFields = config.fields.filter(field => getFieldVerified(item, field.key));
          return verifiedFields.length > 0 && verifiedFields.length < config.fields.length;
        });
      
      default:
        return items;
    }
  };

  const tabs = [
    { id: 'all', label: 'All', count: items.length },
    { id: 'verified', label: 'Verified', count: stats?.partiallyVerified || 0 },
    { id: 'partial', label: 'Partially Verified', count: stats ? (stats.partiallyVerified - stats.fullyVerified) : 0 },
    { id: 'unverified', label: 'Unverified', count: stats?.unverified || 0 }
  ];

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
          <button 
            onClick={fetchData}
            className={`px-4 py-2 ${colors.button} text-white rounded-lg transition-colors duration-200`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredItems = filterItemsByTab(items);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{config.title} Verification</h1>
              <p className="text-gray-600 mt-1">Manage and verify {config.title.toLowerCase()} information</p>
            </div>
            
            {stats && (
              <div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className={`h-5 w-5 ${colors.text}`} />
                  <span className={`text-sm font-medium ${colors.text}`}>
                    {stats.total} Total • {stats.fullyVerified} Fully Verified • {stats.percentages.fullyVerified}% Complete
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? `${colors.tab} border-current`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id ? colors.badge : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Items List */}
        {/* Bulk Actions Bar */}
        {items.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  {selectedItems.size === filteredItems.length && filteredItems.length > 0 ? 'Unselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedItems.size} of {filteredItems.length} items selected
                </span>
              </div>
              
              {selectedItems.size > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
                  >
                    📄 Export Selected ({selectedItems.size})
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
                  >
                    🗑️ Delete Selected ({selectedItems.size})
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
                >
                  📄 Export All ({filteredItems.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No {activeTab} {config.title.toLowerCase()} found</p>
            <p className="text-gray-400 mt-2">Try switching to a different tab or search for new items</p>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => {
                    const verificationPercentage = calculateVerificationPercentage(item);
                    const verifiedFields = config.fields.filter(field => getFieldVerified(item, field.key));
                    
                    return (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item._id)}
                            onChange={() => handleSelectItem(item._id)}
                            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {getFieldValue(item, 'name') || 'Unnamed'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {item._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">
                                  {verifiedFields.length}/{config.fields.length} fields
                                </span>
                                <span className="font-medium text-gray-900">
                                  {verificationPercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    verificationPercentage === 100 ? 'bg-green-500' :
                                    verificationPercentage > 50 ? 'bg-yellow-500' : 
                                    verificationPercentage > 0 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${verificationPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            verificationPercentage === 100 ? 'bg-green-100 text-green-800' :
                            verificationPercentage > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {verificationPercentage === 100 ? (
                              <>
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Fully Verified
                              </>
                            ) : verificationPercentage > 0 ? (
                              <>
                                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                Partially Verified
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-3 w-3 mr-1" />
                                Unverified
                              </>
                            )}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/verification/${category}/${item._id}`}
                            className={`inline-flex items-center px-3 py-2 ${colors.button} text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md`}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="text-lg font-medium text-gray-900 mt-2">Confirm Deletion</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete {selectedItems.size} selected {config.title.toLowerCase()}? 
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors duration-200"
                    disabled={bulkLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                    disabled={bulkLoading}
                  >
                    {bulkLoading ? 'Deleting...' : `Delete ${selectedItems.size} Items`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 text-center mb-4">Export Options</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="markdown">Markdown (.md)</option>
                      <option value="pdf">PDF (.pdf)</option>
                      <option value="word">Word (.docx)</option>
                      <option value="json">JSON (.json)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleExport('selected')}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      disabled={selectedItems.size === 0 || bulkLoading}
                    >
                      {bulkLoading ? 'Exporting...' : `Export Selected (${selectedItems.size})`}
                    </button>
                    
                    <button
                      onClick={() => handleExport('all')}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                      disabled={bulkLoading}
                    >
                      {bulkLoading ? 'Exporting...' : `Export All (${filteredItems.length})`}
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors duration-200"
                    disabled={bulkLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Summary */}
        {stats && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total {config.title}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.fullyVerified}</div>
                <div className="text-sm text-gray-600">Fully Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.partiallyVerified - stats.fullyVerified}</div>
                <div className="text-sm text-gray-600">Partially Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.unverified}</div>
                <div className="text-sm text-gray-600">Unverified</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;