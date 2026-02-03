import { useState, useEffect } from 'react';
import { FaUser, FaSearch, FaUserShield, FaUserGraduate, FaSync, FaBan, FaCheckCircle } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, updateUserStatus } from '../api/user.api';
import './AdminUsers.css';

const AdminUsers = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers(page, 10);
            setUsers(data.users);
            setTotalPages(data.pagination.pages);
            setError(null);
        } catch (err) {
            setError('Failed to load users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const handleStatusUpdate = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        const action = newStatus === 'active' ? 'Unblock' : 'Block';

        if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        try {
            await updateUserStatus(userId, newStatus);
            // Optimistic update
            setUsers(users.map(u =>
                u._id === userId ? { ...u, status: newStatus } : u
            ));
        } catch (err) {
            console.error(err);
            alert(`Failed to ${action} user`);
        }
    };

    const filteredUsers = users.filter(u =>
        (u.fullName && u.fullName.toLowerCase().includes(searchTerm)) ||
        (u.email && u.email.toLowerCase().includes(searchTerm))
    );

    return (
        <div className="dashboard-container">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
            />

            <Header
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                onLogout={logout}
                title="User Management"
                subtitle="View and manage registered users"
                showSearch={false}
            />

            <main className="dashboard-main">
                <div className="main-content">
                    <div className="users-controls">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <button className="refresh-btn" onClick={fetchUsers} disabled={loading}>
                            <FaSync className={loading ? 'spin' : ''} /> Refresh
                        </button>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">Loading users...</td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">No users found.</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <tr key={u._id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar-small">
                                                        {(u.fullName || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="user-details">
                                                        <span className="user-name">{u.fullName || 'Unknown User'}</span>
                                                        <span className="user-email">{u.email || 'No Email'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`role-badge ${u.role || 'student'}`}>
                                                    {u.role === 'admin' ? <FaUserShield /> : <FaUserGraduate />}
                                                    {(u.role || 'Student').charAt(0).toUpperCase() + (u.role || 'student').slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${u.status}`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {u.role !== 'admin' && (
                                                        <button
                                                            className={`action-btn ${u.status === 'active' ? 'block-btn' : 'unblock-btn'}`}
                                                            onClick={() => handleStatusUpdate(u._id, u.status)}
                                                            title={u.status === 'active' ? 'Block User' : 'Unblock User'}
                                                        >
                                                            {u.status === 'active' ? <FaBan /> : <FaCheckCircle />}
                                                            {u.status === 'active' ? ' Block' : ' Unblock'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Previous
                            </button>
                            <span>Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminUsers;
