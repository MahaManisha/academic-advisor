import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaBriefcase, FaGraduationCap, FaTags } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios'; // assuming axios config exists
import './Register.css'; // Reuse register styling

const MentorSignup = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    qualification: '',
    experience: '',
    domain: '',
    skills: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      // In a real flow we would use OTP, but for simplicity here we just register directly
      // using the completeRegistration endpoint assuming OTP is bypassed for mentors,
      // OR we can simulate it. Assuming we add a direct mentor registration endpoint:
      
      const response = await api.post('/auth/register-mentor', {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()),
        role: 'mentor'
      });

      if (response.data.success) {
        // Manually set token in storage since we bypassed standard AuthContext login
        localStorage.setItem('token', response.data.token);
        // Refresh auth state if necessary or just navigate
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/mentor-onboarding'; // Force full reload to catch token
        }, 2000);
      }
    } catch (err) {
      console.error("Mentor Registration Error:", err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-container">
        <div className="register-card text-center fade-in">
          <h2>Registration Successful! 🎉</h2>
          <p>Redirecting you to the AI Onboarding Assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card" style={{ maxWidth: '600px' }}>
        <h1 className="register-title">Become a Mentor 🚀</h1>
        <p className="register-subtitle">
          Share your knowledge, guide students, and build your reputation.
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
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
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
            />
          </div>

          <div className="input-group">
            <FaBriefcase className="input-icon" />
            <input
              type="text"
              name="domain"
              placeholder="Domain (e.g., Web Development, AI, Cybersecurity)"
              value={formData.domain}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaGraduationCap className="input-icon" />
            <input
              type="text"
              name="qualification"
              placeholder="Highest Qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaBriefcase className="input-icon" />
            <input
              type="number"
              name="experience"
              placeholder="Years of Experience"
              value={formData.experience}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaTags className="input-icon" />
            <input
              type="text"
              name="skills"
              placeholder="Skills (comma separated, e.g., React, Node, Python)"
              value={formData.skills}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="register-button pulse-on-hover" disabled={loading}>
            {loading ? 'Processing...' : 'Register as Mentor'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default MentorSignup;
