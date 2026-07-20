"use client";
import React from 'react';

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
          <div className="bg-sangeet-neutral-900 p-8 rounded-lg shadow-lg max-w-2xl mx-4">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Something went wrong
            </h1>
            <div className="text-sangeet-neutral-300 mb-4">
              <p>An error occurred while loading this page.</p>
              {this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sangeet-400">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-sm bg-sangeet-neutral-800 p-4 rounded overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-sangeet-400 text-sangeet-neutral-950 px-4 py-2 rounded hover:bg-sangeet-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
