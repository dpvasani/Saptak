import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  EyeIcon,
  PencilIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const VerificationPage = () => {
  const { category } = useParams();
  const [activeTab, setActiveTab] = useState('all');
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedField, setSelectedField] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const categoryConfig = {
    artists: {
      title: 'Artists',
      fields: ['name', 'guru', 'gharana', 'notableAchievements', 'disciples', 'summary'],
      color: 'green'
    },
    raags: {
      title: 'Raags',
      fields: ['name', 'aroha', 'avroha', 'chalan', 'vadi', 'samvadi', 'thaat', 'rasBhaav', 'tanpuraTuning', 'timeOfRendition', 'summary'],
      color: 'purple'
    },
    taals: {
      title: 'Taals',
      fields: ['name', 'numberOfBeats', 'divisions', 'taali.count', 'taali.beatNumbers', 'khaali.count', 'khaali.beatNumbers', 'jaati', 'summary'],
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
      fetchData();
      fetchStats();
    }
  }, [category, activeTab, selectedField]);

  useEffect(() => {
    handleSearch();
  }, [data, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `http://localhost:5000/api/${category}`;
      
      if (activeTab === 'verified') {
        url += '/verified';
      } else if (activeTab === 'unverified') {
        url += '/unverified';
      } else if (activeTab === 'partial') {
        url += '/partial';
      }
      
      if (selectedField) {
        url += `?field=${selectedField}`;
      }
      
      const response = await axios.get(url);
      setData(response.data.data || response.data);
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

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      
      // Search in all fields
      return config.fields.some(field => {
        const value = getFieldValue(item, field);
        return value && value.toLowerCase().includes(searchLower);
      });
    });

    setFilteredData(filtered);
  };

  const handleVerification = async (id, field, currentStatus) => {
    try {
      const item = data.find(d => d._id === id);
      if (!item) return;

      const updatedItem = {
        ...item,
        [field]: {
          ...item[field],
          verified: !currentStatus
        }
      };

      await axios.put(`http://localhost:5000/api/${category}/${id}`, updatedItem);
      
      // Update local state
      setData(prevData => 
        prevData.map(d => 
          d._id === id ? updatedItem : d
        )
      );
      
      toast.success(`${field} verification updated successfully`);
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification status');
    }
  };

  const handleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map(item => item._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.warning('Please select items to delete');
      return;
    }

    try {
      const deletePromises = Array.from(selectedItems).map(id =>
        axios.delete(`http://localhost:5000/api/${category}/${id}`)
      );
      
      await Promise.all(deletePromises);
      
      toast.success(`${selectedItems.size} ${category} deleted successfully`);
      setSelectedItems(new Set());
      setShowDeleteModal(false);
      fetchData();
      fetchStats();
    } catch (error) {
      console.error('Error deleting items:', error);
      toast.error('Failed to delete items');
    }
  };

  const handleSingleDelete = async (itemId) => {
    if (window.confirm(`Are you sure you want to delete this ${category.slice(0, -1)}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/${category}/${itemId}`);
        toast.success(`${category.slice(0, -1)} deleted successfully`);
        fetchData();
        fetchStats();
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
      }
    }
  };

  const handleSingleExport = async (itemId, format) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/${category}/${itemId}/export?format=${format}`, {
        responseType: format === 'markdown' ? 'text' : 'json'
      });
      
      if (format === 'markdown') {
        const blob = new Blob([response.data], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${category.slice(0, -1)}-${itemId}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast.success(`${category.slice(0, -1)} exported successfully`);
    } catch (error) {
      console.error('Error exporting item:', error);
      toast.error('Failed to export item');
    }
  };

  const exportData = async (format) => {
    try {
      let url = `http://localhost:5000/api/${category}/export?format=${format}`;
      
      // If items are selected, export only selected items
      if (selectedItems.size > 0) {
        const selectedIds = Array.from(selectedItems).join(',');
        url += `&ids=${selectedIds}`;
      }
      
      const response = await axios.get(url, {
        responseType: format === 'pdf' ? 'blob' : 'text'
      });
      
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'word' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
              'text/markdown'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      const prefix = selectedItems.size > 0 ? `selected-${category}` : category;
      a.download = `${prefix}-export-${timestamp}.${format === 'word' ? 'docx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      const itemCount = selectedItems.size > 0 ? selectedItems.size : data.length;
      toast.success(`${itemCount} ${category} exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
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

  const getFieldReference = (item, field) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      return item[parent]?.[child]?.reference || '';
    }
    return item[field]?.reference || '';
  };

  const getVerificationStatus = (item) => {
    const verifiedFields = config.fields.filter(field => getFieldVerified(item, field));
    const totalFields = config.fields.length;
    
    if (verifiedFields.length === totalFields) return 'fully';
    if (verifiedFields.length > 0) return 'partial';
    return 'none';
  };

  const StatCard = ({ title, value, subtitle, icon: Icon }) => (
    <div className={`${colors.bg} rounded-lg p-4 ${colors.border} border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${colors.text} uppercase tracking-wide`}>{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`h-8 w-8 ${colors.text}`} />
      </div>
    </div>
  );

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

  if (loading && !data.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading {config.title.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              to="/dashboard" 
              className="mr-4 p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">{config.title} Verification</h1>
          </div>
          <p className="text-gray-600">Manage and verify {config.title.toLowerCase()} data</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total"
              value={stats.total}
              icon={ChartBarIcon}
            />
            <StatCard
              title="Fully Verified"
              value={stats.fullyVerified}
              subtitle={`${stats.percentages.fullyVerified}%`}
              icon={CheckCircleIcon}
            />
            <StatCard
              title="Partially Verified"
              value={stats.partiallyVerified}
              subtitle={`${stats.percentages.partiallyVerified}%`}
              icon={ClockIcon}
            />
            <StatCard
              title="Unverified"
              value={stats.unverified}
              subtitle={`${stats.percentages.unverified}%`}
              icon={XCircleIcon}
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={`Search ${config.title.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className={`px-6 py-2 ${colors.button} text-white rounded-lg transition-colors duration-200`}
              >
                Search
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {['all', 'verified', 'partial', 'unverified'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab
                      ? `${colors.button} text-white`
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'partial' ? 'Partially Verified' : 
                   tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Field Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by field:</label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All fields</option>
                {config.fields.map((field) => (
                  <option key={field} value={field}>
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  {selectedItems.size === data.length ? 'Unselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedItems.size} of {data.length} items selected
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedItems.size > 0 && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
                  >
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Delete Selected ({selectedItems.size})
                  </button>
                )}
                
                <div className="relative">
                  <select
                    onChange={(e) => e.target.value && exportData(e.target.value)}
                    className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                    defaultValue=""
                  >
                    <option value="">Export As...</option>
                    <option value="markdown">Markdown</option>
                    <option value="pdf">PDF</option>
                    <option value="word">Word Document</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchData}
                className={`px-4 py-2 ${colors.button} text-white rounded-lg transition-colors duration-200`}
              >
                Retry
              </button>
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No {config.title.toLowerCase()} found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === data.length && data.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified Fields
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
                  {(filteredData.length > 0 ? filteredData : data).map((item) => {
                    const status = getVerificationStatus(item);
                    const verifiedCount = config.fields.filter(field => getFieldVerified(item, field)).length;
                    
                    return (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item._id)}
                            onChange={() => handleItemSelect(item._id)}
                            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getFieldValue(item, 'name')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            status === 'fully' ? 'bg-green-100 text-green-800' :
                            status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {status === 'fully' ? 'Fully Verified' :
                             status === 'partial' ? 'Partially Verified' :
                             'Unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {verifiedCount}/{config.fields.length} fields
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/verification/${category}/${item._id}`}
                            className={`${colors.text} hover:opacity-75 mr-4`}
                            title="Edit/Verify"
                          >
                            <EyeIcon className="h-5 w-5 inline" />
                          </Link>
                          <Link
                            to={`/view/${category}/${item._id}`}
                            className="text-blue-600 hover:text-blue-800 mr-4"
                            title="View in Markdown"
                          >
                            📖
                          </Link>
                          <button
                            onClick={() => handleSingleDelete(item._id)}
                            className="text-red-600 hover:text-red-800 mr-4"
                            title="Delete item"
                          >
                            <XCircleIcon className="h-5 w-5 inline" />
                          </button>
                          <button
                            onClick={() => handleSingleExport(item._id, 'markdown')}
                            className="text-blue-600 hover:text-blue-800"
                            title="Export as Markdown"
                          >
                            📄
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="text-lg font-medium text-gray-900 mt-2">Delete {selectedItems.size} {category}?</h3>
                <p className="text-sm text-gray-500 mt-2">
                  This action cannot be undone. All selected {category} and their data will be permanently deleted.
                </p>
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;