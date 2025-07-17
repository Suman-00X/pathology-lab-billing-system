import React, { useState } from 'react';
import { labAPI, testGroupAPI, billAPI } from '../services/api';
import toast from 'react-hot-toast';

function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  const testEndpoint = async (name, apiCall) => {
    setLoading(true);
    try {
  
      const response = await apiCall();
      const result = { status: 'success', data: response.data };
      setResults(prev => ({ ...prev, [name]: result }));
      toast.success(`${name} - Success!`);

    } catch (error) {
      const result = { 
        status: 'error', 
        error: error.response?.data?.message || error.message 
      };
      setResults(prev => ({ ...prev, [name]: result }));
      toast.error(`${name} - Error: ${result.error}`);

    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    setLoading(true);
    try {
  
      const response = await fetch('/api/health');
      const data = await response.json();
      const result = { status: 'success', data };
      setResults(prev => ({ ...prev, 'Health Check': result }));
      toast.success('Health Check - Success!');

    } catch (error) {
      const result = { status: 'error', error: error.message };
      setResults(prev => ({ ...prev, 'Health Check': result }));
      toast.error(`Health Check - Error: ${error.message}`);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">🧪 API Test Center</h3>
        <p className="text-sm text-gray-500 mt-1">
          Test API endpoints and view network activity in DevTools Network Tab
        </p>
      </div>
      <div className="card-body space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testHealth}
            disabled={loading}
            className="btn-primary"
          >
            🔍 Test Health Check
          </button>
          
          <button
            onClick={() => testEndpoint('Lab Details', labAPI.get)}
            disabled={loading}
            className="btn-primary"
          >
            🏥 Test Lab API
          </button>
          
          <button
            onClick={() => testEndpoint('Test Groups', testGroupAPI.getAll)}
            disabled={loading}
            className="btn-primary"
          >
            🧪 Test Groups API
          </button>
          
          <button
            onClick={() => testEndpoint('Bill Stats', billAPI.getStats)}
            disabled={loading}
            className="btn-primary"
          >
            📊 Test Stats API
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Testing API...</p>
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Test Results:</h4>
            <div className="space-y-2">
              {Object.entries(results).map(([name, result]) => (
                <div key={name} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-700">{name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      result.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status === 'success' ? '✅ Success' : '❌ Error'}
                    </span>
                  </div>
                  {result.error && (
                    <p className="text-xs text-red-600 mt-1">{result.error}</p>
                  )}
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">View Response</summary>
                      <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 How to See Network Activity:</h5>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Open Browser DevTools (F12)</li>
            <li>2. Go to <strong>Network</strong> tab</li>
            <li>3. Clear any filters and check "Preserve log"</li>
            <li>4. Click any test button above</li>
            <li>5. Watch for <code>/api/*</code> requests in the Network tab</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default ApiTest; 