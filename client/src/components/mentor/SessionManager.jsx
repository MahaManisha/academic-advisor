import { FaCalendarAlt, FaClock, FaVideo } from 'react-icons/fa';

const SessionManager = () => {
  // Mock data for now, ideally fetched from API
  const upcomingSessions = [
    { id: 1, student: 'Alex Johnson', date: 'Tomorrow, 10:00 AM', topic: 'React Fundamentals' },
    { id: 2, student: 'Sarah Smith', date: 'Friday, 2:00 PM', topic: 'System Design Interview Prep' }
  ];

  return (
    <div className="content-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div className="section-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaCalendarAlt style={{ color: '#f59e0b' }}/> Upcoming Sessions
        </h2>
        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
          + New Session
        </button>
      </div>

      {upcomingSessions.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>No upcoming sessions scheduled.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {upcomingSessions.map(session => (
            <li key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#111827' }}>{session.student}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaClock /> {session.date} | {session.topic}
                </p>
              </div>
              <button className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#2563eb', border: 'none' }}>
                <FaVideo /> Join Link
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SessionManager;
