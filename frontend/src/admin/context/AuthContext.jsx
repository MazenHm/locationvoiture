import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add token state
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app load
    const currentUser = authAPI.getCurrentUser();
    const savedToken = localStorage.getItem('token');
    
    if (currentUser && savedToken) {
      setUser(currentUser);
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError('');
      const response = await authAPI.login({ email, password });
      
      // Save token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setUser(response.data.user);
      setToken(response.data.token); // Set token state
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Login failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async ({ name, email, password }) => {
  try {
    setError('');

    const response = await authAPI.register({
      name,
      email,
      password,
      role: 'client'
    });

    return { success: true, data: response.data };
  } catch (err) {
    const errorMsg =
      err.response?.data?.msg || 'Registration failed. Please try again.';
    setError(errorMsg);
    return { success: false, error: errorMsg };
  }
};

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setToken(null); // Clear token state
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const clearError = () => {
    setError('');
  };

  const value = {
    user,
    token, // Add token to context value
    loading,
    error,
    setError,
    clearError,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: authAPI.isAuthenticated,
    isAdmin: () => user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;