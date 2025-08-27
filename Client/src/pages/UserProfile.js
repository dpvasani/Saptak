import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { apiService } from '../utils/api';
import { 
  UserIcon, 
  EnvelopeIcon, 
  BuildingOfficeIcon,
  AcademicCapIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const UserProfile = ({ user, onUserUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    organization: user?.profile?.organization || '',
    expertise: user?.profile?.expertise || []
  });

  const expertiseOptions = [
    'Hindustani Classical',
    'Carnatic Classical',
    'Tabla',
    'Sitar',
    'Violin',
    'Flute',
    'Vocal',
    'Harmonium',
    'Sarod',
    'Santoor',
    'Veena',
    'Mridangam',
    'Ghatam',
    'Kanjira'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExpertiseChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      expertise: checked 
        ? [...prev.expertise, value]
        : prev.expertise.filter(item => item !== value)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await apiService.updateUserProfile(formData);

      if (response.data.success) {
        // Update user data in localStorage and parent component
        const updatedUser = { ...user, profile: formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        onUserUpdate(updatedUser);
        
        setEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.profile?.firstName || '',
      lastName: user?.profile?.lastName || '',
      organization: user?.profile?.organization || '',
      expertise: user?.profile?.expertise || []
    });
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user?.profile?.firstName} {user?.profile?.lastName} 
                  {(!user?.profile?.firstName && !user?.profile?.lastName) && user?.username}
                </h1>
                <p className="text-green-100">{user?.email}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white mt-1 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
            
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 font-medium"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <motion.div
              className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Personal Information
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                        placeholder="Enter first name"
                      />
                    ) : (
                      <p className="text-white bg-gray-700 bg-opacity-30 px-3 py-2 rounded-lg">
                        {user?.profile?.firstName || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                        placeholder="Enter last name"
                      />
                    ) : (
                      <p className="text-white bg-gray-700 bg-opacity-30 px-3 py-2 rounded-lg">
                        {user?.profile?.lastName || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <div className="flex items-center text-white bg-gray-700 bg-opacity-30 px-3 py-2 rounded-lg">
                    <EnvelopeIcon className="h-4 w-4 text-green-400 mr-2" />
                    {user?.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Organization</label>
                  {editing ? (
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-400"
                      placeholder="Enter organization"
                    />
                  ) : (
                    <div className="flex items-center text-white bg-gray-700 bg-opacity-30 px-3 py-2 rounded-lg">
                      <BuildingOfficeIcon className="h-4 w-4 text-green-400 mr-2" />
                      {user?.profile?.organization || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Expertise */}
            <motion.div
              className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                Musical Expertise
              </h3>
              
              {editing ? (
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {expertiseOptions.map(option => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={option}
                        checked={formData.expertise.includes(option)}
                        onChange={handleExpertiseChange}
                        className="rounded border-gray-600 text-green-500 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50 bg-gray-700"
                      />
                      <span className="text-sm text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {user?.profile?.expertise?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.profile.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 bg-opacity-20 text-green-400 border border-green-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No expertise specified</p>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Account Statistics */}
          <motion.div
            className="mt-8 bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-green-400 mb-4">Account Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{user?.activity?.searchCount || 0}</div>
                <div className="text-sm text-gray-400">Searches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{user?.activity?.verificationCount || 0}</div>
                <div className="text-sm text-gray-400">Verifications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{user?.activity?.contributionScore || 0}</div>
                <div className="text-sm text-gray-400">Contribution Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
                </div>
                <div className="text-sm text-gray-400">Days Active</div>
              </div>
            </div>
          </motion.div>

          {/* Account Details */}
          <motion.div
            className="mt-8 bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold text-green-400 mb-4">Account Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="font-medium text-gray-300">Username:</span>
                <span className="ml-2 text-white">{user?.username}</span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Role:</span>
                <span className="ml-2 text-green-400 capitalize">{user?.role}</span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Member Since:</span>
                <span className="ml-2 text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Last Login:</span>
                <span className="ml-2 text-white">
                  {user?.activity?.lastLogin ? new Date(user.activity.lastLogin).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          {editing && (
            <motion.div
              className="mt-8 flex justify-end space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={handleCancel}
                className="flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
                disabled={loading}
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;