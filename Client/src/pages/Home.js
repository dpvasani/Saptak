import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      title: 'Artists',
      description: 'Find and curate profiles of Indian classical vocalists and instrumentalists.',
      path: '/artists',
      icon: '🎤',
    },
    {
      title: 'Raags',
      description: 'Explore raag structures, notes, and time-of-day traditions.',
      path: '/raags',
      icon: '🎼',
    },
    {
      title: 'Taals',
      description: 'Document taal cycles, claps, and rhythmic patterns.',
      path: '/taals',
      icon: '🥁',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          RagaBot
          <span className="block text-primary-600">Indian Classical Music Knowledge Hub</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          A modern platform for researching, organizing, and verifying knowledge about Indian classical music.
        </p>
      </div>

      <div className="mt-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.path}
              className="relative group bg-white p-6 rounded-xl shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-gray-300 transition-all"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-700 ring-4 ring-white text-4xl">
                  {feature.icon}
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
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