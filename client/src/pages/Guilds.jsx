import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { getGuilds, createGuild, joinGuild, contributeMission, getGuildDetails } from '../api/guild.api';
import { FaShieldAlt, FaPlus, FaUsers, FaTrophy, FaStar, FaBolt } from 'react-icons/fa';
import './Guilds.css';

const Guilds = () => {
    const { user } = useAuth();
    const { triggerAction } = useGamification();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [guilds, setGuilds] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGuildName, setNewGuildName] = useState('');
    const [newGuildDesc, setNewGuildDesc] = useState('');
    const [loading, setLoading] = useState(true);

    const [activeGuildId, setActiveGuildId] = useState(null);
    const [activeGuildDetails, setActiveGuildDetails] = useState(null);

    useEffect(() => {
        fetchGuilds();
    }, []);

    const fetchGuilds = async () => {
        setLoading(true);
        const res = await getGuilds();
        if (res.success) {
            setGuilds(res.guilds);
        }
        setLoading(false);
    };

    const handleCreateGuild = async (e) => {
        e.preventDefault();
        const res = await createGuild({ name: newGuildName, description: newGuildDesc });
        if (res.success) {
            setNewGuildName('');
            setNewGuildDesc('');
            setShowCreateModal(false);
            fetchGuilds();
            triggerAction('GUILD_CREATE', 200);
        } else {
            alert(res.message);
        }
    };

    const handleJoinGuild = async (id) => {
        const res = await joinGuild(id);
        if (res.success) {
            alert('Joined guild successfully!');
            fetchGuilds();
            triggerAction('GUILD_JOIN', 100);
            viewGuild(id);
        } else {
            alert(res.message);
        }
    };

    const viewGuild = async (id) => {
        const res = await getGuildDetails(id);
        if (res.success) {
            setActiveGuildId(id);
            setActiveGuildDetails(res.guild);
        }
    };

    const handleContribute = async () => {
        if (!activeGuildId) return;
        const res = await contributeMission(activeGuildId, 1); // Mock 1 progress point
        if (res.success) {
            setActiveGuildDetails(res.guild);
            triggerAction('WEEKLY_MISSION', 50);
            alert(`Contributed! Progress: ${res.guild.weeklyMission.progress}/${res.guild.weeklyMission.target}`);
            if (res.leveledUp) alert('Guild Leveled Up!');
            if (res.xpGranted) alert('Weekly Mission Complete! Guild gained massive XP');
        } else {
            alert(res.message);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
            <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} title="Co-op Factions & Guilds" subtitle="Team up, complete weekly missions, and rise through the ranks!" />

            <main className="dashboard-main centered-main-layout">
                <div className="centered-content-wrapper guilds-container">

                    {/* Header Actions */}
                    <div className="guilds-header-actions">
                        <h2>{activeGuildDetails ? `Viewing: ${activeGuildDetails.name}` : "All Active Guilds"}</h2>
                        <div>
                            {activeGuildDetails && (
                                <button className="btn-secondary" onClick={() => setActiveGuildId(null)}>Back to Directory</button>
                            )}
                            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                                <FaPlus /> Form New Guild
                            </button>
                        </div>
                    </div>

                    {/* Content View */}
                    {!activeGuildId ? (
                        <div className="guilds-grid">
                            {loading ? (
                                <p>Loading factions...</p>
                            ) : guilds.length > 0 ? (
                                guilds.map((g) => (
                                    <div key={g._id} className="guild-card">
                                        <div className="guild-card-header">
                                            <FaShieldAlt className="guild-icon" />
                                            <h3>{g.name}</h3>
                                        </div>
                                        <p className="guild-desc">{g.description}</p>
                                        <div className="guild-meta">
                                            <span><FaStar /> Lvl {g.level}</span>
                                            <span><FaUsers /> Leader: {g.leader?.fullName || 'Unknown'}</span>
                                        </div>
                                        <button className="btn-view-guild" onClick={() => viewGuild(g._id)}>View Guild</button>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">No guilds exist yet. Be the first to start a faction!</div>
                            )}
                        </div>
                    ) : activeGuildDetails && (
                        <div className="active-guild-dashboard">
                            <div className="guild-banner">
                                <div className="guild-banner-content">
                                    <h1>{activeGuildDetails.name}</h1>
                                    <p>"{activeGuildDetails.description}"</p>
                                    <div className="guild-badges">
                                        <span className="badge"><FaStar /> Lvl {activeGuildDetails.level}</span>
                                        <span className="badge"><FaBolt /> {activeGuildDetails.xp} XP</span>
                                    </div>
                                </div>
                            </div>

                            <div className="guild-panels">
                                <div className="guild-panel mission-panel">
                                    <h3>Weekly Co-op Mission</h3>
                                    <div className="mission-details">
                                        <h4>{activeGuildDetails.weeklyMission.title}</h4>
                                        <p className="mission-reward"><FaTrophy /> Reward: {activeGuildDetails.weeklyMission.rewardXP} Guild XP</p>
                                        <div className="mission-progress-bar">
                                            <div className="progress-fill" style={{ width: `${Math.min(100, (activeGuildDetails.weeklyMission.progress / activeGuildDetails.weeklyMission.target) * 100)}%` }}></div>
                                        </div>
                                        <p className="progress-text">{activeGuildDetails.weeklyMission.progress} / {activeGuildDetails.weeklyMission.target} Completed</p>

                                        {activeGuildDetails.members.some(m => m.user?._id === user._id) ? (
                                            <button className="btn-contribute" onClick={handleContribute}>Contribute to Mission</button>
                                        ) : (
                                            <button className="btn-join" onClick={() => handleJoinGuild(activeGuildDetails._id)}>Join Guild to Contribute</button>
                                        )}
                                    </div>
                                </div>

                                <div className="guild-panel roster-panel">
                                    <h3>Roster ({activeGuildDetails.members.length})</h3>
                                    <ul className="member-list">
                                        {activeGuildDetails.members.map((m) => (
                                            <li key={m._id} className="member-item">
                                                <div className="member-avatar">
                                                    {m.user?.fullName ? m.user.fullName[0].toUpperCase() : '?'}
                                                </div>
                                                <div className="member-name">
                                                    {m.user?.fullName || 'Unknown'}
                                                    {m.role === 'leader' && <FaStar className="leader-star" title="Guild Leader" />}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Create Guild Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content guild-form-modal" onClick={e => e.stopPropagation()}>
                        <h2>Form a Study Faction</h2>
                        <form onSubmit={handleCreateGuild}>
                            <div className="form-group">
                                <label>Guild Name</label>
                                <input type="text" placeholder="e.g. Neon Hackers" value={newGuildName} onChange={e => setNewGuildName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Motto / Description</label>
                                <textarea placeholder="What does your faction stand for?" value={newGuildDesc} onChange={e => setNewGuildDesc(e.target.value)} required></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Found Guild</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Guilds;
