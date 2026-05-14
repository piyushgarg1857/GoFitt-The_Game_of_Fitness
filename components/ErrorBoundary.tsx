import React from 'react';
import Link from 'next/link';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, you'd send this to Sentry or similar
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error Boundary caught:', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-['Inter']">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">⚡</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              An unexpected error occurred. Please try refreshing the page. If the issue persists, contact support.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
                className="px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all"
              >
                Refresh Page
              </button>
              <Link href="/support" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all">
                Get Support
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
