import React, { useState } from 'react';
import { useLoading, useAsyncWithLoading } from '../contexts/LoadingContext';
import LoadingAnimation from './LoadingAnimation';

/**
 * Demo component showing different ways to use the loading animation
 * This is for documentation/testing purposes
 */
const LoadingAnimationDemo: React.FC = () => {
  const { showLoading, hideLoading, withLoading } = useLoading();
  const asyncWithLoading = useAsyncWithLoading();
  const [showInlineDemo, setShowInlineDemo] = useState(false);

  // Demo 1: Manual show/hide
  const demoManual = async () => {
    showLoading('Manual loading demonstration...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    hideLoading();
  };

  // Demo 2: withLoading wrapper (recommended)
  const demoWithLoading = async () => {
    await withLoading(
      new Promise(resolve => setTimeout(resolve, 3000)),
      'Using withLoading wrapper...'
    );
  };

  // Demo 3: useAsyncWithLoading hook
  const demoAsyncHook = async () => {
    await asyncWithLoading(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));
      },
      'Using asyncWithLoading hook...'
    );
  };

  // Demo 4: Simulated data fetch
  const demoDataFetch = async () => {
    await withLoading(
      new Promise(resolve => setTimeout(resolve, 3000)),
      'Searching 174k beautiful names...'
    );
  };

  // Demo 5: Inline loading
  const demoInline = () => {
    setShowInlineDemo(true);
    setTimeout(() => setShowInlineDemo(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-purple-600">
        Loading Animation Demos
      </h1>

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Demo 1: Manual Show/Hide</h2>
          <p className="text-gray-600 mb-4">
            Basic usage with manual control. Don't forget to hideLoading()!
          </p>
          <button
            onClick={demoManual}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            Show Manual Loading
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Demo 2: withLoading Wrapper</h2>
          <p className="text-gray-600 mb-4">
            Recommended approach - automatic cleanup, returns promise result
          </p>
          <button
            onClick={demoWithLoading}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
          >
            Show withLoading
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Demo 3: useAsyncWithLoading Hook</h2>
          <p className="text-gray-600 mb-4">
            Convenience hook for cleaner async code
          </p>
          <button
            onClick={demoAsyncHook}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Show Async Hook
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Demo 4: Custom Message</h2>
          <p className="text-gray-600 mb-4">
            Simulated name search with contextual message
          </p>
          <button
            onClick={demoDataFetch}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
          >
            Search Names
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Demo 5: Inline Loading</h2>
          <p className="text-gray-600 mb-4">
            Component-specific loading state (not full-screen)
          </p>
          <button
            onClick={demoInline}
            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
          >
            Show Inline Loading
          </button>

          {showInlineDemo && (
            <div className="mt-4 h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <LoadingAnimation
                fullScreen={false}
                message="Loading inline content..."
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-purple-800">
          Usage Tips
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li>✅ Use withLoading() for automatic cleanup</li>
          <li>✅ Provide contextual messages for better UX</li>
          <li>✅ Use inline variant for component-specific loading</li>
          <li>✅ The context handles multiple concurrent operations</li>
          <li>❌ Don't forget to call hideLoading() with manual control</li>
          <li>❌ Don't use for instant operations (&lt; 200ms)</li>
        </ul>
      </div>
    </div>
  );
};

export default LoadingAnimationDemo;
