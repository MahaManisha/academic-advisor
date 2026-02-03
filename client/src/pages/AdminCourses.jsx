import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getAllCourses, createCourse, updateCourse, deleteCourse } from '../api/course.api';
import { FaPlus, FaEdit, FaTrash, FaBook } from 'react-icons/fa';
import './AdminSettings.css'; // Reusing styles

const AdminCourses = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Course State
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        name: '', code: '', description: '', credits: 3, category: '', difficulty: 'Intermediate'
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await getAllCourses();
            if (res.success) setCourses(res.data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCourse = async (e) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await updateCourse(editingCourse._id, formData);
            } else {
                await createCourse(formData);
            }
            setShowModal(false);
            setEditingCourse(null);
            setFormData({ name: '', code: '', description: '', credits: 3, category: '', difficulty: 'Intermediate' });
            fetchCourses();
        } catch (error) {
            alert(error.message || "Failed to save course");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This action cannot be undone.")) {
            try {
                await deleteCourse(id);
                fetchCourses();
            } catch (error) {
                alert("Failed to delete course");
            }
        }
    };

    const openModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({ ...course });
        } else {
            setEditingCourse(null);
            setFormData({ name: '', code: '', description: '', credits: 3, category: '', difficulty: 'Intermediate' });
        }
        setShowModal(true);
    };

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={logout} title="Course Management" subtitle="Create and manage academic paths" showSearch={false} />

            <main className="dashboard-main">
                <div className="main-content">
                    <div className="section-header">
                        <h3>All Courses</h3>
                        <button className="btn-primary" onClick={() => openModal()}>
                            <FaPlus /> Add New Course
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Credits</th>
                                    <th>Difficulty</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map(c => (
                                    <tr key={c._id}>
                                        <td><span className="course-code-badge">{c.code}</span></td>
                                        <td className="font-medium">{c.name}</td>
                                        <td>{c.category}</td>
                                        <td>{c.credits}</td>
                                        <td>
                                            <span className={`difficulty-badge ${c.difficulty.toLowerCase()}`}>
                                                {c.difficulty}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon edit" onClick={() => openModal(c)}><FaEdit /></button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(c._id)}><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {courses.length === 0 && !loading && (
                                    <tr><td colSpan="6" className="text-center p-8 text-gray-500">No courses found. Add one to get started.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingCourse ? 'Edit Course' : 'New Course'}</h3>
                        <form onSubmit={handleSaveCourse}>
                            <div className="form-group">
                                <label>Course Code</label>
                                <input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. CS101" />
                            </div>
                            <div className="form-group">
                                <label>Course Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Intro to Programming" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Credits</label>
                                    <input type="number" required value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Difficulty</label>
                                <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}>
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3"></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourses;
