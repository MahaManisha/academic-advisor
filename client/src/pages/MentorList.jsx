import { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaUserPlus } from 'react-icons/fa';
import api from '../api/axios';
import './Dashboard.css'; // Reuse container styling

const MentorList = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState('');
  const [requestingId, setRequestingId] = useState(null);

  useEffect(() => {
    fetchMentors();
  }, [domainFilter]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mentor/ranked', { params: { domain: domainFilter } });
      if (response.data.success) {
        setMentors(response.data.mentors);
      }
    } catch (err) {
      console.error("Failed to fetch mentors", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = async (mentorId) => {
    setRequestingId(mentorId);
    try {
      const response = await api.post('/mentor/request', {
        mentorId,
        message: "Hi, I'm looking for guidance in your domain. I would love to connect!"
      });
      if (response.data.success) {
        alert("Mentorship request sent successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request.");
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Discover Mentors 🌟</h1>
          <p>Find top-rated experts to guide you in your academic and career journey.</p>
        </div>
        
        <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
          <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input 
            type="text" 
            placeholder="Filter by Domain..." 
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 15px 12px 40px', 
              borderRadius: '8px', 
              background: 'rgba(0,0,0,0.3)', 
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff'
            }} 
          />
        </div>
      </header>

      {loading ? (
        <div className="loading-spinner">Loading expert mentors...</div>
      ) : mentors.length === 0 ? (
        <div className="empty-state text-center" style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
          <h3>No mentors found</h3>
          <p>Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="mentors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
          {mentors.map(mentor => (
            <div key={mentor.id} className="mentor-card glass-panel" style={{ padding: '25px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #a78bfa, #3b82f6)' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{mentor.name}</h3>
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>{mentor.domain} • {mentor.experience} Yrs Exp</p>
                </div>
                <div style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15', padding: '5px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                  <FaStar style={{ marginRight: '5px' }} /> {mentor.rating.toFixed(1)}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {mentor.skills.slice(0, 4).map(skill => (
                    <span key={skill} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#cbd5e1' }}>
                      {skill}
                    </span>
                  ))}
                  {mentor.skills.length > 4 && <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>+{mentor.skills.length - 4} more</span>}
                </div>
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                onClick={() => handleRequestMentorship(mentor.id)}
                disabled={requestingId === mentor.id}
              >
                {requestingId === mentor.id ? 'Sending...' : <><FaUserPlus style={{ marginRight: '8px' }} /> Connect</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorList;
