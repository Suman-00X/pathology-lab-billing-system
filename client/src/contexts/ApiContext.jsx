import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { labAPI, testGroupAPI, billAPI, reportAPI, paymentModeAPI, settingsAPI, referredDoctorAPI } from '../services/api';
import toast from 'react-hot-toast';

// Cache states
const CACHE_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Action types
const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_SUCCESS: 'SET_SUCCESS',
  SET_ERROR: 'SET_ERROR',
  INVALIDATE_CACHE: 'INVALIDATE_CACHE',
  CLEAR_CACHE: 'CLEAR_CACHE',
  SET_PENDING: 'SET_PENDING',
  CLEAR_PENDING: 'CLEAR_PENDING'
};

// Initial state
const initialState = {
  cache: {},
  loadingStates: {},
  pendingRequests: {}, // Track pending requests to prevent duplicates
  cacheVersion: 0
};

// Reducer
function apiReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.key]: CACHE_STATES.LOADING
        }
      };

    case ACTION_TYPES.SET_SUCCESS:
      const successPendingRequests = { ...state.pendingRequests };
      delete successPendingRequests[action.payload.key];
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: {
            data: action.payload.data,
            timestamp: Date.now(),
            status: CACHE_STATES.SUCCESS
          }
        },
        loadingStates: {
          ...state.loadingStates,
          [action.payload.key]: CACHE_STATES.SUCCESS
        },
        pendingRequests: successPendingRequests
      };

    case ACTION_TYPES.SET_ERROR:
      const errorPendingRequests = { ...state.pendingRequests };
      delete errorPendingRequests[action.payload.key];
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.payload.key]: CACHE_STATES.ERROR
        },
        pendingRequests: errorPendingRequests
      };

    case ACTION_TYPES.SET_PENDING:
      return {
        ...state,
        pendingRequests: {
          ...state.pendingRequests,
          [action.payload.key]: action.payload.promise
        }
      };

    case ACTION_TYPES.CLEAR_PENDING:
      const clearedPendingRequests = { ...state.pendingRequests };
      delete clearedPendingRequests[action.payload.key];
      return {
        ...state,
        pendingRequests: clearedPendingRequests
      };

    case ACTION_TYPES.INVALIDATE_CACHE:
      const newCache = { ...state.cache };
      const newLoadingStates = { ...state.loadingStates };
      
      if (action.payload.keys) {
        // Invalidate specific keys
        action.payload.keys.forEach(key => {
          if (newCache[key]) delete newCache[key];
          if (newLoadingStates[key]) delete newLoadingStates[key];
        });
      } else if (action.payload.pattern) {
        // Invalidate keys matching pattern
        Object.keys(newCache).forEach(key => {
          if (key.includes(action.payload.pattern)) {
            delete newCache[key];
            if (newLoadingStates[key]) delete newLoadingStates[key];
          }
        });
      }
      
      return {
        ...state,
        cache: newCache,
        loadingStates: newLoadingStates,
        cacheVersion: state.cacheVersion + 1
      };

    case ACTION_TYPES.CLEAR_CACHE:
      return initialState;

    default:
      return state;
  }
}

// Create context
const ApiContext = createContext();

// Cache expiry time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

// Provider component
export function ApiProvider({ children }) {
  const [state, dispatch] = useReducer(apiReducer, initialState);

  // Reset context on page refresh/navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch({ type: ACTION_TYPES.CLEAR_CACHE });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Generate cache key
  const generateCacheKey = useCallback((endpoint, params = {}) => {
    const paramString = Object.keys(params).length > 0 
      ? `?${new URLSearchParams(params).toString()}` 
      : '';
    return `${endpoint}${paramString}`;
  }, []);

  // Check if cache is valid
  const isCacheValid = useCallback((cacheEntry) => {
    if (!cacheEntry) return false;
    return (Date.now() - cacheEntry.timestamp) < CACHE_EXPIRY;
  }, []);

  // Generic fetch function with caching
  const fetchWithCache = useCallback(async (
    endpoint,
    apiFunction,
    params = {},
    options = { force: false, showToast: true }
  ) => {
    const cacheKey = generateCacheKey(endpoint, params);
    const cachedData = state.cache[cacheKey];
    const isLoading = state.loadingStates[cacheKey] === CACHE_STATES.LOADING;
    const pendingRequest = state.pendingRequests[cacheKey];

    // Return cached data if valid and not forced refresh
    if (!options.force && cachedData && isCacheValid(cachedData)) {
      return cachedData.data;
    }

    // If there's a pending request, wait for it to complete
    if (pendingRequest) {
      try {
        return await pendingRequest;
      } catch (error) {
        // If pending request failed, we'll make a new one below
      }
    }

    // If already loading but no pending request, return cached data if available
    if (isLoading && cachedData) {
      return cachedData.data;
    }

    // Create a promise for this request to prevent duplicates
    const requestPromise = (async () => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key: cacheKey } });
        
        const response = await apiFunction(params);
        const data = response.data;

        dispatch({
          type: ACTION_TYPES.SET_SUCCESS,
          payload: { key: cacheKey, data }
        });

        return data;
      } catch (error) {
        dispatch({
          type: ACTION_TYPES.SET_ERROR,
          payload: { key: cacheKey, error: error.message }
        });

        if (options.showToast) {
          toast.error(error.response?.data?.message || 'Failed to fetch data');
        }

        throw error;
      }
    })();

    // Store the pending request
    dispatch({
      type: ACTION_TYPES.SET_PENDING,
      payload: { key: cacheKey, promise: requestPromise }
    });

    return requestPromise;
  }, [state.cache, state.loadingStates, state.pendingRequests, generateCacheKey, isCacheValid]);

  // Invalidate cache
  const invalidateCache = useCallback((keys, pattern) => {
    dispatch({
      type: ACTION_TYPES.INVALIDATE_CACHE,
      payload: { keys, pattern }
    });
  }, []);

  // Clear all cache
  const clearCache = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_CACHE });
  }, []);

  // API methods with caching
  const api = {
    // Lab API
    lab: {
      get: (options) => fetchWithCache('lab', labAPI.get, {}, options),
      getById: (id, options) => fetchWithCache(`lab/${id}`, labAPI.getById, id, options),
      create: async (data) => {
        const result = await labAPI.create(data);
        invalidateCache(null, 'lab');
        toast.success('Lab details saved successfully!');
        return result;
      },
      update: async (id, data) => {
        const result = await labAPI.update(id, data);
        invalidateCache(null, 'lab');
        toast.success('Lab details updated successfully!');
        return result;
      },
      delete: async (id) => {
        const result = await labAPI.delete(id);
        invalidateCache(null, 'lab');
        toast.success('Lab deleted successfully!');
        return result;
      }
    },

    // Test Groups API
    testGroups: {
      getAll: (params, options) => fetchWithCache('test-groups', () => testGroupAPI.getAll(params), {}, options),
      getById: (id, options) => fetchWithCache(`test-groups/${id}`, () => testGroupAPI.getById(id), {}, options),
      create: async (data) => {
        const result = await testGroupAPI.create(data);
        invalidateCache(null, 'test-groups');
        toast.success('Test group created successfully!');
        return result;
      },
      update: async (id, data) => {
        const result = await testGroupAPI.update(id, data);
        invalidateCache([`test-groups/${id}`], 'test-groups');
        toast.success('Test group updated successfully!');
        return result;
      },
      delete: async (id) => {
        await testGroupAPI.delete(id);
        invalidateCache([`test-groups/${id}`], 'test-groups');
        toast.success('Test group deleted successfully!');
      },
      addTest: async (groupId, testData) => {
        const result = await testGroupAPI.addTest(groupId, testData);
        invalidateCache([`test-groups/${groupId}`], 'test-groups');
        toast.success('Test added successfully!');
        return result;
      },
      updateTest: async (testId, testData) => {
        const result = await testGroupAPI.updateTest(testId, testData);
        invalidateCache(null, 'test-groups');
        toast.success('Test updated successfully!');
        return result;
      },
      removeTest: async (groupId, testId) => {
        const result = await testGroupAPI.removeTest(groupId, testId);
        invalidateCache([`test-groups/${groupId}`], 'test-groups');
        toast.success('Test removed successfully!');
        return result;
      }
    },

    // Bills API
    bills: {
      getAll: (params, options) => fetchWithCache('bills', () => billAPI.getAll(params), {}, options),
      getById: (id, options) => fetchWithCache(`bills/${id}`, () => billAPI.getById(id), {}, options),
      getByNumber: (billNumber, options) => fetchWithCache(`bills/number/${billNumber}`, billAPI.getByNumber, billNumber, options),
      getStats: (params = {}, options) => fetchWithCache(`bills/stats/${JSON.stringify(params)}`, () => billAPI.getStats(params), {}, options),
      create: async (data) => {
        const result = await billAPI.create(data);
        
        // Clear bills, reports, stats, and doctors cache
        invalidateCache(null, 'bills');
        invalidateCache(null, 'reports');
        invalidateCache(null, 'referred-doctors');
        toast.success('Bill created successfully!');
        return result;
      },
      update: async (id, data) => {
        const result = await billAPI.update(id, data);
        
        // Clear specific bill, general bills, and related cache
        invalidateCache([`bills/${id}`], 'bills');
        invalidateCache(null, 'reports');
        invalidateCache(null, 'referred-doctors');
        toast.success('Bill updated successfully!');
        return result;
      },
      delete: async (id) => {
        await billAPI.delete(id);
        invalidateCache([`bills/${id}`], 'bills');
        invalidateCache(null, 'reports');
        invalidateCache(null, 'referred-doctors');
        toast.success('Bill deleted successfully!');
      },
      updatePayment: async (id, data) => {
        const result = await billAPI.updatePayment(id, data);
        invalidateCache([`bills/${id}`], 'bills');
        invalidateCache(null, 'referred-doctors');
        toast.success('Payment status updated successfully!');
        return result;
      }
    },

    // Reports API
    reports: {
      getByBillId: (billId, options) => fetchWithCache(`reports/bill/${billId}`, () => reportAPI.getByBillId(billId), {}, options),
      update: async (reportId, results) => {
        const result = await reportAPI.update(reportId, results);
        // Clear reports cache
        invalidateCache(null, 'reports');
        toast.success('Report updated successfully!');
        return result;
      }
    },

    // Payment Modes API
    paymentModes: {
      getAll: (options) => fetchWithCache('payment-modes', () => paymentModeAPI.getAll(), {}, options),
      getById: (id, options) => fetchWithCache(`payment-modes/${id}`, () => paymentModeAPI.getById(id), {}, options),
      create: async (data) => {
        const result = await paymentModeAPI.create(data);
        invalidateCache(null, 'payment-modes');
        toast.success('Payment mode created successfully!');
        return result;
      },
      update: async (id, data) => {
        const result = await paymentModeAPI.update(id, data);
        invalidateCache(null, 'payment-modes');
        toast.success('Payment mode updated successfully!');
        return result;
      },
      delete: async (id) => {
        const result = await paymentModeAPI.delete(id);
        invalidateCache(null, 'payment-modes');
        toast.success('Payment mode deleted successfully!');
        return result;
      }
    },

    // Settings API
    settings: {
      get: (options) => fetchWithCache('settings', () => settingsAPI.get(), {}, options),
      update: async (data) => {
        const result = await settingsAPI.update(data);
        invalidateCache(null, 'settings');
        toast.success('Settings updated successfully!');
        return result;
      }
    },

    // Referred Doctors API
    referredDoctors: {
      getAll: (params, options) => fetchWithCache(`referred-doctors?${JSON.stringify(params)}`, () => referredDoctorAPI.getAll(params), {}, options),
      getById: (id, options) => fetchWithCache(`referred-doctors/${id}`, () => referredDoctorAPI.getById(id), {}, options),
      searchByMobile: async (mobile) => {
        try {
          const response = await referredDoctorAPI.searchByMobile(mobile);
          return response.data;
        } catch (error) {
          // Don't show error toast for "not found" cases as it's expected behavior
          if (error.response?.status === 404) {
            return null;
          }
          throw error;
        }
      },
      getBills: (id, params, options) => fetchWithCache(`referred-doctors/${id}/bills?${JSON.stringify(params)}`, () => referredDoctorAPI.getBills(id, params), {}, options),
      create: async (data) => {
        const result = await referredDoctorAPI.create(data);
        invalidateCache(null, 'referred-doctors');
        toast.success('Doctor created successfully!');
        return result;
      },
      update: async (id, data) => {
        const result = await referredDoctorAPI.update(id, data);
        invalidateCache([`referred-doctors/${id}`], 'referred-doctors');
        toast.success('Doctor updated successfully!');
        return result;
      },
      delete: async (id) => {
        await referredDoctorAPI.delete(id);
        invalidateCache([`referred-doctors/${id}`], 'referred-doctors');
        toast.success('Doctor deleted successfully!');
      }
    },
    
    // Utility functions
    invalidateCache,
    clearCache,
    resetContext: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_CACHE });
    },
    getCacheInfo: () => ({
      cacheSize: Object.keys(state.cache).length,
      loadingRequests: Object.keys(state.loadingStates).filter(
        key => state.loadingStates[key] === CACHE_STATES.LOADING
      ).length,
      pendingRequests: Object.keys(state.pendingRequests).length
    })
  };

  const value = {
    api,
    cacheVersion: state.cacheVersion,
    isLoading: (endpoint, params = {}) => {
      const cacheKey = generateCacheKey(endpoint, params);
      return state.loadingStates[cacheKey] === CACHE_STATES.LOADING;
    },
    getCachedData: (endpoint, params = {}) => {
      const cacheKey = generateCacheKey(endpoint, params);
      const cachedData = state.cache[cacheKey];
      return cachedData && isCacheValid(cachedData) ? cachedData.data : null;
    },
    resetContext: api.resetContext,
    getCacheInfo: api.getCacheInfo
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

// Custom hook to use the API context
export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
} 