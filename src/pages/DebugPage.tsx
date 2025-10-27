import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userDataService from '../services/userDataService';
import favoritesService from '../services/favoritesService';
import AppHeader from '../components/AppHeader';
import SEOHead from '../components/SEO/SEOHead';

interface DebugPageProps {
  embedded?: boolean;
}

const DebugPage: React.FC<DebugPageProps> = ({ embedded = false }) => {
  const { user, isAuthenticated, clearCache } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [validationResults, setValidationResults] = useState<any>({});
  const [serviceState, setServiceState] = useState<any>({});

  useEffect(() => {
    // Read all localStorage
    const storage: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          storage[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          storage[key] = localStorage.getItem(key);
        }
      }
    }
    setLocalStorageData(storage);

    // Validate user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const validation: any = {
          rawData: userData,
          checks: {}
        };

        // Run validation checks
        validation.checks.isObject = typeof userData === 'object' && userData !== null;
        validation.checks.hasId = !!userData.id;
        validation.checks.idType = typeof userData.id;
        validation.checks.idValue = userData.id;
        validation.checks.idLength = userData.id ? userData.id.length : 0;
        validation.checks.idIsNumeric = /^\d+$/.test(userData.id || '');
        validation.checks.idIsLongEnough = userData.id && /^\d{15,}$/.test(userData.id);
        validation.checks.hasEmail = !!userData.email;
        validation.checks.emailValue = userData.email;
        validation.checks.hasName = !!userData.name;
        validation.checks.nameValue = userData.name;
        validation.checks.hasPicture = !!userData.picture;

        // Overall validation
        validation.isValid =
          validation.checks.isObject &&
          validation.checks.hasId &&
          validation.checks.idIsLongEnough &&
          validation.checks.hasEmail &&
          validation.checks.hasName;

        setValidationResults(validation);
      } catch (error) {
        setValidationResults({ error: (error as Error).message });
      }
    } else {
      setValidationResults({ message: 'No user data in localStorage' });
    }

    // Get service state
    setServiceState({
      userDataServiceUserId: (userDataService as any).userId,
      favoritesCount: favoritesService.getFavoritesCount(),
      dislikesCount: favoritesService.getDislikesCount(),
      favorites: favoritesService.getFavorites().slice(0, 5),
      dislikes: favoritesService.getDislikes().slice(0, 5)
    });
  }, []);

  // Content component (used in both standalone and embedded modes)
  const content = (
    <>
      {/* Auth Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Authentication Status</h2>
        <div className="space-y-2">
          <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          {user && (
            <>
              <p><strong>User ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{user.id}</code></p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.name}</p>
            </>
          )}
        </div>
      </div>

      {/* Validation Results */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Validation Results</h2>
        <div className={`p-4 rounded-lg mb-4 ${validationResults.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className="font-bold text-lg mb-2">
            {validationResults.isValid ? '✅ VALID' : '❌ INVALID'}
          </p>
        </div>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-64">
          {JSON.stringify(validationResults, null, 2)}
        </pre>
      </div>

      {/* localStorage Contents */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">localStorage Contents</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-64">
          {JSON.stringify(localStorageData, null, 2)}
        </pre>
      </div>

      {/* Service State */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Service State</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-64">
          {JSON.stringify(serviceState, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={clearCache}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Clear Cache & Reload
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Reload Page
          </button>
          <button
            onClick={() => {
              console.log('LocalStorage:', localStorageData);
              console.log('Validation:', validationResults);
              console.log('Services:', serviceState);
              alert('Check browser console for detailed logs');
            }}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            Log to Console
          </button>
        </div>
      </div>
    </>
  );

  // Return embedded version (no header/wrapper)
  if (embedded) {
    return <div className="px-6 py-6">{content}</div>;
  }

  // Return standalone page version (with header)
  return (
    <>
      <SEOHead
        title="Debug Tools | SoulSeed"
        description="Developer debug tools and diagnostics for SoulSeed application."
        canonical="https://soulseedbaby.com/debug"
        noindex={true}
      />
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="SoulSeed" showBackButton={true} />

      <div className="max-w-6xl mx-auto pt-24 px-6 pb-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">🐛 Debug Dashboard</h1>
        {content}

        {/* Back Button */}
        <div className="mt-6">
          <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to App
          </a>
        </div>
      </div>
    </div>
    </>
  );
};

export default DebugPage;