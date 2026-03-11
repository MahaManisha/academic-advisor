// client/src/pages/Leaderboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { FaCrown, FaStar, FaMedal, FaTrophy, FaFire, FaAngleDoubleUp } from 'react-icons/fa';
import './Leaderboard.css';

const Leaderboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get('/gamification/leaderboard');
                if (response.data.success) {
                    setLeaderboard(response.data.leaderboard);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const topThree = leaderboard.slice(0, 3);
    const restList = leaderboard.slice(3);

    // Reorder Top 3 for Podium: [2nd, 1st, 3rd]
    const podiumUsers = [];
    if (topThree.length > 0) podiumUsers[1] = topThree[0]; // 1st Place (Center)
    if (topThree.length > 1) podiumUsers[0] = topThree[1]; // 2nd Place (Left)
    if (topThree.length > 2) podiumUsers[2] = topThree[2]; // 3rd Place (Right)

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

            <Header
                title="Topper Board"
                subtitle="Global XP & Achievement Rankings"
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                onLogout={handleLogout}
                showSearch={false}
            />

            <main className="dashboard-main centered-main-layout">
                <div className="centered-content-wrapper leaderboard-wrapper">

                    <div className="leaderboard-header-section animated-bg">
                        <div className="header-glitter"></div>
                        <h1 className="cyber-title glitch" data-text="HALL OF FAME">
                            <FaTrophy className="title-icon pulse" /> HALL OF FAME
                        </h1>
                        <p className="cyber-subtitle">Compete globally and rise through the ranks to claim the ultimate crown.</p>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            <div className="spinner"></div>
                            <h3 style={{ marginTop: '1rem' }}>Loading ranks...</h3>
                        </div>
                    ) : leaderboard.length > 0 ? (
                        <>
                            {/* Podium Section */}
                            <div className="podium-section">
                                {podiumUsers.map((entry, index) => {
                                    if (!entry) return null;
                                    const podiumClass = index === 1 ? 'gold-podium' : index === 0 ? 'silver-podium' : 'bronze-podium';
                                    const rankNum = index === 1 ? 1 : index === 0 ? 2 : 3;

                                    return (
                                        <div key={entry.id} className={`podium-item ${podiumClass} ${entry.id === (user?.id || user?._id) ? 'podium-current-user' : ''}`}>
                                            <div className="podium-avatar-wrapper">
                                                <div className={`podium-avatar`}>
                                                    {getInitials(entry.name)}
                                                </div>
                                                <div className="podium-rank-badge">
                                                    {rankNum === 1 ? <FaCrown /> : <FaAngleDoubleUp />}
                                                </div>
                                            </div>

                                            <div className="podium-info">
                                                <h3 className="podium-name">
                                                    {entry.name} {entry.id === (user?.id || user?._id) && <span className="you-badge">YOU</span>}
                                                </h3>
                                                <p className="podium-xp"><FaStar className="xp-star" /> {entry.xp} XP</p>
                                                <p className="podium-role">{entry.role || 'Student'} • Lvl {entry.level || 1}</p>
                                            </div>

                                            <div className="podium-step">
                                                <div className="podium-number">{rankNum}</div>
                                                <div className="podium-glow"></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* List Section */}
                            <div className="leaderboard-list">
                                {restList.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className={`leaderboard-card ${entry.id === (user?.id || user?._id) ? 'current-user-card' : ''} glass-card-hover`}
                                    >
                                        <div className="card-rank">
                                            <div className="rank-badge regular">#{entry.rank}</div>
                                        </div>

                                        <div className="card-user-info">
                                            <div className="user-avatar-small">
                                                {getInitials(entry.name)}
                                            </div>
                                            <div className="user-details">
                                                <h3 className="user-name">
                                                    {entry.name} {entry.id === (user?.id || user?._id) && <span className="you-badge">YOU</span>}
                                                </h3>
                                                <p className="user-role">{entry.role || 'Student'} • Level {entry.level || 1}</p>
                                            </div>
                                        </div>

                                        <div className="card-stats">
                                            <div className="stat-pill xp-pill neon-border">
                                                <FaStar className="stat-icon" />
                                                <span>{entry.xp || 0} XP</span>
                                            </div>

                                            <div className="stat-pill streak-pill">
                                                <FaFire className="stat-icon" />
                                                <span>{entry.streak || 0}</span>
                                            </div>

                                            <div className="stat-pill badges-pill">
                                                <FaMedal className="stat-icon" />
                                                <span>{entry.badges?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>

                    ) : (
                        <div className="empty-state glass-card">
                            <FaTrophy className="empty-icon giant-icon pulse" />
                            <h3>No rankings found</h3>
                            <p>The leaderboard is currently pristine. Be the first to claim a spot!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Leaderboard;
