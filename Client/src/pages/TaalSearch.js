import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TaalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [taal, setTaal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a taal name');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/taals/search?name=${encodeURIComponent(searchQuery)}&useAI=${useAI}`);
      setTaal(response.data);
      toast.success(`Taal data ${useAI ? 'researched using AI' : 'scraped from web'} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error searching for taal');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldUpdate = async (field, value) => {
    if (!taal) return;

    const updatedTaal = {
      ...taal,
      [field]: {
        ...taal[field],
        value,
      },
    };

    try {
      const response = await axios.put(`http://localhost:5000/api/taals/${taal._id}`, updatedTaal);
      setTaal(response.data);
      toast.success('Taal updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating taal');
    }
  };

  const handleVerification = async (field) => {
    if (!taal) return;

    const updatedTaal = {
      ...taal,
      [field]: {
        ...taal[field],
        verified: !taal[field].verified,
      },
    };

    try {
      const response = await axios.put(`http://localhost:5000/api/taals/${taal._id}`, updatedTaal);
      setTaal(response.data);
      toast.success('Verification status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating verification status');
    }
  };

  const renderField = (label, field) => {
    if (!taal) return null;

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            value={taal[field].value}
            onChange={(e) => handleFieldUpdate(field, e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => handleVerification(field)}
            className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              taal[field].verified
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {taal[field].verified ? 'Verified' : 'Verify'}
          </button>
        </div>
        {taal[field].reference && (
          <a
            href={taal[field].reference}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-sm text-primary-600 hover:text-primary-500"
          >
            View Source
          </a>
        )}
      </div>
    );
  };

  const renderNestedField = (label, parentField, childField) => {
    if (!taal) return null;

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            value={taal[parentField][childField].value}
            onChange={(e) => handleFieldUpdate(`${parentField}.${childField}`, e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => handleVerification(`${parentField}.${childField}`)}
            className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              taal[parentField][childField].verified
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {taal[parentField][childField].verified ? 'Verified' : 'Verify'}
          </button>
        </div>
        {taal[parentField][childField].reference && (
          <a
            href={taal[parentField][childField].reference}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-sm text-primary-600 hover:text-primary-500"
          >
            View Source
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Search for a Taal
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Enter the name of a Taal to search for its information.</p>
          </div>
          <form onSubmit={handleSearch} className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="taal-name" className="sr-only">
                Taal Name
              </label>
              <input
                type="text"
                name="taal-name"
                id="taal-name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter taal name"
              />
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 shadow-shadow focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-600">Use AI Research</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? (useAI ? 'AI Researching...' : 'Searching...') : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {taal && (
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Taal Information
            </h3>
            <div className="mt-6">
              {renderField('Name', 'name')}
              {renderField('Number of Beats (Matras)', 'numberOfBeats')}
              {renderField('Divisions (Vibhag)', 'divisions')}
              {renderNestedField('Taali Count', 'taali', 'count')}
              {renderNestedField('Taali Beat Numbers', 'taali', 'beatNumbers')}
              {renderNestedField('Khaali Count', 'khaali', 'count')}
              {renderNestedField('Khaali Beat Numbers', 'khaali', 'beatNumbers')}
              {renderField('Jaati', 'jaati')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaalSearch; 