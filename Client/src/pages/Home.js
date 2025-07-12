import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      title: 'Artists',
      description: 'Search and collect information about Indian Classical Music artists.',
      path: '/artists',
      icon: '🎤',
    },
    {
      title: 'Raags',
      description: 'Explore and gather details about various Raags in Indian Classical Music.',
      path: '/raags',
      icon: '🎼',
    },
    {
      title: 'Taals',
      description: 'Discover and document different Taals used in Indian Classical Music.',
      path: '/taals',
      icon: '🥁',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Indian Classical Music
          <span className="block text-primary-600">Data Collection System</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          A comprehensive platform for collecting, verifying, and managing metadata about Indian Classical Music.
        </p>
      </div>

      <div className="mt-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.path}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-700 ring-4 ring-white text-4xl">
                  {feature.icon}
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {feature.description}
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 