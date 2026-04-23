import { FaChartLine, FaStar } from 'react-icons/fa';

const MentorAnalytics = ({ stats }) => {
  return (
    <div className="content-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaChartLine style={{ color: '#10b981' }}/> Performance Summary
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#facc15', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            {stats?.rating?.toFixed(1) || "5.0"} <FaStar />
          </div>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Average Student Rating</p>
        </div>

        <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#60a5fa' }}>
            {stats?.totalSessions || 0}
          </div>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Total Sessions Hosted</p>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
        <p style={{ margin: 0, color: '#334155', fontSize: '14px' }}>
          <strong>Feedback Insight:</strong> Students highly appreciate your deep dives into system architecture. Keep up the great work!
        </p>
      </div>
    </div>
  );
};

export default MentorAnalytics;
