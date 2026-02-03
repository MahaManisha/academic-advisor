// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, register as registerAPI, getMe } from '../api/auth.api';
import { setToken, setUser, getUser, clearAuth, getToken } from '../utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user from backend on app load
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token and get fresh user data
        const data = await getMe();
        if (data.success && data.user) {
          setUserState(data.user);
          setIsAuthenticated(true);
          // Update local storage with fresh data
          setUser(data.user);
        } else {
          throw new Error('Invalid response');
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        clearAuth();
        setUserState(null);
        setIsAuthenticated(false);
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
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
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
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  // Update user profile (sync state)
  const updateProfile = async (updatedUser) => {
    setUser(updatedUser);
    setUserState(updatedUser);
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
    updateProfile,
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

