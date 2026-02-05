import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ProgressSteps from '../components/common/ProgressSteps';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Progress Indicator - Step 1 */}
        <ProgressSteps currentStep={1} />

        <h1 className="register-title">Start Your Journey 🚀</h1>
        <p className="register-subtitle">
          Join thousands of students shaping their future with AI.
        </p>

        <form onSubmit={handleSubmit} className="register-form">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email Business/Personal"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <button type="submit" className="register-button pulse-on-hover" disabled={loading}>
            {loading ? (
              <span className="loading-text">Sending Magic Link...</span>
            ) : (
              'Get Started Flow'
            )}
          </button>
        </form>

        <p className="login-link">
          Already a member? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;