import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  MusicalNoteIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingItems, setPendingItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, pendingResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/stats'),
        axios.get('http://localhost:5000/api/dashboard/pending-verification?limit=5')
      ]);
      
      setStats(statsResponse.data);
      setPendingItems(pendingResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, link }) => (
    <div className={`bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-800 hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-300 mt-1">{subtitle}</p>}
          }
        </div>
        <div className="p-3 rounded-full bg-gray-800 bg-opacity-50 border border-gray-700">
          <Icon className="h-8 w-8 text-green-400" />
        </div>
      </div>
      {link && (
        <div className="mt-4">
          <Link 
            to={link} 
            className="inline-flex items-center text-sm font-medium text-green-400 hover:text-green-300 hover:underline"
          >
            View details
            <EyeIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );

  const VerificationCard = ({ category, data, color }) => (
    <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-800 hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white capitalize">{category}</h3>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500 bg-opacity-20 text-green-400 border border-green-500/30">
          {data.verificationRate}% verified
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Total Entries</span>
          <span className="font-semibold text-white">{data.total}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400 flex items-center">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
            Fully Verified
          </span>
          <span className="font-semibold text-green-600">{data.fullyVerified}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400 flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 text-yellow-500 mr-1" />
            Partially Verified
          </span>
          <span className="font-semibold text-yellow-600">{data.partiallyVerified}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400 flex items-center">
            <ClockIcon className="h-4 w-4 text-red-500 mr-1" />
            Unverified
          </span>
          <span className="font-semibold text-red-600">{data.unverified}</span>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Link 
          to={`/verification/${category}`} 
          className="flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
        >
          Manage
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text mb-2">Dashboard</h1>
          <p className="text-gray-300">Overview of your Indian Classical Music data collection</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Entries"
            value={stats?.overview?.totalEntries || 0}
            subtitle="All categories combined"
            icon={ChartBarIcon}
            color="border-l-blue-500"
          />
          <StatCard
            title="Artists"
            value={stats?.overview?.totalArtists || 0}
            icon={UserGroupIcon}
            color="border-l-green-500"
            link="/verification/artists"
          />
          <StatCard
            title="Raags"
            value={stats?.overview?.totalRaags || 0}
            icon={MusicalNoteIcon}
            color="border-l-purple-500"
            link="/verification/raags"
          />
          <StatCard
            title="Taals"
            value={stats?.overview?.totalTaals || 0}
            icon={ClockIcon}
            color="border-l-orange-500"
            link="/verification/taals"
          />
        </div>

        {/* Verification Status */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Verification Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats?.verification && (
              <>
                <VerificationCard 
                  category="artists" 
                  data={stats.verification.artists} 
                  color="border-l-green-500"
                />
                <VerificationCard 
                  category="raags" 
                  data={stats.verification.raags} 
                  color="border-l-purple-500"
                />
                <VerificationCard 
                  category="taals" 
                  data={stats.verification.taals} 
                  color="border-l-orange-500"
                />
              </>
            )}
          </div>
        </div>

        {/* Recent Additions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {['artists', 'raags', 'taals'].map((category) => (
            <div key={category} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                Recent {category}
              </h3>
              <div className="space-y-3">
                {stats?.recent?.[category]?.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {item.verified ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ClockIcon className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No recent {category}</p>
                )}
              </div>
              <div className="mt-4">
                <Link 
                  to={`/verification/${category}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all {category} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;