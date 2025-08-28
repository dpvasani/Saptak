import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../utils/api';
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

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [pendingItems, setPendingItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, pendingResponse] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getPendingVerification('', 5)
      ]);
      
      setStats(statsResponse.data.data || statsResponse.data);
      setPendingItems(pendingResponse.data.data || pendingResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        setError('Authentication required. Please login again.');
        toast.error('Please login to access dashboard');
      } else {
        setError('Failed to load dashboard data. Please try again.');
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, link }) => (
    <div className="group bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-800 hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">{title}</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent group-hover:from-green-300 group-hover:to-emerald-400 transition-all duration-300">{value}</p>
          {subtitle && <p className="text-sm text-gray-300 mt-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">{subtitle}</p>}
        </div>
        <div className="p-4 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 bg-opacity-50 border border-gray-700 group-hover:border-green-500/50 group-hover:shadow-lg transition-all duration-300">
          <Icon className="h-10 w-10 text-green-400 group-hover:text-green-300 group-hover:scale-110 transition-all duration-300" />
        </div>
      </div>
      {link && (
        <div className="mt-4">
          <Link 
            to={link} 
            className="inline-flex items-center text-sm font-medium text-green-400 hover:text-green-300 hover:underline group-hover:translate-x-1 transition-all duration-300"
          >
            View details
            <EyeIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );

  const VerificationCard = ({ category, data, color }) => (
    <div className="group bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-800 hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white capitalize group-hover:text-green-400 transition-colors duration-300">{category}</h3>
        <span className="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-opacity-20 text-green-400 border border-green-500/30 group-hover:border-green-400/50 group-hover:shadow-lg transition-all duration-300">
          {data.verificationRate}% verified
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Total Entries</span>
          <span className="font-bold text-white text-lg group-hover:text-green-400 transition-colors duration-300">{data.total}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400 flex items-center">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform duration-300" />
            Fully Verified
          </span>
          <span className="font-bold text-green-500 text-lg group-hover:text-green-400 transition-colors duration-300">{data.fullyVerified}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400 flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 text-yellow-500 mr-2 group-hover:scale-110 transition-transform duration-300" />
            Partially Verified
          </span>
          <span className="font-bold text-yellow-500 text-lg group-hover:text-yellow-400 transition-colors duration-300">{data.partiallyVerified}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400 flex items-center">
            <ClockIcon className="h-4 w-4 text-red-500 mr-2 group-hover:scale-110 transition-transform duration-300" />
            Unverified
          </span>
          <span className="font-bold text-red-500 text-lg group-hover:text-red-400 transition-colors duration-300">{data.unverified}</span>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Link 
          to={`/verification/${category}`} 
          className="flex-1 text-center px-4 py-3 rounded-lg text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105"
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
          <div className="text-center mb-8">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-transparent bg-clip-text mb-4 tracking-tight">
              📊 Dashboard
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Overview of your Indian Classical Music data collection journey
            </p>
            <div className="mt-4 h-1 w-24 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full mx-auto"></div>
          </div>
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
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text mb-2">
              🔍 Verification Status
            </h2>
            <p className="text-gray-300">Track verification progress across all categories</p>
            <div className="mt-3 h-0.5 w-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats?.verification && (
              <>
                <VerificationCard 
                  category="artists" 
                  data={stats.verification.artists} 
                />
                <VerificationCard 
                  category="raags" 
                  data={stats.verification.raags} 
                />
                <VerificationCard 
                  category="taals" 
                  data={stats.verification.taals} 
                />
              </>
            )}
          </div>
        </div>

        {/* Recent Additions */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text mb-2">
              🕒 Recent Activity
            </h2>
            <p className="text-gray-300">Latest additions to your music database</p>
            <div className="mt-3 h-0.5 w-16 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {['artists', 'raags', 'taals'].map((category) => (
            <div key={category} className="group bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl p-6 border border-gray-800 hover:shadow-green-500/20 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
              <h3 className="text-xl font-bold text-white mb-6 capitalize group-hover:text-green-400 transition-colors duration-300 flex items-center">
                {category === 'artists' ? '👤' : category === 'raags' ? '🎼' : '🥁'} 
                Recent {category}
              </h3>
              <div className="space-y-3">
                {stats?.recent?.[category]?.slice(0, 5).map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700 hover:border-green-500/30 transition-all duration-200 group-hover:bg-opacity-70">
                    <div>
                      <p className="font-semibold text-white group-hover:text-green-400 transition-colors duration-300">{item.name}</p>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {item.verified ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <ClockIcon className="h-6 w-6 text-yellow-500 group-hover:scale-110 transition-transform duration-300" />
                      )}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-400 text-center py-8 italic">No recent {category}</p>
                )}
              </div>
              <div className="mt-4">
                <Link 
                  to={`/verification/${category}`}
                  className="inline-flex items-center text-sm font-bold text-green-400 hover:text-green-300 group-hover:translate-x-1 transition-all duration-300"
                >
                  View all {category} →
                </Link>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;