//client/src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import { 
  FaGraduationCap, 
  FaRobot, 
  FaUsers, 
  FaChartLine,
  FaBook,
  FaCalendarAlt 
} from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaRobot />,
      title: 'AI-Powered Guidance',
      description: 'Get personalized academic advice 24/7 from our intelligent chatbot'
    },
    {
      icon: <FaChartLine />,
      title: 'Performance Analytics',
      description: 'Track your progress with detailed analytics and insights'
    },
    {
      icon: <FaUsers />,
      title: 'Peer Collaboration',
      description: 'Connect with peers and mentors for collaborative learning'
    },
    {
      icon: <FaCalendarAlt />,
      title: 'Smart Study Planner',
      description: 'Adaptive study schedules that fit your learning pace'
    },
    {
      icon: <FaBook />,
      title: 'Personalized Learning',
      description: 'Customized content based on your strengths and weaknesses'
    },
    {
      icon: <FaGraduationCap />,
      title: 'Career Preparation',
      description: 'Resume building and interview practice tools'
    }
  ];

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <FaGraduationCap className="brand-icon" />
            <span className="brand-name">Academic Advisor</span>
          </div>
          <div className="navbar-actions">
            <button 
              className="btn-nav-login" 
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="btn-nav-signup" 
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Intelligent Academic Companion
          </h1>
          <p className="hero-subtitle">
            Personalized learning, AI-driven guidance, and peer collaboration 
            all in one platform
          </p>
          <div className="hero-actions">
            <button 
              className="btn-hero-primary" 
              onClick={() => navigate('/register')}
            >
              Get Started Free
            </button>
            <button 
              className="btn-hero-secondary" 
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-illustration">
            <FaGraduationCap />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Everything You Need to Excel</h2>
          <p className="section-subtitle">
            Comprehensive tools designed for modern learners
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="section-container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">10,000+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">95%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">50+</div>
              <div className="stat-label">Subjects Covered</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">24/7</div>
              <div className="stat-label">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Learning?</h2>
          <p className="cta-subtitle">
            Join thousands of students achieving their academic goals
          </p>
          <button 
            className="btn-cta" 
            onClick={() => navigate('/register')}
          >
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-brand">
              <FaGraduationCap className="footer-icon" />
              <span className="footer-brand-name">Academic Advisor</span>
            </div>
            <p className="footer-description">
              Empowering students with AI-driven academic support and 
              personalized learning experiences.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Product</h4>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#about">About Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Academic Advisor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;