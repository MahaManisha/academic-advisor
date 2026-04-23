import { FaChalkboardTeacher, FaUserGraduate, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../../api/axios';

const StudentRequests = ({ requests, setRequests, refreshStats }) => {

  const handleRespond = async (requestId, status) => {
    try {
      const response = await api.post('/mentor/respond', { requestId, status });
      if (response.data.success) {
        setRequests(requests.filter(req => req._id !== requestId));
        if (status === 'accepted' && refreshStats) {
          refreshStats();
        }
      }
    } catch (err) {
      console.error(`Failed to ${status} request:`, err);
    }
  };

  return (
    <div className="content-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', flex: 2 }}>
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaChalkboardTeacher style={{ color: '#a78bfa' }}/> Mentorship Requests
        </h2>
      </div>
      
      {!requests || requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px', color: '#e5e7eb' }}><FaUserGraduate /></div>
          <p>No pending requests at the moment.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {requests.map(req => (
            <li key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', marginBottom: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#111827' }}>{req.studentId?.fullName}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  <strong>{req.studentId?.course || 'General'}</strong> - {req.message}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleRespond(req._id, 'accepted')} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaCheckCircle /> Accept
                </button>
                <button onClick={() => handleRespond(req._id, 'rejected')} className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '5px', background: '#fee2e2', color: '#ef4444', border: 'none' }}>
                  <FaTimesCircle /> Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentRequests;
