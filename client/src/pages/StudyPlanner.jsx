// client/src/pages/StudyPlanner.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaFilter
} from 'react-icons/fa';
import './StudyPlanner.css';

const StudyPlanner = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddTask, setShowAddTask] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock data - Replace with actual API calls
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Complete Data Structures Assignment',
      subject: 'Programming',
      priority: 'high',
      dueDate: '2025-01-30',
      duration: 120,
      status: 'pending'
    },
    {
      id: 2,
      title: 'Study Database Normalization',
      subject: 'Database',
      priority: 'medium',
      dueDate: '2025-01-29',
      duration: 60,
      status: 'pending'
    },
    {
      id: 3,
      title: 'Practice Sorting Algorithms',
      subject: 'Programming',
      priority: 'low',
      dueDate: '2025-01-28',
      duration: 45,
      status: 'completed'
    }
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    priority: 'medium',
    dueDate: '',
    duration: 60
  });

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

  const handleToggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
        : task
    ));
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
    pending: tasks.filter(t => t.status === 'pending').length,
    totalHours: tasks.reduce((acc, t) => acc + t.duration, 0) / 60
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

      <main className="dashboard-main">
        <div className="main-content">
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
          <div className="planner-actions">
            <button
              className="btn-add-task"
              onClick={() => setShowAddTask(!showAddTask)}
            >
              <FaPlus /> Add New Task
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
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <FaCalendarAlt className="empty-icon" />
                <h3>No tasks found</h3>
                <p>Add your first study task to get started!</p>
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
                        <FaCalendarAlt /> {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="task-priority">
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
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