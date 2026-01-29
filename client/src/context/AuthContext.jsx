// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, register as registerAPI } from '../api/auth.api';
import { setToken, setUser, getUser, clearAuth } from '../utils/storage';

const AuthContext = createContext();

// Set this to true to use mock data (for development without backend)
const USE_MOCK_DATA = true;

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
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required.');
      }

      // USE MOCK DATA FOR DEVELOPMENT (switch to false when backend is ready)
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // ✨ UPDATED: Check if it's admin login (any credentials work for admin email)
      // In the login method, after admin login:
if (credentials.email === 'admin@gmail.com') {
  const mockToken = 'mock-jwt-token-admin-' + Date.now();
  
  const adminUser = {
    id: 'admin_001',
    name: 'System Administrator',
    email: 'admin@gmail.com',
    role: 'admin',
    course: 'Administration',
    year: 'N/A',
    studentId: 'ADMIN001',
    
    // Admin stats
    gpa: 0,
    totalCredits: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
    studyStreak: 0,
    studyHoursWeek: 0,
    upcomingDeadlines: 0,
    
    phone: '',
    bio: 'System Administrator',
    avatar: null,
    
    // ✅ CRITICAL: Admin never needs onboarding
    onboardingCompleted: true,
    assessmentCompleted: true,
    
    joinDate: new Date().toISOString(),
    
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
    },
    
    academicStats: {
      completedCourses: 0,
      currentCourses: 0,
      averageGrade: 'N/A',
      honors: [],
    },
    
    recentActivity: [],
    upcomingTasks: [],
    courses: [],
  };
  
  setToken(mockToken);
  setUser(adminUser);
  setUserState(adminUser);
  setIsAuthenticated(true);
  
  return { token: mockToken, user: adminUser };
}
        // FIXED: For mock mode, accept any student credentials (no prior registration needed)
        // In production, backend will validate
        if (credentials.password.length < 6) {
          throw new Error('Invalid credentials.');
        }

        // Check if user exists in storage with this email
        const storedUser = getUser();
        let userToLogin;

        if (storedUser && storedUser.email === credentials.email) {
          // User exists in storage, use their data
          userToLogin = storedUser;
        } else {
          // User doesn't exist: Create a temporary user object for mock testing
          // This allows testing login flow without prior registration
          userToLogin = {
            id: 'user_' + Date.now(),
            name: credentials.email.split('@')[0],
            email: credentials.email,
            role: 'Student',
            course: 'Not specified',
            year: 'Not specified',
            studentId: 'ST' + Math.floor(Math.random() * 10000),
            
            gpa: 0,
            totalCredits: 0,
            completedAssessments: 0,
            pendingAssessments: 0,
            studyStreak: 0,
            studyHoursWeek: 0,
            upcomingDeadlines: 0,
            
            phone: '',
            bio: '',
            avatar: null,
            
            onboardingCompleted: false,
            assessmentCompleted: false,
            
            joinDate: new Date().toISOString(),
            
            address: {
              street: '',
              city: '',
              state: '',
              zip: '',
            },
            
            academicStats: {
              completedCourses: 0,
              currentCourses: 0,
              averageGrade: 'N/A',
              honors: [],
            },
            
            recentActivity: [],
            upcomingTasks: [],
            courses: [],
          };
        }

        const mockToken = 'mock-jwt-token-' + Date.now();
        
        // Store token and user
        setToken(mockToken);
        setUser(userToLogin);
        
        // Update state
        setUserState(userToLogin);
        setIsAuthenticated(true);
        
        return { token: mockToken, user: userToLogin };
      }
      
      // REAL API CALL (use when backend is ready)
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
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  // Register method - NEW USERS START WITH ZERO DATA
  const register = async (userData) => {
    try {
      // USE MOCK DATA FOR DEVELOPMENT
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (userData.email && userData.password && userData.name) {
          const mockToken = 'mock-jwt-token-' + Date.now();
          
          // NEW USER - ALL STATS START AT ZERO
          const newUser = {
            id: 'user_' + Date.now(),
            name: userData.name,
            email: userData.email,
            role: 'Student',
            course: userData.course || 'Not specified',
            year: userData.year || 'Not specified',
            studentId: 'ST' + Math.floor(Math.random() * 10000),
            
            // ALL ACADEMIC STATS START AT ZERO
            gpa: 0,
            totalCredits: 0,
            completedAssessments: 0,
            pendingAssessments: 0,
            studyStreak: 0,
            studyHoursWeek: 0,
            upcomingDeadlines: 0,
            
            // EMPTY PROFILE INFO
            phone: '',
            bio: '',
            avatar: null,
            
            // ONBOARDING FLAGS
            onboardingCompleted: false,
            assessmentCompleted: false,
            
            joinDate: new Date().toISOString(),
            
            address: {
              street: '',
              city: '',
              state: '',
              zip: '',
            },
            
            academicStats: {
              completedCourses: 0,
              currentCourses: 0,
              averageGrade: 'N/A',
              honors: [],
            },
            
            // EMPTY ARRAYS - NO DATA UNTIL USER CREATES IT
            recentActivity: [],
            upcomingTasks: [],
            courses: [],
          };
          
          // Store token and user
          setToken(mockToken);
          setUser(newUser);
          
          // Update state
          setUserState(newUser);
          setIsAuthenticated(true);
          
          return { token: mockToken, user: newUser };
        } else {
          throw new Error('All fields are required');
        }
      }
      
      // REAL API CALL
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
      throw new Error(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
    }
  };

  // Update user profile (for onboarding and assessment results)
  const updateProfile = async (updatedData) => {
    try {
      if (USE_MOCK_DATA) {
        // Merge updated data with existing user data
        const updatedUser = { ...user, ...updatedData };
        
        // Save to localStorage
        setUser(updatedUser);
        
        // Update state
        setUserState(updatedUser);
        
        return updatedUser;
      }
      
      // REAL API CALL when backend is ready
      // const response = await api.put('/auth/profile', updatedData);
      // setUser(response.data);
      // setUserState(response.data);
      // return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
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