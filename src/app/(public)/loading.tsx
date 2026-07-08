import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-sangeet-neutral-800"></div>
          {/* Animated inner ring */}
          <div className="absolute inset-0 rounded-full border-4 border-t-sangeet-400 border-r-sangeet-500 border-b-transparent border-l-transparent animate-spin"></div>
          {/* Center dot */}
          <div className="absolute inset-0 m-auto w-3 h-3 bg-sangeet-400 rounded-full animate-pulse"></div>
        </div>
        <h2 className="text-2xl font-bold text-sangeet-400 mb-2 animate-pulse">
          Sangeet
        </h2>
        <p className="text-sangeet-neutral-400 text-sm">
          Preparing your experience...
        </p>
      </div>
    </div>
  );
}
