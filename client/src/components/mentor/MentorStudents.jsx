import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaComment, FaCalendarPlus, FaTrash } from 'react-icons/fa';
import api from '../../api/axios';

const MentorStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
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

  const handleDelete = async (requestId) => {
    if (!window.confirm("Are you sure you want to remove this student?")) return;
    
    try {
      const response = await api.delete(`/mentor/student/${requestId}`);
      if (response.data.success) {
        setStudents(prev => prev.filter(s => s.requestId !== requestId));
      }
    } catch (err) {
      console.error("Failed to delete student:", err);
      alert("Failed to remove student. Please try again.");
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#00ffcc' }}>Loading your students...</div>;
  }

  return (
    <div className="content-section">
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaUsers style={{ color: '#00ffcc' }}/> My Students
        </h2>
      </div>

      {students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#8b949e' }}>
          <p>You haven't accepted any students yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {students.map(student => (
            <div key={student._id} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>
              <button 
                onClick={() => handleDelete(student.requestId)}
                style={{ 
                  position: 'absolute', 
                  top: '15px', 
                  right: '15px', 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#ff4757', 
                  cursor: 'pointer',
                  fontSize: '16px',
                  opacity: 0.7,
                  transition: 'opacity 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
                title="Remove Student"
              >
                <FaTrash />
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '25px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '18px', color: '#ffffff', fontFamily: 'Orbitron, sans-serif' }}>{student.fullName}</h4>
                  <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#8b949e' }}>{student.course || 'General Student'}</p>
                </div>
                <span className="nav-link-badge" style={{ fontSize: '10px', background: '#dcfce7', color: '#166534', boxShadow: 'none' }}>
                  {student.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                <button 
                  className="card-button" 
                  style={{ flex: 1, padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '12px' }}
                  onClick={() => navigate(`/mentor/chat?id=${student._id}`)}
                >
                  <FaComment /> CHAT
                </button>
                <button 
                  className="card-button" 
                  style={{ flex: 1, padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '12px', '--card-color': '#ff00ff', '--card-rgb': '255, 0, 255' }}
                  onClick={() => navigate(`/mentor/sessions?studentId=${student._id}`)}
                >
                  <FaCalendarPlus /> SESSION
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
