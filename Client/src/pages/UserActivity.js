import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  ClockIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const UserActivity = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const activityIcons = {
    search: <MagnifyingGlassIcon className="h-5 w-5" />,
    create: <PencilIcon className="h-5 w-5" />,
    update: <PencilIcon className="h-5 w-5" />,
    verify: <CheckCircleIcon className="h-5 w-5" />,
    delete: <TrashIcon className="h-5 w-5" />,
    export: <DocumentArrowDownIcon className="h-5 w-5" />
  };

  const activityColors = {
    search: 'text-blue-400 bg-blue-500 bg-opacity-20',
    create: 'text-green-400 bg-green-500 bg-opacity-20',
    update: 'text-yellow-400 bg-yellow-500 bg-opacity-20',
    verify: 'text-emerald-400 bg-emerald-500 bg-opacity-20',
    delete: 'text-red-400 bg-red-500 bg-opacity-20',
    export: 'text-purple-400 bg-purple-500 bg-opacity-20'
  };

  useEffect(() => {
    fetchActivities();
  }, [filter, pagination.page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (filter !== 'all') {
        params.append('action', filter);
      }

      const response = await axios.get(`http://localhost:5000/api/auth/activity?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setActivities(response.data.data.activities);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const getActivityDescription = (activity) => {
    const { action, category, itemName, details } = activity;
    
    switch (action) {
      case 'search':
        return `Searched for "${details?.searchQuery || itemName}" in ${category}`;
      case 'create':
        return `Created new ${category.slice(0, -1)}: "${itemName}"`;
      case 'update':
        return `Updated ${category.slice(0, -1)}: "${itemName}"`;
      case 'verify':
        return `Verified fields in ${category.slice(0, -1)}: "${itemName}"`;
      case 'delete':
        return `Deleted ${category.slice(0, -1)}: "${itemName}"`;
      case 'export':
        return `Exported ${category} data`;
      default:
        return `${action} operation on ${category}`;
    }
  };

  const filters = [
    { id: 'all', label: 'All Activities' },
    { id: 'search', label: 'Searches' },
    { id: 'create', label: 'Created' },
    { id: 'update', label: 'Updated' },
    { id: 'verify', label: 'Verified' },
    { id: 'export', label: 'Exported' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
                My Activity
              </h1>
              <p className="text-gray-300 mt-2">Track your research and verification activities</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <ChartBarIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Searches</p>
                <p className="text-2xl font-bold text-white">{user?.activity?.searchCount || 0}</p>
              </div>
              <MagnifyingGlassIcon className="h-8 w-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Verifications</p>
                <p className="text-2xl font-bold text-green-400">{user?.activity?.verificationCount || 0}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Contribution Score</p>
                <p className="text-2xl font-bold text-emerald-400">{user?.activity?.contributionScore || 0}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-emerald-400" />
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Days Active</p>
                <p className="text-2xl font-bold text-purple-400">
                  {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-purple-400" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {filters.map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => {
                  setFilter(filterOption.id);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === filterOption.id
                    ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500/30'
                    : 'bg-gray-800 bg-opacity-50 text-gray-300 border border-gray-700 hover:text-green-400 hover:border-green-500/30'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No activities found</p>
              <p className="text-gray-500 mt-2">Start searching and verifying data to see your activity here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity._id}
                  className="p-6 hover:bg-gray-800 hover:bg-opacity-30 transition-colors duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${activityColors[activity.action] || 'text-gray-400 bg-gray-500 bg-opacity-20'}`}>
                      {activityIcons[activity.action] || <ClockIcon className="h-5 w-5" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">
                          {getActivityDescription(activity)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{formatDuration(activity.metadata?.duration)}</span>
                          <span>{new Date(activity.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          activity.category === 'artists' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                          activity.category === 'raags' ? 'bg-purple-500 bg-opacity-20 text-purple-400' :
                          'bg-orange-500 bg-opacity-20 text-orange-400'
                        }`}>
                          {activity.category}
                        </span>
                        
                        {activity.details?.aiProvider && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-400">
                            {activity.details.aiProvider} - {activity.details.aiModel || 'default'}
                          </span>
                        )}
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          activity.metadata?.success ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'
                        }`}>
                          {activity.metadata?.success ? 'Success' : 'Failed'}
                        </span>
                      </div>

                      {activity.details?.fieldsModified && activity.details.fieldsModified.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-400">
                            Modified fields: {activity.details.fieldsModified.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gray-800 bg-opacity-50 px-6 py-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} activities
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors duration-200 text-sm"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-2 bg-green-500 bg-opacity-20 text-green-400 rounded-lg text-sm">
                    {pagination.page} of {pagination.pages}
                  </span>
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors duration-200 text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserActivity;