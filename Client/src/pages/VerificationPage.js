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

  const categoryConfig = {
    artists: {
      title: 'Artists',
      fields: ['name', 'guru', 'gharana', 'notableAchievements', 'disciples'],
      color: 'green'
    },
    raags: {
      title: 'Raags',
      fields: ['name', 'aroha', 'avroha', 'chalan', 'vadi', 'samvadi', 'thaat', 'rasBhaav', 'tanpuraTuning', 'timeOfRendition'],
      color: 'purple'
    },
    taals: {
      title: 'Taals',
      fields: ['name', 'numberOfBeats', 'divisions', 'taali.count', 'taali.beatNumbers', 'khaali.count', 'khaali.beatNumbers', 'jaati'],
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `http://localhost:5000/api/${category}`;
      
      if (activeTab === 'verified') {
        url += '/verified';
      } else if (activeTab === 'unverified') {
        url += '/unverified';
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {['all', 'verified', 'unverified'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab
                      ? `${colors.button} text-white`
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                  {data.map((item) => {
                    const status = getVerificationStatus(item);
                    const verifiedCount = config.fields.filter(field => getFieldVerified(item, field)).length;
                    
                    return (
                      <tr key={item._id} className="hover:bg-gray-50">
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
                          >
                            <EyeIcon className="h-5 w-5 inline" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;