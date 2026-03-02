// client/src/pages/StudyPlanner.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FaCalendarAlt,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaTrash,
  FaEdit,
  FaFilter,
  FaTasks
} from 'react-icons/fa';
import './StudyPlanner.css';

const StudyPlanner = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [filter, setFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [planId, setPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get('/planner/tasks');
        if (res.data.success) {
          setTasks(res.data.tasks || []);
          setPlanId(res.data.planId || null);
        }
      } catch (err) {
        console.error('Failed to fetch study tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    priority: 'medium',
    dueDate: '',
    duration: 60
  });

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const res = await axios.post('/planner/generate', { period: 'weekly' });
      if (res.data.success) {
        // Fetch tasks again to map backend structure to frontend structure properly
        const refetch = await axios.get('/planner/tasks');
        if (refetch.data.success) {
          setTasks(refetch.data.tasks || []);
          setPlanId(refetch.data.planId || null);
        }
      }
    } catch (err) {
      console.error('Failed to generate study plan:', err);
      alert('Could not generate plan. Please try again.');
    } finally {
      setGenerating(false);
      setShowAddTask(false);
    }
  };

  const handleAddTask = () => {
    if (newTask.title && newTask.subject && newTask.dueDate) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          ...newTask,
          status: 'pending'
        }
      ]);
      setNewTask({
        title: '',
        subject: '',
        priority: 'medium',
        dueDate: '',
        duration: 60
      });
      setShowAddTask(false);
    }
  };

  const handleToggleTask = async (id) => {
    // Find current task
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    // Optimistic UI update
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, status: newStatus } : t
    ));

    // Backend update if part of a real plan
    if (planId && typeof id === 'string') {
      try {
        await axios.patch(`/planner/${planId}/task/${id}`, { status: newStatus });
      } catch (err) {
        console.error("Failed to update task", err);
        // Revert UI on failure
        setTasks(tasks.map(t =>
          t.id === id ? { ...t, status: task.status } : t
        ));
      }
    }
  };

  const handleDeleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const stats = {
    totalTasks: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status !== 'completed').length,
    totalHours: tasks.reduce((acc, t) => acc + (t.duration || 0), 0) / 60
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
        title="Study Planner"
        subtitle="Organize your study schedule"
      />

      <main className="dashboard-main centered-main-layout">
        <div className="centered-content-wrapper">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: '#667eea' }}>
                  <FaCalendarAlt />
                </div>
              </div>
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value">{stats.totalTasks}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: '#10b981' }}>
                  <FaCheckCircle />
                </div>
              </div>
              <div className="stat-label">Completed</div>
              <div className="stat-value">{stats.completed}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: '#f59e0b' }}>
                  <FaClock />
                </div>
              </div>
              <div className="stat-label">Pending</div>
              <div className="stat-value">{stats.pending}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: '#ef4444' }}>
                  <FaClock />
                </div>
              </div>
              <div className="stat-label">Study Hours</div>
              <div className="stat-value">{stats.totalHours.toFixed(1)}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="planner-actions" style={{ display: 'flex', gap: '15px' }}>
            <button
              className="btn-add-task"
              onClick={handleGeneratePlan}
              disabled={generating}
              style={{
                background: 'var(--game-neon-pink)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 0 10px rgba(255, 0, 255, 0.4)'
              }}
            >
              <FaCheckCircle style={{ marginRight: '8px' }} />
              {generating ? 'Generating AI Plan...' : 'Auto-Generate AI Plan'}
            </button>
            <button
              className="btn-add-task"
              onClick={() => setShowAddTask(!showAddTask)}
            >
              <FaPlus /> Add Manual Task
            </button>

            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Add Task Form */}
          {showAddTask && (
            <div className="add-task-form">
              <h3>Add New Task</h3>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Task Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={newTask.subject}
                  onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                  className="form-input"
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="form-select"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={newTask.duration}
                  onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
                  className="form-input"
                />
              </div>
              <div className="form-actions">
                <button className="btn-save" onClick={handleAddTask}>
                  Save Task
                </button>
                <button className="btn-cancel" onClick={() => setShowAddTask(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Tasks List */}
          <div className="tasks-list">
            {loading ? (
              <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                <div className="spinner" style={{ margin: '0 auto', width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-neon)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h3 style={{ marginTop: '1rem' }}>Loading planner...</h3>
              </div>
            ) : filteredTasks.length === 0 && filter === 'all' ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <FaTasks className="empty-icon" style={{ fontSize: '4rem', color: 'var(--game-neon-blue)', marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(0, 255, 204, 0.5))' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'var(--game-font-display)', textTransform: 'uppercase' }}>No active study plan</h3>
                <p style={{ color: 'var(--game-text-muted)', marginBottom: '2rem' }}>Let our AI analyze your skills and automatically build a personalized weekly schedule.</p>
                <button
                  className="btn-primary"
                  onClick={handleGeneratePlan}
                  disabled={generating}
                  style={{
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: 'var(--game-neon-blue)',
                    color: '#000',
                    fontWeight: 'bold',
                    border: 'none',
                    boxShadow: '0 0 15px rgba(0, 255, 204, 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {generating ? 'ANALYZING PROFILE & GENERATING PLAN...' : 'GENERATE AI STUDY PLAN'}
                </button>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <FaCalendarAlt className="empty-icon" />
                <h3>No {filter} tasks</h3>
                <p>You don't have any tasks matching this filter.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className={`task-item ${task.status}`}>
                  <div className="task-checkbox">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleToggleTask(task.id)}
                    />
                  </div>

                  <div className="task-content">
                    <h4 className="task-title">{task.title}</h4>
                    <div className="task-meta">
                      <span className="task-subject">{task.subject}</span>
                      <span className="task-duration">
                        <FaClock /> {task.duration} min
                      </span>
                      <span className="task-due-date">
                        <FaCalendarAlt /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Flexible'}
                      </span>
                    </div>
                  </div>

                  <div className="task-priority">
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority || 'medium'}
                    </span>
                  </div>

                  <div className="task-actions">
                    <button className="btn-icon edit">
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudyPlanner;