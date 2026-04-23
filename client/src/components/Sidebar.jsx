// client/src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaChartLine,
  FaCalendarAlt,
  FaRobot,
  FaUsers,
  FaUser,
  FaCog,
  FaBook,
  FaGraduationCap,
  FaUserShield,
  FaClipboardList,
  FaTachometerAlt,
  FaCrown,
  FaShieldAlt,
  FaLayerGroup,
  FaCrosshairs,
  FaCompass,
  FaMicrophone,
  FaChalkboardTeacher,
  FaComment
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, user }) => {
  // Check role
  const isAdmin = user?.role === 'admin';
  const isMentor = user?.role === 'mentor';

  // Get actual badge counts from user data
  const pendingAssessments = user?.pendingAssessments || 0;

  // Student navigation links
  const studentNavigationLinks = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    {
      path: '/assessments',
      icon: <FaChartLine />,
      label: 'Assessments',
      badge: pendingAssessments > 0 ? pendingAssessments : null
    },
    { path: '/planner', icon: <FaCalendarAlt />, label: 'Study Planner' },
    { path: '/advisor-chat', icon: <FaRobot />, label: 'AI Advisor' },
    { path: '/peer-chat', icon: <FaUsers />, label: 'Peer Chat' },
    { path: '/mentors', icon: <FaChalkboardTeacher />, label: 'Mentor Hub' },
    { path: '/guilds', icon: <FaShieldAlt />, label: 'Study Factions' },
    { path: '/arena', icon: <FaCrosshairs />, label: 'PvP Arena' },
    { path: '/courses', icon: <FaBook />, label: 'My Courses' },
    { path: '/career', icon: <FaCompass />, label: 'Career Path' },
    { path: '/interview', icon: <FaMicrophone />, label: 'Interview Bot' },
    { path: '/flashcards', icon: <FaLayerGroup />, label: 'Flashcards' },
    { path: '/leaderboard', icon: <FaCrown />, label: 'Topper Board' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
  ];

  // Admin navigation links
  const adminNavigationLinks = [
    { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/leaderboard', icon: <FaCrown />, label: 'Topper Board' },
    { path: '/admin/student-view', icon: <FaGraduationCap />, label: 'Students' },
    { path: '/admin/courses', icon: <FaBook />, label: 'Courses' },
    { path: '/admin/onboarding', icon: <FaClipboardList />, label: 'Onboarding' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
  ];

  // Mentor navigation links
  const mentorNavigationLinks = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/mentor/requests', icon: <FaClipboardList />, label: 'Student Requests' },
    { path: '/mentor/students', icon: <FaUsers />, label: 'My Students' },
    { path: '/mentor/sessions', icon: <FaCalendarAlt />, label: 'Sessions' },
    { path: '/mentor/chat', icon: <FaComment />, label: 'Chat' },
    { path: '/mentor/performance', icon: <FaChartLine />, label: 'Performance' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
  ];

  // Choose navigation based on user role
  const navigationLinks = isAdmin ? adminNavigationLinks : (isMentor ? mentorNavigationLinks : studentNavigationLinks);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <FaGraduationCap />
            <span>AcademicAdvisor</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">
              {isAdmin ? 'Admin Menu' : 'Main Menu'}
            </h3>
            <ul className="nav-list">
              {navigationLinks.map((link) => (
                <li key={link.path} className="nav-item">
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                    {link.badge && <span className="nav-link-badge">{link.badge}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.fullName || user.name} />
              ) : (
                getInitials(user?.fullName || user?.name || 'User')
              )}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.fullName || user?.name || 'Guest User'}</div>
              <div className="user-role">
                {isAdmin ? (
                  <>
                    <FaUserShield style={{ marginRight: '4px', fontSize: '10px' }} />
                    Admin
                  </>
                ) : isMentor ? (
                  <>
                    <FaChalkboardTeacher style={{ marginRight: '4px', fontSize: '10px' }} />
                    Mentor
                  </>
                ) : (
                  user?.role || 'Student'
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;