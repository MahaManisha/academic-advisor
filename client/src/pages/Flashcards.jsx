import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { generateFlashcards, getMyFlashcardSets, getFlashcardSet } from '../api/flashcard.api';
import { FaLayerGroup, FaPlus, FaBrain, FaStar, FaBolt, FaArrowLeft, FaCheck } from 'react-icons/fa';
import './Flashcards.css';

const Flashcards = () => {
    const { user, logout } = useAuth();
    const { triggerAction } = useGamification();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // UI State View: 'directory', 'generator', 'training'
    const [view, setView] = useState('directory');
    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Gen State
    const [rawText, setRawText] = useState("");
    const [titleText, setTitleText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Active Train State
    const [activeSet, setActiveSet] = useState(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [xpGained, setXpGained] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        fetchSets();
    }, []);

    const fetchSets = async () => {
        setLoading(true);
        const res = await getMyFlashcardSets();
        if (res.success) {
            setSets(res.sets);
        }
        setLoading(false);
    };

    const handleGenerate = async () => {
        if (!rawText.trim()) return alert("Please enter some text or notes to build flashcards from.");

        setIsGenerating(true);
        const res = await generateFlashcards(rawText, titleText || "AI Study Module");
        if (res.success) {
            setRawText("");
            setTitleText("");
            setView('directory');
            fetchSets();
            triggerAction('STUDY_SESSION', 50); // Small reward for creating study material
        } else {
            alert(res.message);
        }
        setIsGenerating(false);
    };

    const startTraining = async (id) => {
        setLoading(true);
        const res = await getFlashcardSet(id);
        if (res.success && res.set.cards.length > 0) {
            setActiveSet(res.set);
            setCurrentCardIndex(0);
            setIsFlipped(false);
            setXpGained(0);
            setIsComplete(false);
            setView('training');
        } else if (res.success) {
            alert("This set has no cards!");
        } else {
            alert("Failed to load set.");
        }
        setLoading(false);
    };

    const handleRateCard = (difficulty) => {
        // Awards XP based on effort
        let points = 0;
        if (difficulty === 'hard') points = 15;
        if (difficulty === 'good') points = 10;
        if (difficulty === 'easy') points = 5;

        setXpGained(prev => prev + points);
        triggerAction('FLASHCARD_STUDY', points);

        if (currentCardIndex < activeSet.cards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentCardIndex(prev => prev + 1);
            }, 150);
        } else {
            setIsComplete(true);
        }
    };

    const closeTraining = () => {
        setActiveSet(null);
        setView('directory');
    };

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={logout} title="Neural Flashcards" subtitle="AI-Generated Study Decks & Minigames" />

            <main className="dashboard-main centered-main-layout">
                <div className="centered-content-wrapper flashcards-container">

                    {view === 'directory' && (
                        <>
                            <div className="flashcards-header-actions">
                                <h2>Your Study Archives</h2>
                                <button className="btn-primary" onClick={() => setView('generator')}>
                                    <FaPlus /> Extract New Material
                                </button>
                            </div>

                            {loading ? (
                                <div className="spinner"></div>
                            ) : sets.length === 0 ? (
                                <div className="empty-state glass-card">
                                    <FaLayerGroup className="empty-icon giant-icon pulse" />
                                    <h3>No data extracted yet.</h3>
                                    <p>Paste your textbook chapters, notes, or essays and let the AI generate a complete study module.</p>
                                </div>
                            ) : (
                                <div className="sets-grid">
                                    {sets.map(set => (
                                        <div key={set._id} className="set-card" onClick={() => startTraining(set._id)}>
                                            <h3>{set.title}</h3>
                                            <p style={{ color: "var(--game-text-muted)", fontSize: "0.85rem", margin: "0.5rem 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                {set.summary}
                                            </p>
                                            <div className="set-meta">
                                                <span>{new Date(set.createdAt).toLocaleDateString()}</span>
                                                <span className="card-count"><FaLayerGroup /> {set.cards?.length || 0} Cards</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {view === 'generator' && (
                        <div className="generator-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3><FaBrain /> AI Knowledge Extractor</h3>
                                <button className="btn-secondary" onClick={() => setView('directory')}>Cancel</button>
                            </div>
                            <p style={{ color: 'var(--game-text-muted)' }}>Paste raw text from a PDF, Article, or Video Transcript. The AI will summarize the core concepts and automatically build a 5-card deck for you to train on.</p>

                            <input
                                type="text"
                                className="cyber-input"
                                placeholder="Module Name (e.g., 'Chapter 4: Neural Networks')"
                                value={titleText}
                                onChange={(e) => setTitleText(e.target.value)}
                            />

                            <textarea
                                className="cyber-textarea"
                                placeholder="Paste source text here... (Limit 4,000 characters for optimal processing)"
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                            />

                            <button className="btn-primary" onClick={handleGenerate} disabled={isGenerating} style={{ width: '100%' }}>
                                {isGenerating ? 'PROCESSING KNOWLEDGE MATRIX...' : 'GENERATE STUDY MODULE'}
                            </button>
                        </div>
                    )}

                    {view === 'training' && activeSet && (
                        <div className="arcade-minigame">
                            <div className="arcade-header">
                                <button className="btn-secondary" onClick={closeTraining}><FaArrowLeft /> Exit Training</button>
                                <div className="arcade-score"><FaBolt style={{ color: '#ff00ff' }} /> {xpGained} XP Earned</div>
                            </div>

                            {activeSet.summary && (
                                <div className="summary-panel">
                                    <h4><FaStar /> Key Takeaways</h4>
                                    <p style={{ margin: 0, whiteSpace: 'pre-line', fontSize: '0.9rem' }}>{activeSet.summary}</p>
                                </div>
                            )}

                            {!isComplete ? (
                                <>
                                    <div style={{ color: 'var(--game-text-muted)', marginBottom: '1rem' }}>
                                        Card {currentCardIndex + 1} of {activeSet.cards.length}
                                    </div>

                                    <div className="flashcard-stage">
                                        <div className={`flashcard-3d ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                                            <div className="flashcard-face flashcard-front">
                                                {activeSet.cards[currentCardIndex].question}
                                                {!isFlipped && <div style={{ position: 'absolute', bottom: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Click to Flip</div>}
                                            </div>
                                            <div className="flashcard-face flashcard-back">
                                                {activeSet.cards[currentCardIndex].answer}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`flashcard-controls ${isFlipped ? 'visible' : ''}`}>
                                        <button className="btn-rate btn-hard" onClick={() => handleRateCard('hard')}>Hard (15 XP)</button>
                                        <button className="btn-rate btn-good" onClick={() => handleRateCard('good')}>Good (10 XP)</button>
                                        <button className="btn-rate btn-easy" onClick={() => handleRateCard('easy')}>Easy (5 XP)</button>
                                    </div>
                                </>
                            ) : (
                                <div className="set-complete">
                                    <FaCheck style={{ fontSize: '4rem', color: '#00ffcc', marginBottom: '1rem' }} />
                                    <h2>TRAINING COMPLETE</h2>
                                    <p style={{ color: 'var(--game-text-muted)', fontSize: '1.2rem' }}>Total Data Absorbed: {xpGained} XP</p>
                                    <button className="btn-primary" onClick={closeTraining} style={{ marginTop: '2rem' }}>Return to Archives</button>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default Flashcards;
