import { FaUserGraduate, FaStar, FaChalkboardTeacher, FaHistory } from 'react-icons/fa';

const MentorStatsCards = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card" style={{ "--stat-color": "#4ade80" }}>
        <div className="stat-header">
          <div className="stat-icon" style={{ background: `linear-gradient(135deg, #4ade80 0%, rgba(0,0,0,0.5) 100%)`, border: `1px solid #4ade80` }}>
            <FaUserGraduate />
          </div>
        </div>
        <div className="stat-label">Active Students</div>
        <div className="stat-value">{stats?.totalStudents || 0}</div>
      </div>

      <div className="stat-card" style={{ "--stat-color": "#facc15" }}>
        <div className="stat-header">
          <div className="stat-icon" style={{ background: `linear-gradient(135deg, #facc15 0%, rgba(0,0,0,0.5) 100%)`, border: `1px solid #facc15` }}>
            <FaStar />
          </div>
        </div>
        <div className="stat-label">Mentor Rating</div>
        <div className="stat-value">{stats?.rating?.toFixed(1) || "5.0"} <span>⭐</span></div>
      </div>

      <div className="stat-card" style={{ "--stat-color": "#a78bfa" }}>
        <div className="stat-header">
          <div className="stat-icon" style={{ background: `linear-gradient(135deg, #a78bfa 0%, rgba(0,0,0,0.5) 100%)`, border: `1px solid #a78bfa` }}>
            <FaChalkboardTeacher />
          </div>
        </div>
        <div className="stat-label">Pending Requests</div>
        <div className="stat-value">{stats?.pendingRequests || 0}</div>
      </div>

      <div className="stat-card" style={{ "--stat-color": "#60a5fa" }}>
        <div className="stat-header">
          <div className="stat-icon" style={{ background: `linear-gradient(135deg, #60a5fa 0%, rgba(0,0,0,0.5) 100%)`, border: `1px solid #60a5fa` }}>
            <FaHistory />
          </div>
        </div>
        <div className="stat-label">Total Sessions</div>
        <div className="stat-value">{stats?.totalSessions || 0}</div>
      </div>
    </div>
  );
};

export default MentorStatsCards;
