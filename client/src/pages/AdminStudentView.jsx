import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getAllUsers } from '../api/user.api';
import axios from '../api/axios';
import { FaSearch, FaUserGraduate, FaChartLine, FaBrain, FaBookOpen } from 'react-icons/fa';
import './AdminUsers.css'; // Reuse table styles
import './AdminStudentView.css'; // Modal and specific styles

const AdminStudentView = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Detailed View State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            // Reusing getAllUsers but filtering strictly for students in UI or API
            // Ideally API should support role filter, but for now client side filter is fine if list is small
            const data = await getAllUsers(1, 100);
            setStudents(data.users.filter(u => u.role === 'student'));
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewStudent = async (student) => {
        setSelectedStudent(student);
        setLoadingDetails(true);
        try {
            const res = await axios.get(`/users/${student._id}/profile`);
            if (res.data.success) {
                setStudentDetails(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch details", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeDetailModal = () => {
        setSelectedStudent(null);
        setStudentDetails(null);
    };

    const filteredStudents = students.filter(s =>
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={logout} title="Student View" subtitle="Academic performance & profiles" showSearch={false} />

            <main className="dashboard-main">
                <div className="main-content">
                    {/* Controls */}
                    <div className="users-controls">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Course</th>
                                    <th>Year</th>
                                    <th>Onboarding</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center">Loading...</td></tr>
                                ) : filteredStudents.map(s => (
                                    <tr key={s._id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-small">{s.fullName[0]}</div>
                                                <div className="user-details">
                                                    <span className="user-name">{s.fullName}</span>
                                                    <span className="user-email">{s.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{s.course || 'Unassigned'}</td>
                                        <td>{s.year || 'N/A'}</td>
                                        <td>
                                            <span className={`status-badge ${s.onboardingCompleted ? 'active' : 'suspended'}`}>
                                                {s.onboardingCompleted ? 'Completed' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${s.status === 'active' ? 'active' : 'suspended'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="action-btn view-btn" onClick={() => handleViewStudent(s)}>
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Detailed Modal */}
            {selectedStudent && (
                <div className="modal-overlay" onClick={closeDetailModal}>
                    <div className="modal-content student-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedStudent.fullName}</h3>
                            <button className="close-btn" onClick={closeDetailModal}>&times;</button>
                        </div>

                        {loadingDetails ? <p>Loading Profile...</p> : studentDetails && (
                            <div className="student-profile-grid">
                                <div className="profile-section">
                                    <h4><FaUserGraduate /> Personal Info</h4>
                                    <div className="info-grid">
                                        <div className="info-item"><label>Email</label><span>{selectedStudent.email}</span></div>
                                        <div className="info-item"><label>Course</label><span>{selectedStudent.course || 'N/A'}</span></div>
                                        <div className="info-item"><label>Year</label><span>{selectedStudent.year || 'N/A'}</span></div>
                                        <div className="info-item"><label>Status</label><span className={`status-text ${selectedStudent.status}`}>{selectedStudent.status}</span></div>
                                    </div>
                                </div>

                                <div className="profile-section">
                                    <h4><FaBrain /> Onboarding Insights</h4>
                                    <div className="info-grid">
                                        <div className="info-item"><label>Learning Mode</label><span>{studentDetails.student.learningMode || 'Not specified'}</span></div>
                                        <div className="info-item"><label>Focus Area</label><span>{studentDetails.student.focus || 'Not specified'}</span></div>
                                        <div className="info-item"><label>Exp Level</label><span>{studentDetails.student.experienceLevel || 0}/100</span></div>
                                        <div className="info-item"><label>Weekly Hours</label><span>{studentDetails.student.weeklyHours || 0} hrs</span></div>
                                        <div className="info-item"><label>Archetype</label><span>{studentDetails.student.archetype || 'N/A'}</span></div>
                                        <div className="info-item"><label>Domain</label><span>{studentDetails.student.domain || 'N/A'}</span></div>
                                    </div>
                                </div>

                                <div className="profile-section">
                                    <h4><FaChartLine /> Performance</h4>
                                    <div className="stats-row">
                                        <div className="stat-box">
                                            <span className="stat-val">{studentDetails.performance.attendance}%</span>
                                            <span className="stat-lbl">Attendance</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="stat-val">{studentDetails.performance.assignments}</span>
                                            <span className="stat-lbl">Assignments</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-section">
                                    <h4><FaBookOpen /> AI Recommendations</h4>
                                    <ul className="recs-list">
                                        <li>🚀 Recommended: Advanced Data Structures based on skill level.</li>
                                        <li>💡 Tip: Increase weekly study hours to meet goals.</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeDetailModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStudentView;
