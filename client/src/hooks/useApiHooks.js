import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../contexts/ApiContext';

// Utility hook to check if data should be fetched
function useShouldFetch(endpoint, params = {}) {
  const { getCachedData, isLoading } = useApi();
  
  const cachedData = getCachedData(endpoint, params);
  const loading = isLoading(endpoint, params);
  
  // Should fetch if no cached data and not currently loading
  return !cachedData && !loading;
}

// Generic hook for data fetching with states
function useApiData(fetchFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction({ force: forceRefresh });
      setData(result);
      setHasInitialized(true);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    // Only fetch if we haven't initialized or dependencies changed
    if (dependencies.length > 0 && !hasInitialized) {
        // A simple dependency check. If an element is null/undefined, don't fetch.
        if (dependencies.every(dep => dep !== null && dep !== undefined)) {
            fetchData();
        }
    }
  }, [...dependencies, hasInitialized]);

  // Reset on page refresh (when component unmounts and remounts)
  useEffect(() => {
    return () => {
      setData(null);
      setHasInitialized(false);
    };
  }, []);

  return { data, loading, error, refresh, fetchData };
}

// Lab hooks
export function useLab() {
  const { api } = useApi();
  const labData = useApiData((options) => api.lab.get(options), [true]); // Fetch on mount
  const createOrUpdateLab = useCallback(async (data) => {
    const result = data.get('_id') ? await api.lab.update(data.get('_id'), data) : await api.lab.create(data);
    labData.refresh();
    return result;
  }, [api.lab, labData.refresh]);

  return {
    lab: labData.data,
    loading: labData.loading,
    error: labData.error,
    refresh: labData.refresh,
    createOrUpdateLab,
  };
}

// Test Groups hooks
export function useTestGroups(params = {}) {
  const { api } = useApi();
  const { data, loading, error, refresh } = useApiData(
    (options) => api.testGroups.getAll(params, options),
    [JSON.stringify(params)]
  );

  const createTestGroup = useCallback(async (groupData) => {
    const result = await api.testGroups.create(groupData);
    refresh();
    return result;
  }, [api.testGroups, refresh]);

  const updateTestGroup = useCallback(async (id, groupData) => {
    const result = await api.testGroups.update(id, groupData);
    refresh();
    return result;
  }, [api.testGroups, refresh]);

  const deleteTestGroup = useCallback(async (id) => {
    await api.testGroups.delete(id);
    refresh();
  }, [api.testGroups, refresh]);

  const addTest = useCallback(async (groupId, testData) => {
    const result = await api.testGroups.addTest(groupId, testData);
    refresh();
    return result;
  }, [api.testGroups, refresh]);

  const updateTest = useCallback(async (testId, testData) => {
    const result = await api.testGroups.updateTest(testId, testData);
    refresh();
    return result;
  }, [api.testGroups, refresh]);
  
  const removeTest = useCallback(async (groupId, testId) => {
    await api.testGroups.removeTest(groupId, testId);
    refresh();
  }, [api.testGroups, refresh]);

  return {
    testGroups: data || [],
    loading,
    error,
    refresh,
    createTestGroup,
    updateTestGroup,
    deleteTestGroup,
    addTest,
    updateTest,
    removeTest,
  };
}

// Single Test Group hook
export function useTestGroup(id) {
  const { api } = useApi();
  const { data, loading, error, refresh } = useApiData(
    (options) => api.testGroups.getById(id, options),
    [id]
  );
  return { testGroup: data, loading, error, refresh };
}

// Bills hooks
export function useBills(params = {}) {
  const { api } = useApi();
  const { data, loading, error, refresh } = useApiData(
    (options) => api.bills.getAll(params, options),
    [JSON.stringify(params)]
  );
  
  const createBill = useCallback(async (billData) => {
    const result = await api.bills.create(billData);
    refresh();
    return result;
  }, [api.bills, refresh]);

  const updateBill = useCallback(async (id, billData) => {
    const result = await api.bills.update(id, billData);
    refresh();
    return result;
  }, [api.bills, refresh]);
  
  const deleteBill = useCallback(async (id) => {
    await api.bills.delete(id);
    refresh();
  }, [api.bills, refresh]);
  
  const updatePayment = useCallback(async (id, paymentData) => {
    const result = await api.bills.updatePayment(id, paymentData);
    refresh();
    return result;
  }, [api.bills, refresh]);

  return {
    bills: data?.bills || [],
    pagination: {
      totalPages: data?.totalPages || 0,
      currentPage: data?.currentPage || 1,
      total: data?.total || 0
    },
    loading,
    error,
    refresh,
    createBill,
    updateBill,
    deleteBill,
    updatePayment
  };
}

// Single Bill hook
export function useBill(id) {
  const { api } = useApi();
  const { data, loading, error, refresh } = useApiData(
    (options) => api.bills.getById(id, options),
    [id]
  );
  

  
  return { bill: data, loading, error, refresh };
}

// Report hook
export function useReport(billId) {
    const { api } = useApi();
    const { data, loading, error, refresh } = useApiData(
        (options) => api.reports.getByBillId(billId, options),
        [billId]
    );

    const updateReport = useCallback(async (reportId, updateData) => {
        try {
            const result = await api.reports.update(reportId, updateData);
            // Force multiple refresh attempts to ensure cache is cleared
            setTimeout(() => refresh(), 100);
            setTimeout(() => refresh(), 500);
            return result;
        } catch (error) {
            throw error;
        }
    }, [api.reports, refresh]);

    return {
        report: data,
        loading,
        error,
        refresh,
        updateReport,
    };
}


// Bills statistics hook
export function useBillStats(params = {}) {
  const { api } = useApi();
  const { data, loading, error, refresh } = useApiData(
    (options) => api.bills.getStats(params, options),
    [JSON.stringify(params)] // Fetch when params change
  );

  return {
    stats: data || {
      totalBills: 0,
      todaysBills: 0,
      pendingPayments: 0,
      completedBills: 0,
      totalRevenue: 0,
      todaysRevenue: 0,
      totalCases: 0,
      totalPaymentReceived: 0,
      pendingPaymentAmount: 0,
      pendingPaymentCount: 0,
      paidBillsCount: 0,
      partiallyPaidCount: 0,
      averageBillValue: 0,
      collectionEfficiency: 0,
      topTestGroups: [],
      paymentMethodBreakdown: [],
      monthlyTrend: []
    },
    loading,
    error,
    refresh
  };
}

// Search hook for any entity
export function useSearch(searchFunction, searchTerm, debounceMs = 300) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      if (!searchTerm) {
        setResults([]);
        return;
      }
  
      const timeoutId = setTimeout(async () => {
        try {
          setLoading(true);
          setError(null);
          const searchResults = await searchFunction(searchTerm);
          setResults(searchResults);
        } catch (err) {
          setError(err);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
  
      return () => clearTimeout(timeoutId);
    }, [searchTerm, searchFunction, debounceMs]);
  
    return { results, loading, error };
}

// Payment Modes hooks  
export const usePaymentModes = (options) => {
  const { api, getCachedData, isLoading } = useApi();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const refresh = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.paymentModes.getAll({ force });
      setData(response || []);
      setInitialized(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [api.paymentModes]);

  useEffect(() => {
    // Check if we already have cached data
    const cachedData = getCachedData('payment-modes');
    const currentlyLoading = isLoading('payment-modes');
    
    if (cachedData && !initialized) {
      setData(cachedData);
      setInitialized(true);
    } else if (!cachedData && !currentlyLoading && !initialized) {
      refresh(options?.force);
    }
  }, [refresh, getCachedData, isLoading, initialized, options?.force]);

  return {
    paymentModes: data,
    loading,
    error,
    refresh,
    createPaymentMode: api.paymentModes.create,
    updatePaymentMode: api.paymentModes.update,
    deletePaymentMode: api.paymentModes.delete
  };
};

// Settings hooks
export const useSettings = (options) => {
  const { api, getCachedData, isLoading } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const refresh = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.settings.get({ force });
      setData(response);
      setInitialized(true);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [api.settings]);

  useEffect(() => {
    // Check if we already have cached data
    const cachedData = getCachedData('settings');
    const currentlyLoading = isLoading('settings');
    
    if (cachedData && !initialized) {
      setData(cachedData);
      setInitialized(true);
    } else if (!cachedData && !currentlyLoading && !initialized) {
      refresh(options?.force);
    }
  }, [refresh, getCachedData, isLoading, initialized, options?.force]);

  return {
    settings: data,
    loading,
    error,
    refresh,
    updateSettings: api.settings.update
  };
};

// Referred Doctors hooks
export function useDoctors(params = {}) {
  const { api } = useApi();
  const { data, loading, error, refresh } = useApiData(
    (options) => api.referredDoctors.getAll(params, options),
    [JSON.stringify(params)]
  );

  const createDoctor = useCallback(async (doctorData) => {
    const result = await api.referredDoctors.create(doctorData);
    refresh();
    return result;
  }, [api.referredDoctors, refresh]);

  const updateDoctor = useCallback(async (id, doctorData) => {
    const result = await api.referredDoctors.update(id, doctorData);
    refresh();
    return result;
  }, [api.referredDoctors, refresh]);

  const deleteDoctor = useCallback(async (id) => {
    await api.referredDoctors.delete(id);
    refresh();
  }, [api.referredDoctors, refresh]);

  return {
    doctors: data?.doctors || [],
    pagination: {
      totalPages: data?.totalPages || 0,
      currentPage: data?.currentPage || 1,
      total: data?.total || 0
    },
    loading,
    error,
    refresh,
    createDoctor,
    updateDoctor,
    deleteDoctor,
  };
}

// Single Doctor hook
export function useDoctor(id) {
  const { api } = useApi();
  const { data, loading, error, refresh } = useApiData(
    (options) => api.referredDoctors.getById(id, options),
    [id]
  );
  return { doctor: data, loading, error, refresh };
}

// Search doctor by mobile hook
export function useSearchDoctor() {
  const { api } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchByMobile = useCallback(async (mobile) => {
    if (!mobile || mobile.length !== 10 || !/^[0-9]{10}$/.test(mobile)) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await api.referredDoctors.searchByMobile(mobile);
      return result?.doctor || null;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [api.referredDoctors]);

  return { searchByMobile, loading, error };
}

export function useDoctorBills(doctorId, params = {}) {
    const { api } = useApi();
    const { data, loading, error, refresh } = useApiData(
        (options) => api.referredDoctors.getBills(doctorId, params, options),
        [doctorId, JSON.stringify(params)]
    );

    return {
        bills: data?.bills || [],
        doctor: data?.doctor || null,
        pagination: {
            total: data?.total || 0,
            totalPages: data?.totalPages || 0,
            currentPage: data?.currentPage || 1
        },
        loading,
        error,
        refresh,
    };
}

export function useCacheInfo() {
  const { api } = useApi();
  return api.getCacheInfo();
} 