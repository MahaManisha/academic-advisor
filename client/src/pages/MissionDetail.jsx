import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getCourseById } from '../api/course.api';
import { FaPlay, FaCheckCircle, FaStar, FaArrowLeft, FaGraduationCap } from 'react-icons/fa';
import './MissionDetail.css';

const MissionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sequenceRunning, setSequenceRunning] = useState(false);
    const [sequenceComplete, setSequenceComplete] = useState(false);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                const res = await getCourseById(id);
                if (res.success) {
                    setCourse(res.data);
                }
            } catch (err) {
                console.error("Failed to load mission data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [id]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleInitiate = () => {
        setSequenceRunning(true);
        // Simulate interactive quest sequence progressing
        setTimeout(() => {
            setSequenceRunning(false);
            setSequenceComplete(true);
        }, 3000);
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} title="Loading Mission..." subtitle="Retrieving academic target..." />
                <main className="dashboard-main flex-1 flex justify-center items-center">
                    <div className="loader-ring"></div>
                </main>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="dashboard-container">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} title="Mission Lost" subtitle="Signal dropped." />
                <main className="dashboard-main flex-1 flex justify-center items-center">
                    <h2>Error: Mission data could not be retrieved.</h2>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
            <Header
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                onLogout={handleLogout}
                title={`Mission: ${course.code}`}
                subtitle="Active Operation Parameters"
            />

            <main className="dashboard-main mission-detail-main">
                <button className="back-button" onClick={() => navigate('/courses')}>
                    <FaArrowLeft /> Retract to Quests
                </button>

                <div className="mission-content-box">
                    <div className="mission-header-bar">
                        <h3>{course.name}</h3>
                        <span className={`difficulty-badge ${course.difficulty?.toLowerCase()}`}>Lvl: {course.difficulty}</span>
                    </div>

                    <div className="mission-description">
                        <FaGraduationCap className="mission-icon" />
                        <p>{course.description}</p>
                    </div>

                    <div className="mission-intel">
                        <div className="intel-block">
                            <span className="intel-label">Department</span>
                            <span className="intel-value">{course.category}</span>
                        </div>
                        <div className="intel-block">
                            <span className="intel-label">Credits</span>
                            <span className="intel-value">{course.credits}</span>
                        </div>
                        <div className="intel-block">
                            <span className="intel-label">Status</span>
                            <span className="intel-value">{sequenceComplete ? 'CLEARED' : course.status.toUpperCase()}</span>
                        </div>
                    </div>

                    <div className="mission-action-center">
                        {sequenceComplete ? (
                            <div className="mission-cleared-banner">
                                <FaCheckCircle className="cleared-icon" />
                                <h4>MISSION CLEARED</h4>
                                <p>+ {course.credits * 10} XP Rewarded</p>
                                <button className="return-btn" onClick={() => navigate('/courses')}>Acknowledge</button>
                            </div>
                        ) : (
                            <button
                                className={`btn-initiate-hq ${sequenceRunning ? 'running' : ''}`}
                                onClick={handleInitiate}
                                disabled={sequenceRunning}
                            >
                                {sequenceRunning ? (
                                    <>
                                        <div className="mini-spinner" /> UPLOADING DATA TO NEURAL LINK...
                                    </>
                                ) : (
                                    <>
                                        <FaPlay /> INITIATE FULL SEQUENCE
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MissionDetail;
