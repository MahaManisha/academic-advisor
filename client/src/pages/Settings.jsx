// client/src/pages/Settings.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FaUser,
  FaBell,
  FaLock,
  FaPalette,
  FaGlobe,
  FaShieldAlt,
  FaSave
} from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [saved, setSaved] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [settings, setSettings] = useState({
    // Account settings
    language: 'english',
    timezone: 'UTC+5:30',
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    assessmentReminders: true,
    studyPlanReminders: true,
    peerMessages: true,
    
    // Privacy settings
    profileVisibility: 'public',
    showProgress: true,
    allowPeerChat: true,
    
    // Appearance settings
    theme: 'light',
    fontSize: 'medium',
    
    // Security settings
    twoFactorAuth: false,
    loginAlerts: true
  });

  const handleSaveSettings = () => {
    // TODO: Implement API call to save settings
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
      
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        title="Settings"
        subtitle="Manage your preferences"
        showSearch={false}
      />

      <main className="dashboard-main">
        <div className="main-content">
          <div className="settings-container">
            {/* Settings Navigation */}
            <div className="settings-nav">
              <button
                className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <FaUser /> Account
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <FaBell /> Notifications
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacy')}
              >
                <FaShieldAlt /> Privacy
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                <FaPalette /> Appearance
              </button>
              <button
                className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <FaLock /> Security
              </button>
            </div>

            {/* Settings Content */}
            <div className="settings-content">
              {activeTab === 'account' && (
                <div className="settings-section">
                  <h2 className="settings-title">Account Settings</h2>
                  
                  <div className="setting-group">
                    <label className="setting-label">Language</label>
                    <select
                      className="setting-select"
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
                    </select>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">Time Zone</label>
                    <select
                      className="setting-select"
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    >
                      <option value="UTC+5:30">IST (UTC+5:30)</option>
                      <option value="UTC+0">GMT (UTC+0)</option>
                      <option value="UTC-5">EST (UTC-5)</option>
                      <option value="UTC-8">PST (UTC-8)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="settings-section">
                  <h2 className="settings-title">Notification Preferences</h2>
                  
                  <div className="setting-toggle">
                    <div className="toggle-info">
                      <div className="toggle-label">Email Notifications</div>
                      <div className="toggle-description">Receive notifications via email</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-toggle">
                    <div className="toggle-info">
                      <div className="toggle-label">Push Notifications</div>
                      <div className="toggle-description">Receive push notifications on your device</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-toggle">
                    <div className="toggle-info">
                      <div className="toggle-label">Assessment Reminders</div>
                      <div className="toggle-description">Get reminders for upcoming assessments</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.assessmentReminders}
                        onChange={(e) => handleSettingChange('assessmentReminders', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-toggle">
                    <div className="toggle-info">
                      <div className="toggle-label">Study Plan Reminders</div>
                      <div className="toggle-description">Get reminders for study tasks</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.studyPlanReminders}
                        onChange={(e) => handleSettingChange('studyPlanReminders', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-toggle">
                    <div className="toggle-info">
                      <div className="toggle-label">Peer Messages</div>
                      <div className="toggle-description">Notifications for new peer messages</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.peerMessages}
                        onChange={(e) => handleSettingChange('peerMessages', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="settings-section">
                  <h2 className="settings-title">Privacy Settings</h2>
                  
                  <div className="setting-group">
                    <label className="setting-label">Profile Visibility</label>
                    <select
                      className="setting-select"
                      value={settings.profileVisibility}
                      onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                    >
                      <option value="public">Public</option>
                      <option value="peers">Peers Only</option>
                      <option value="private">Private</option>
                    </select>
                    <p className="setting-description">
                      Control who can view your profile and academic progress
                    </p>
                  </div>

                  <div className="setting-toggle">
                    <div className="toggle-info">
                      <div className="toggle-label">Show Progress</div>
                      <div className="toggle-description">Display your progress to other students</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.showProgress}
                        onChange={(e) => handleSettingChange('showProgress', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-toggle">
                    <div className="toggle-info">
                      <div className="toggle-label">Allow Peer Chat</div>
                      <div className="toggle-description">Let other students contact you</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.allowPeerChat}
                        onChange={(e) => handleSettingChange('allowPeerChat', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="settings-section">
                  <h2 className="settings-title">Appearance</h2>
                  
                  <div className="setting-group">
                    <label className="setting-label">Theme</label>
                    <div className="theme-options">
                      <button
                        className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}
                        onClick={() => handleSettingChange('theme', 'light')}
                      >
                        Light
                      </button>
                      <button
                        className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                        onClick={() => handleSettingChange('theme', 'dark')}
                      >
                        Dark
                      </button>
                      <button
                        className={`theme-btn ${settings.theme === 'auto' ? 'active' : ''}`}
                        onClick={() => handleSettingChange('theme', 'auto')}
                      >
                        Auto
                      </button>
                    </div>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">Font Size</label>
                    <select
                      className="setting-select"
                      value={settings.fontSize}
                      onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="settings-section">
                  <h2 className="settings-title">Security Settings</h2>
                  
                  <div className="setting-toggle">
                    <div className="toggle-info">
                      <div className="toggle-label">Two-Factor Authentication</div>
                      <div className="toggle-description">Add an extra layer of security</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-toggle">
                    <div className="toggle-info">
                      <div className="toggle-label">Login Alerts</div>
                      <div className="toggle-description">Get notified of new login attempts</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.loginAlerts}
                        onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <button className="btn-danger">
                      Change Password
                    </button>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="settings-footer">
                <button className="btn-save-settings" onClick={handleSaveSettings}>
                  <FaSave /> Save Changes
                </button>
                {saved && <span className="save-success">✓ Settings saved successfully!</span>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;