import React, { useState } from 'react';
import Header from '../components/Header';
import { getInterviewRounds, getInterviewQuestions } from '../api/interview.api';
import { 
    FaBuilding, FaBriefcase, FaLayerGroup, FaSpinner, 
    FaMicrophone, FaCode, FaCogs, FaBrain, FaUsers, FaChevronDown, FaChevronUp,
    FaArrowLeft, FaPlayCircle
} from 'react-icons/fa';
import './InterviewBot.css';

const InterviewBot = () => {
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    
    // UI State
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [step, setStep] = useState('config'); // 'config', 'rounds', 'questions'
    const [error, setError] = useState('');
    
    // Data State
    const [rounds, setRounds] = useState([]);
    const [selectedRound, setSelectedRound] = useState('');
    const [questions, setQuestions] = useState([]);
    const [expandedIndex, setExpandedIndex] = useState(null);

    const handleFetchRounds = async (e) => {
        e.preventDefault();
        if (!company || !role) {
            setError('Please provide both company and role.');
            return;
        }

        setLoading(true);
        setLoadingMessage(`Analyzing interview structure for ${company}...`);
        setError('');
        setRounds([]);

        try {
            const res = await getInterviewRounds(company, role);
            if (res.data && res.data.rounds) {
                setRounds(res.data.rounds);
                setStep('rounds');
            } else {
                setError('Failed to load rounds. Invalid response format.');
            }
        } catch (err) {
            setError('Error generating rounds. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRound = async (roundName) => {
        setSelectedRound(roundName);
        setLoading(true);
        setLoadingMessage(`Extracting previous year questions for ${roundName}...`);
        setError('');
        setQuestions([]);

        try {
            const res = await getInterviewQuestions(company, role, difficulty, roundName);
            if (res.data && res.data.questions) {
                setQuestions(res.data.questions);
                setStep('questions');
                setExpandedIndex(null);
            } else {
                setError('Failed to load questions. Invalid response format.');
                setStep('rounds'); // Fallback to rounds
            }
        } catch (err) {
            setError('Error generating questions. Please try again.');
            setStep('rounds'); // Fallback to rounds
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category) => {
        if (!category) return <FaMicrophone />;
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
                    <p>Generate authentic, previous-year technical interview questions tailored by company, role, and round.</p>
                </div>

                <div className="interview-grid">
                    {/* LEFT PANEL - Configuration */}
                    <div className="generator-panel glass-panel">
                        <h2>Configure Interview</h2>
                        <form onSubmit={handleFetchRounds} className="generator-form">
                            <div className="form-group">
                                <label><FaBuilding /> Target Company</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Google, Amazon, OpenAI..." 
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="cyber-input"
                                    disabled={loading || step !== 'config'}
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
                                    disabled={loading || step !== 'config'}
                                />
                            </div>

                            <div className="form-group">
                                <label><FaLayerGroup /> Difficulty Level</label>
                                <select 
                                    value={difficulty} 
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="cyber-select"
                                    disabled={loading || step !== 'config'}
                                >
                                    <option value="easy">Easy (Intern/Fresher)</option>
                                    <option value="medium">Medium (Junior/Mid)</option>
                                    <option value="hard">Hard (Senior/Staff)</option>
                                </select>
                            </div>

                            {step === 'config' ? (
                                <button type="submit" className="cyber-btn primary-btn" disabled={loading}>
                                    {loading ? (
                                        <><FaSpinner className="spin" /> Scanning Mainframe...</>
                                    ) : (
                                        <>Fetch Interview Rounds</>
                                    )}
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    className="cyber-btn action-btn outline"
                                    onClick={() => {
                                        setStep('config');
                                        setRounds([]);
                                        setQuestions([]);
                                    }}
                                    disabled={loading}
                                >
                                    <FaArrowLeft /> Reset Configuration
                                </button>
                            )}
                            
                            {error && <div className="error-message">{error}</div>}
                        </form>
                    </div>

                    {/* RIGHT PANEL - Results (Rounds OR Questions OR Loading) */}
                    <div className="results-panel">
                        
                        {/* Loading State */}
                        {loading && (
                            <div className="loading-state glass-panel">
                                <FaSpinner className="spin giant-spinner" />
                                <h3>{loadingMessage || "Processing..."}</h3>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && step === 'config' && (
                            <div className="empty-state glass-panel">
                                <FaMicrophone className="placeholder-icon" />
                                <h3>Awaiting Configuration</h3>
                                <p>Enter your target company and role to summon the interview protocol.</p>
                            </div>
                        )}

                        {/* Rounds State */}
                        {!loading && step === 'rounds' && rounds.length > 0 && (
                            <div className="rounds-container">
                                <h3><FaLayerGroup /> Select Interview Round</h3>
                                <p className="step-subtitle">We found {rounds.length} typical rounds for {role} at {company}. Choose one to generate questions.</p>
                                
                                <div className="rounds-list">
                                    {rounds.map((r, idx) => (
                                        <div key={idx} className="round-card glass-panel" onClick={() => handleSelectRound(r.name)}>
                                            <div className="round-icon">
                                                <FaPlayCircle />
                                            </div>
                                            <div className="round-info">
                                                <h4>{r.name}</h4>
                                                <p>{r.description}</p>
                                            </div>
                                            <div className="round-action">
                                                <span>Begin</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Questions State */}
                        {!loading && step === 'questions' && questions.length > 0 && (
                            <div className="questions-container">
                                <div className="questions-header-bar">
                                    <button 
                                        className="back-icon-btn" 
                                        onClick={() => setStep('rounds')}
                                        title="Back to Rounds"
                                    >
                                        <FaArrowLeft />
                                    </button>
                                    <h3>{selectedRound} Questions</h3>
                                </div>
                                <p className="step-subtitle">Questions sourced for {company} - {role}</p>

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
                                                <div className={`difficulty-badge ${q.difficulty ? q.difficulty.toLowerCase() : difficulty}`}>
                                                    {q.difficulty || difficulty}
                                                </div>
                                            </div>
                                            <div className="question-body">
                                                <p className="question-text">{q.question}</p>
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
