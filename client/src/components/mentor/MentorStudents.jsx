import { useState, useEffect } from 'react';
import { FaUsers, FaComment, FaCalendarPlus } from 'react-icons/fa';
import api from '../../api/axios';

const MentorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/mentor/students');
        if (response.data.success) {
          setStudents(response.data.students);
        }
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading your students...</div>;
  }

  return (
    <div className="content-section" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaUsers style={{ color: '#4facfe' }}/> My Students
        </h2>
      </div>

      {students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b7280' }}>
          <p>You haven't accepted any students yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {students.map(student => (
            <div key={student._id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>{student.fullName}</h4>
                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: '#dcfce7', color: '#166534' }}>
                  {student.status}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{student.course || 'General Student'}</p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db' }}>
                  <FaComment /> Chat
                </button>
                <button className="btn-primary" style={{ flex: 1, padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                  <FaCalendarPlus /> Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorStudents;
