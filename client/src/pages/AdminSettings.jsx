import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { FaToggleOn } from 'react-icons/fa';
import './AdminSettings.css';

const AdminSettings = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={logout} title="Platform Settings" subtitle="Global system controls" showSearch={false} />

            <main className="dashboard-main">
                <div className="main-content">
                    <div className="settings-card">
                        <h4>System Features</h4>
                        <div className="setting-item">
                            <div className="setting-info">
                                <p className="setting-label">AI Advisor Engine</p>
                                <p className="setting-desc">Enable Gemini-powered recommendations system-wide</p>
                            </div>
                            <FaToggleOn className="toggle-icon on" />
                        </div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <p className="setting-label">Strict Access Mode</p>
                                <p className="setting-desc">Require admin approval for new student registrations</p>
                            </div>
                            <FaToggleOn className="toggle-icon" /> {/* Default Off */}
                        </div>
                        <div className="setting-item">
                            <div className="setting-info">
                                <p className="setting-label">Maintenance Mode</p>
                                <p className="setting-desc">Disable student access temporarily</p>
                            </div>
                            <FaToggleOn className="toggle-icon" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminSettings;
