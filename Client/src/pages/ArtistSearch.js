import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ArtistSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter an artist name');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/artists/search?name=${encodeURIComponent(searchQuery)}&useAI=${useAI}`);
      setArtist(response.data);
      toast.success(`Artist data ${useAI ? 'researched using AI' : 'scraped from web'} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error searching for artist');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldUpdate = async (field, value) => {
    if (!artist) return;

    const updatedArtist = {
      ...artist,
      [field]: {
        ...artist[field],
        value,
      },
    };

    try {
      const response = await axios.put(`http://localhost:5000/api/artists/${artist._id}`, updatedArtist);
      setArtist(response.data);
      toast.success('Artist updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating artist');
    }
  };

  const handleVerification = async (field) => {
    if (!artist) return;

    const updatedArtist = {
      ...artist,
      [field]: {
        ...artist[field],
        verified: !artist[field].verified,
      },
    };

    try {
      const response = await axios.put(`http://localhost:5000/api/artists/${artist._id}`, updatedArtist);
      setArtist(response.data);
      toast.success('Verification status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating verification status');
    }
  };

  const renderField = (label, field) => {
    if (!artist) return null;

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            value={artist[field].value}
            onChange={(e) => handleFieldUpdate(field, e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => handleVerification(field)}
            className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              artist[field].verified
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {artist[field].verified ? 'Verified' : 'Verify'}
          </button>
        </div>
        {artist[field].reference && (
          <a
            href={artist[field].reference}
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
            Search for an Artist
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Enter the name of an Indian Classical Music artist to search for their information.</p>
          </div>
          <form onSubmit={handleSearch} className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="artist-name" className="sr-only">
                Artist Name
              </label>
              <input
                type="text"
                name="artist-name"
                id="artist-name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter artist name"
              />
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
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

      {artist && (
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Artist Information
            </h3>
            <div className="mt-6">
              {renderField('Name', 'name')}
              {renderField('Guru', 'guru')}
              {renderField('Gharana', 'gharana')}
              {renderField('Notable Achievements', 'notableAchievements')}
              {renderField('Disciples', 'disciples')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistSearch; 