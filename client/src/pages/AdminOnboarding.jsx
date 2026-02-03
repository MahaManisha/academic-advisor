import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { FaToggleOn, FaPlus, FaTrash } from 'react-icons/fa';
import './AdminSettings.css'; // Reusing styles

const AdminOnboarding = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [systemConfig, setSystemConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const axi = (await import('../api/axios')).default;
            const res = await axi.get('/config/onboarding');
            if (res.data.success) setSystemConfig(res.data.data);
        } catch (e) {
            console.error("Config fetch error", e);
        } finally {
            setLoading(false);
        }
    };

    const handleConfigToggle = async (key) => {
        if (!systemConfig) return;
        const newConfig = { ...systemConfig, [key]: !systemConfig[key] };
        updateConfig(newConfig);
    };

    const updateConfig = async (newConfig) => {
        try {
            // Optimistic Update
            setSystemConfig(newConfig);
            const axi = (await import('../api/axios')).default;
            await axi.put('/config/onboarding', newConfig);
        } catch (e) {
            console.error("Config update error", e);
            fetchConfig(); // Revert
        }
    };

    // Helper for List toggling/Simple management (Enhancement)
    const toggleConfigListItem = (listKey, itemId) => {
        if (!systemConfig) return;
        // This assumes we have an 'active' flag or we remove it. 
        // For now, let's just assume we want to remove/add. 
        // Simple implementation: Just logging as "Coming Soon" or basic toggle if structure supported it
        alert("Granular item editing requires deeper structure changes. Implemented Global Toggles first.");
    };

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={logout} title="Onboarding Configuration" subtitle="Manage student entry and preferences" showSearch={false} />

            <main className="dashboard-main">
                <div className="main-content">
                    <div className="settings-card">
                        <h4>Global Configuration</h4>
                        {loading ? <p>Loading...</p> : systemConfig ? (
                            <>
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <p className="setting-label">Show Experience Slider ({systemConfig.showExperienceSlider ? 'On' : 'Off'})</p>
                                        <p className="setting-desc">Allow students to self-rate experience level</p>
                                    </div>
                                    <FaToggleOn
                                        className={`toggle-icon ${systemConfig.showExperienceSlider ? 'on' : ''}`}
                                        onClick={() => handleConfigToggle('showExperienceSlider')}
                                    />
                                </div>

                                <div className="setting-division">
                                    <h4>Focus Areas</h4>
                                    <div className="info-grid control-grid">
                                        {systemConfig.focusAreas?.map(area => (
                                            <div key={area.id} className="control-card">
                                                <h5>{area.title}</h5>
                                                <p>{area.desc}</p>
                                                {/* Placeholder for individual toggle */}
                                                <span className="status-badge active">Active</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : <p>Failed to load configuration.</p>}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminOnboarding;
