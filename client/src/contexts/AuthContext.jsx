import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    if (token) {
      fetchClientInfo();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchClientInfo = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClient(data.client);
      } else {
        // Token is invalid, clear it
        logout();
      }
    } catch (error) {
      console.error('Error fetching client info:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        const { token: newToken, client: clientData } = data;
        
        setToken(newToken);
        setClient(clientData);
        localStorage.setItem('authToken', newToken);
        
        toast.success(`Welcome, ${clientData.organizationName}!`);
        return { success: true };
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Login failed');
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      toast.error('Login error: ' + error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setClient(null);
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully');
  };

  const verifyPin = async (secretPin) => {
    try {
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ secretPin })
      });

      if (response.ok) {
        toast.success('PIN verified successfully');
        return { success: true };
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Invalid PIN');
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      toast.error('PIN verification error: ' + error.message);
      return { success: false, message: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        return { success: true };
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to change password');
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      toast.error('Password change error: ' + error.message);
      return { success: false, message: error.message };
    }
  };

  const changePin = async (currentPin, newPin) => {
    try {
      const response = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPin, newPin })
      });

      if (response.ok) {
        toast.success('Secret PIN changed successfully');
        return { success: true };
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to change PIN');
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      toast.error('PIN change error: ' + error.message);
      return { success: false, message: error.message };
    }
  };

  const isAuthenticated = !!token && !!client;

  const value = {
    client,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    verifyPin,
    changePassword,
    changePin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
