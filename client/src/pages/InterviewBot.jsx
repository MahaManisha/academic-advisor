import React, { useState } from 'react';
import Header from '../components/Header';
import { getInterviewQuestions } from '../api/interview.api';
import { 
    FaBuilding, FaBriefcase, FaLayerGroup, FaSpinner, 
    FaMicrophone, FaCode, FaCogs, FaBrain, FaUsers, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import './InterviewBot.css';

const InterviewBot = () => {
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');
    const [expandedIndex, setExpandedIndex] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!company || !role) {
            setError('Please provide both company and role.');
            return;
        }

        setLoading(true);
        setError('');
        setQuestions([]);

        try {
            const res = await getInterviewQuestions(company, role, difficulty);
            if (res.data && res.data.questions) {
                setQuestions(res.data.questions);
            } else {
                setError('Failed to load questions. Invalid response format.');
            }
        } catch (err) {
            setError('Error generating questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category) => {
        const lowerCat = category.toLowerCase();
        if (lowerCat.includes('tech') || lowerCat.includes('code')) return <FaCode />;
        if (lowerCat.includes('design') || lowerCat.includes('arch')) return <FaCogs />;
        if (lowerCat.includes('core')) return <FaBrain />;
        if (lowerCat.includes('behav') || lowerCat.includes('hr')) return <FaUsers />;
        return <FaMicrophone />;
    };

    const toggleExpand = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="dashboard-layout">
            <Header title="AI Interview Simulator" />
            <main className="dashboard-main interview-bot-main">
                <div className="interview-hero">
                    <div className="hero-glow"></div>
                    <h1><FaMicrophone className="hero-icon" /> AI Interview Prep</h1>
                    <p>Generate authentic, previous-year technical interview questions for any company & role.</p>
                </div>

                <div className="interview-grid">
                    <div className="generator-panel glass-panel">
                        <h2>Configure Interview</h2>
                        <form onSubmit={handleSubmit} className="generator-form">
                            <div className="form-group">
                                <label><FaBuilding /> Target Company</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Google, Amazon, OpenAI..." 
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="cyber-input"
                                />
                            </div>

                            <div className="form-group">
                                <label><FaBriefcase /> Target Role</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Frontend Developer, Data Scientist..." 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="cyber-input"
                                />
                            </div>

                            <div className="form-group">
                                <label><FaLayerGroup /> Difficulty Level</label>
                                <select 
                                    value={difficulty} 
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="cyber-select"
                                >
                                    <option value="easy">Easy (Intern/Fresher)</option>
                                    <option value="medium">Medium (Junior/Mid)</option>
                                    <option value="hard">Hard (Senior/Staff)</option>
                                </select>
                            </div>

                            <button type="submit" className="cyber-btn primary-btn" disabled={loading}>
                                {loading ? (
                                    <><FaSpinner className="spin" /> Generating Protocol...</>
                                ) : (
                                    <>Initialize Simulation</>
                                )}
                            </button>
                            
                            {error && <div className="error-message">{error}</div>}
                        </form>
                    </div>

                    <div className="results-panel">
                        {loading && (
                            <div className="loading-state glass-panel">
                                <FaSpinner className="spin giant-spinner" />
                                <h3>Accessing Mainframe...</h3>
                                <p>Extracting previous year data for {company} {role} roles.</p>
                            </div>
                        )}

                        {!loading && questions.length === 0 && !error && (
                            <div className="empty-state glass-panel">
                                <FaMicrophone className="placeholder-icon" />
                                <h3>Awaiting Configuration</h3>
                                <p>Enter your target company and role to summon the interview protocol.</p>
                            </div>
                        )}

                        {!loading && questions.length > 0 && (
                            <div className="questions-container">
                                <h3><FaLayerGroup /> Detected Questions Array: {questions.length}</h3>
                                <div className="questions-list">
                                    {questions.map((q, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`question-card glass-panel ${expandedIndex === idx ? 'expanded' : ''}`}
                                            onClick={() => toggleExpand(idx)}
                                        >
                                            <div className="question-header">
                                                <div className="category-badge">
                                                    {getCategoryIcon(q.category)} {q.category}
                                                </div>
                                                <div className={`difficulty-badge ${q.difficulty.toLowerCase()}`}>
                                                    {q.difficulty}
                                                </div>
                                            </div>
                                            <div className="question-body">
                                                <p className="question-text">{q.question}</p>
                                                {/* In the future, add a record audio / text input area here for mock answers */}
                                                <div className="question-action">
                                                    {expandedIndex === idx ? <FaChevronUp /> : <FaChevronDown />}
                                                    <span>Mock Answer</span>
                                                </div>
                                            </div>
                                            {expandedIndex === idx && (
                                                <div className="mock-answer-section">
                                                    <textarea 
                                                        className="cyber-textarea" 
                                                        placeholder="Type your mock answer here or use the voice protocol..."
                                                        onClick={(e) => e.stopPropagation()}
                                                    ></textarea>
                                                    <button 
                                                        className="cyber-btn action-btn outline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Save Answer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InterviewBot;
