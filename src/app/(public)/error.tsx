'use client'; // Error boundaries must be Client Components

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Public page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-sangeet-neutral-900 border border-sangeet-neutral-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="text-5xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-sangeet-400 mb-4">
          Something went wrong!
        </h2>
        <p className="text-sangeet-neutral-400 mb-8">
          We apologize for the inconvenience. Our team has been notified.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
            className="px-6 py-3 bg-sangeet-400 text-sangeet-neutral-950 font-bold rounded-xl hover:bg-sangeet-300 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-sangeet-neutral-800 text-sangeet-neutral-300 font-bold rounded-xl hover:bg-sangeet-neutral-700 transition-colors border border-sangeet-neutral-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
