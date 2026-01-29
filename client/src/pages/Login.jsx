// client/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUserShield, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const result = await login(formData);
    
    // ✅ SMART REDIRECT LOGIC
    const isAdmin = result.user.role === 'admin' || result.user.email === 'admin@gmail.com';
    
    if (isAdmin) {
      // ✅ Admin → Admin Dashboard (no onboarding)
      navigate('/admin');
    } else if (result.user.onboardingCompleted) {
      // ✅ Existing student → Student Dashboard (skip onboarding)
      navigate('/dashboard');
    } else {
      // ✅ New student → Onboarding
      navigate('/onboarding');
    }
  } catch (err) {
    setError(err.message || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleAdminChange = (e) => {
    setAdminCredentials({
      ...adminCredentials,
      [e.target.name]: e.target.value,
    });
  };
const handleAdminSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const result = await login(adminCredentials);
    
    // ✅ Admin should ALWAYS go to admin dashboard
    if (result.user.role === 'admin' || result.user.email === 'admin@gmail.com') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
    
    setShowAdminModal(false);
  } catch (err) {
    setError(err.message || 'Admin login failed.');
  } finally {
    setLoading(false);
  }
};

  const closeAdminModal = () => {
    setShowAdminModal(false);
    setAdminCredentials({ email: '', password: '' });
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Academic Advisor</h1>
        <p className="login-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          onClick={() => setShowAdminModal(true)}
          className="admin-login-button"
          disabled={loading}
        >
          <FaUserShield />
          <span>Login as Admin</span>
        </button>

        <p className="register-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>

      {/* ✨ NEW: Admin Login Modal */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={closeAdminModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Admin Login</h2>
              <button
                className="modal-close-btn"
                onClick={closeAdminModal}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="admin-login-form">
              {error && <div className="error-message">{error}</div>}

              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Admin Email"
                  value={adminCredentials.email}
                  onChange={handleAdminChange}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Admin Password"
                  value={adminCredentials.password}
                  onChange={handleAdminChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeAdminModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;