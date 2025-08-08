import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import axios from 'axios';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    organization: '',
    expertise: []
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);

      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        toast.success(isLoginMode ? 'Login successful!' : 'Registration successful!');
        onLogin(response.data.data.user);
        onClose();
        
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          organization: '',
          expertise: []
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

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
    'Santoor'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isLoginMode ? 'Login' : 'Register'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expertise</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {expertiseOptions.map(option => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        value={option}
                        checked={formData.expertise.includes(option)}
                        onChange={handleExpertiseChange}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {isLoginMode ? 'Need an account? Register' : 'Already have an account? Login'}
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors duration-200"
            >
              {loading ? 'Processing...' : (isLoginMode ? 'Login' : 'Register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;