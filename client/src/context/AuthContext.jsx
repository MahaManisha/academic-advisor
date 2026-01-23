import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, register as registerAPI } from '../api/auth.api';
import { setToken, setUser, getUser, clearAuth } from '../utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app load
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = getUser();
        if (storedUser) {
          setUserState(storedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login method
  const login = async (credentials) => {
    try {
      const data = await loginAPI(credentials);
      
      // Store token and user
      setToken(data.token);
      setUser(data.user);
      
      // Update state
      setUserState(data.user);
      setIsAuthenticated(true);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Register method
  const register = async (userData) => {
    try {
      const data = await registerAPI(userData);
      
      // Store token and user
      setToken(data.token);
      setUser(data.user);
      
      // Update state
      setUserState(data.user);
      setIsAuthenticated(true);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Logout method
  const logout = () => {
    clearAuth();
    setUserState(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};