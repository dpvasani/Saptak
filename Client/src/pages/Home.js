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
    <div className="max-w-7xl mx-auto text-white">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          RagaBot
          <span className="block bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Indian Classical Music Knowledge Hub</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          A modern platform for researching, organizing, and verifying knowledge about Indian classical music.
        </p>
      </div>

      <div className="mt-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.path}
              className="relative group bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-800 hover:shadow-green-500/20 hover:border-green-500/50 hover:bg-opacity-90 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-gray-800 bg-opacity-50 text-green-400 ring-4 ring-gray-700 text-4xl shadow-sm">
                  {feature.icon}
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                  {feature.description}
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-green-400 group-hover:text-green-300 transition-colors duration-300"
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