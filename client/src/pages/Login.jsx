// client/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUserShield, FaChalkboardTeacher, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { triggerAction } = useGamification();
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
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [mentorCredentials, setMentorCredentials] = useState({
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
      const isAdmin = result.user.role === 'admin';
      const isMentor = result.user.role === 'mentor';

      if (isAdmin) {
        // ✅ Admin → Admin Dashboard (no onboarding)
        navigate('/admin/dashboard');
      } else if (isMentor) {
        // ✅ Mentor → Mentor Dashboard or Onboarding
        if (!result.user.onboardingCompleted) {
          navigate('/mentor-onboarding');
        } else {
          navigate('/mentor-dashboard');
        }
      } else {
        await triggerAction('DAILY_LOGIN');

        // Redirect to onboarding if not completed
        if (!result.user.onboardingCompleted) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('verify')) {
        setError(
          <span>
            {err.message} <br />
            <small>Please check your inbox or spam folder.</small>
          </span>
        );
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminChange = (e) => {
    setAdminCredentials({
      ...adminCredentials,
      [e.target.name]: e.target.value,
    });
    // ✅ NEW: Clear error when typing in admin modal
    if (error) setError('');
  };
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(adminCredentials);

      // ✅ Admin should ALWAYS go to admin dashboard
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
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

  const handleMentorChange = (e) => {
    setMentorCredentials({
      ...mentorCredentials,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleMentorSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(mentorCredentials);

      if (result.user.role === 'mentor') {
        if (!result.user.onboardingCompleted) {
          navigate('/mentor-onboarding');
        } else {
          navigate('/mentor-dashboard');
        }
      } else {
        // Fallback for non-mentors logging in here
        navigate('/dashboard');
      }

      setShowMentorModal(false);
    } catch (err) {
      setError(err.message || 'Mentor login failed.');
    } finally {
      setLoading(false);
    }
  };

  const closeMentorModal = () => {
    setShowMentorModal(false);
    setMentorCredentials({ email: '', password: '' });
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

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAdminModal(true)}
            className="admin-login-button"
            disabled={loading}
            style={{ flex: 1 }}
          >
            <FaUserShield />
            <span>Login as Admin</span>
          </button>

          <button
            onClick={() => setShowMentorModal(true)}
            className="admin-login-button"
            disabled={loading}
            style={{ flex: 1, borderColor: '#a78bfa', color: '#a78bfa' }}
          >
            <FaChalkboardTeacher />
            <span>Login as Mentor</span>
          </button>
        </div>

        <p className="register-link" style={{ marginTop: '20px' }}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
        <p className="register-link" style={{ marginTop: '5px' }}>
          Want to guide others? <Link to="/mentor-signup">Apply as Mentor</Link>
        </p>
      </div>

      {/* ✨ NEW: Admin Login Modal - Render outside for better event handling */}
      {showAdminModal && (
        <div className="modal-overlay" onMouseDown={closeAdminModal}>
          <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Admin Login</h2>
              <button
                className="modal-close-btn"
                onClick={closeAdminModal}
                type="button"
                aria-label="Close"
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
                  autoComplete="email"
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
                  autoComplete="current-password"
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

      {/* ✨ Mentor Login Modal */}
      {showMentorModal && (
        <div className="modal-overlay" onMouseDown={closeMentorModal}>
          <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mentor Login</h2>
              <button
                className="modal-close-btn"
                onClick={closeMentorModal}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleMentorSubmit} className="admin-login-form">
              {error && <div className="error-message">{error}</div>}

              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Mentor Email"
                  value={mentorCredentials.email}
                  onChange={handleMentorChange}
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
                  placeholder="Password"
                  value={mentorCredentials.password}
                  onChange={handleMentorChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeMentorModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                  style={{ background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }}
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