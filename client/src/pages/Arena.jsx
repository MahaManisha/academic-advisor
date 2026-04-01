import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useGamification } from '../context/GamificationContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { FaCrosshairs, FaSkull, FaTrophy, FaBolt, FaArrowLeft, FaClock } from 'react-icons/fa';
import './Arena.css';

const Arena = () => {
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const { triggerAction } = useGamification();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // View States: 'LOBBY', 'SEARCHING', 'BATTLE', 'RESULTS'
    const [view, setView] = useState('LOBBY');

    // Lobby State
    const [topicInput, setTopicInput] = useState("");

    // Match State
    const [matchInfo, setMatchInfo] = useState(null);
    const [quizData, setQuizData] = useState([]);
    const [players, setPlayers] = useState([]); // [{id, name, score}]
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

    // Timer
    const [timeRemaining, setTimeRemaining] = useState(15);
    const timerRef = useRef(null);

    // Results
    const [winnerDetails, setWinnerDetails] = useState(null);

    // Challenges List
    const [activeChallenges, setActiveChallenges] = useState([]);

    useEffect(() => {
        if (!socket) return;

        socket.emit("arena_enter_lobby");

        socket.on("arena_challenges_update", (challenges) => {
            setActiveChallenges(challenges);
        });

        socket.on("arena_match_found", (data) => {
            setMatchInfo(data);
            setView('SEARCHING'); // Keeps spinner but changes text to 'Generating Quiz...'
        });

        socket.on("arena_game_start", (data) => {
            setQuizData(data.quiz);
            setPlayers(data.players.map(p => ({ ...p, score: 0 })));
            setCurrentQuestionIndex(0);
            setSelectedOption(null);
            setIsAnswerRevealed(false);
            setView('BATTLE');
            startTimer();
        });

        socket.on("arena_score_update", (data) => {
            setPlayers(data.players);
        });

        socket.on("arena_game_over", (data) => {
            clearInterval(timerRef.current);
            setWinnerDetails(data);
            setView('RESULTS');

            // If I won, give me XP
            if (data.winnerId === socket.id) {
                triggerAction('ARENA_WIN', 200); // 200 XP for winning
            } else if (data.winnerId === null) {
                triggerAction('ARENA_DRAW', 50); // 50 XP to both for drawing
            }
        });

        return () => {
            socket.off("arena_challenges_update");
            socket.off("arena_match_found");
            socket.off("arena_game_start");
            socket.off("arena_score_update");
            socket.off("arena_game_over");
            clearInterval(timerRef.current);
        };
    }, [socket]);

    const startTimer = () => {
        clearInterval(timerRef.current);
        setTimeRemaining(15);
        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleTimeUp = () => {
        if (!selectedOption && selectedOption !== 0) {
            handleAnswerSelect(-1); // Auto wrong
        }
    };

    const submitQueue = (mode = 'pvp') => {
        if (!socket) return alert("Connection lost. Please refresh.");

        const finalTopic = topicInput.trim() || "General Knowledge";

        if (mode === 'ai') {
            socket.emit("arena_join_queue", {
                userId: user.id || user._id,
                name: user.fullName || user.name || "Unknown Student",
                topic: finalTopic,
                mode: 'ai'
            });
            setView('SEARCHING');
        } else {
            // PVP Mode: Create a challenge so others can see it
            socket.emit("arena_create_challenge", {
                userId: user.id || user._id,
                name: user.fullName || user.name || "Unknown Student",
                topic: finalTopic
            });
            setView('SEARCHING');
        }
        setMatchInfo(null);
    };

    const handleAcceptChallenge = (challengeId) => {
        if (!socket) return;
        socket.emit("arena_accept_challenge", {
            challengeId,
            userId: user.id || user._id,
            name: user.fullName || user.name || "Unknown Student"
        });
    };

    const cancelQueue = () => {
        socket.emit("arena_cancel_challenge");
        setView('LOBBY');
    };

    const handleAnswerSelect = (index) => {
        if (isAnswerRevealed) return; // Prevent double clicking

        setSelectedOption(index);
        setIsAnswerRevealed(true);
        clearInterval(timerRef.current);

        const currentQ = quizData[currentQuestionIndex];
        const isCorrect = index === currentQ.correctAnswerIndex;

        // Send to server
        socket.emit("arena_submit_answer", {
            roomId: matchInfo?.roomId, // Note: the server handles room IDs internally via socket rooms, but we might not have it client side. 
            // Wait, I should ensure the server tracks which room my socket is in securely! 
            // The server does track `activeMatches` by socket.id internally in the socket event! But let's pass it anyway. Actually we don't need room ID, we just emit.
            questionIndex: currentQuestionIndex,
            isCorrect,
            timeRemaining
        });

        // Wait 2.5 seconds to show correct answer to both, then next question locally
        setTimeout(() => {
            if (currentQuestionIndex < quizData.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedOption(null);
                setIsAnswerRevealed(false);
                startTimer();
            } else {
                // Wait for server to send GAME OVER
            }
        }, 2500);
    };

    const returnToLobby = () => {
        setView('LOBBY');
        setWinnerDetails(null);
        setMatchInfo(null);
    };

    // Calculate dynamic UI values
    const myPlayer = players.find(p => p.id === socket?.id);
    const opponent = players.find(p => p.id !== socket?.id);

    return (
        <div className="dashboard-container">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
            <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={logout} title="PvP Knowledge Arena" subtitle="Real-time 1v1 Intelligence Battles" />

            <main className="dashboard-main centered-main-layout">
                <div className="centered-content-wrapper arena-container">

                    {view === 'LOBBY' && (
                        <>
                            <div className="arena-header">
                                <h2><FaCrosshairs /> The Arena <FaCrosshairs /></h2>
                                <p>Challenge other real students online to a 5-minute rapid-fire quiz on ANY topic.</p>
                            </div>

                            <div className="matchmaking-panel">
                                <h3>Enter Combat Topic</h3>
                                <input
                                    className="queue-input"
                                    type="text"
                                    placeholder="e.g. 'Thermodynamics', 'JavaScript Closures', 'History of Rome'"
                                    value={topicInput}
                                    onChange={(e) => setTopicInput(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button className="btn-primary" style={{ flex: 1, fontSize: '1.2rem', padding: '1rem', background: '#ff3c64', borderColor: '#ff3c64' }} onClick={() => submitQueue('pvp')}>
                                        COMPETE VS USER
                                    </button>
                                    <button className="btn-secondary" style={{ flex: 1, fontSize: '1.2rem', padding: '1rem', background: 'transparent', borderColor: '#00ffcc', color: '#00ffcc' }} onClick={() => submitQueue('ai')}>
                                        COMPETE VS AI
                                    </button>
                                </div>
                            </div>

                            <div className="challenges-lobby" style={{ marginTop: '2rem' }}>
                                <h3 style={{ color: 'var(--game-neon-blue)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                                    Active Challenges Lobby
                                </h3>
                                {activeChallenges.filter(c => c.socketId !== socket.id).length === 0 ? (
                                    <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center' }}>No active challenges. Be the first to create one!</p>
                                ) : (
                                    <div className="challenges-list" style={{ display: 'grid', gap: '1rem' }}>
                                        {activeChallenges.filter(c => c.socketId !== socket.id).map((challenge) => (
                                            <div key={challenge.challengeId} className="challenge-card" style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '1rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: 'var(--game-neon-pink)' }}>{challenge.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Topic: {challenge.topic}</div>
                                                </div>
                                                <button
                                                    className="btn-primary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                                    onClick={() => handleAcceptChallenge(challenge.challengeId)}
                                                >
                                                    ACCEPT DUEL
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {view === 'SEARCHING' && (
                        <div className="matchmaking-panel">
                            {!matchInfo ? (
                                <>
                                    <div className="radar-spinner"></div>
                                    <h3 style={{ color: 'var(--game-neon-blue)' }}>Searching for Opponent...</h3>
                                    <p>Topic: {topicInput}</p>
                                    <button className="btn-secondary" style={{ marginTop: '2rem' }} onClick={cancelQueue}>Cancel Queue</button>
                                </>
                            ) : (
                                <>
                                    <FaSkull style={{ fontSize: '4rem', color: '#ff3c64', marginBottom: '1rem' }} className="pulse" />
                                    <h3 className="match-found-alert">OPPONENT LOCATED: {matchInfo.opponent ? matchInfo.opponent.toUpperCase() : 'UNKNOWN'}</h3>
                                    <p style={{ color: 'var(--game-neon-pink)' }}>{matchInfo.message}</p>
                                    <p>Battle Topic: {matchInfo.topic}</p>
                                </>
                            )}
                        </div>
                    )}

                    {view === 'BATTLE' && quizData.length > 0 && (
                        <div className="battle-stage">
                            {/* HUD */}
                            <div className="battle-hud">
                                <div className="player-score me">
                                    <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{myPlayer?.name || 'You'}</span>
                                    <span className="score-val">{myPlayer?.score || 0}</span>
                                </div>
                                <div className="vs-badge">VS</div>
                                <div className="player-score opponent">
                                    <span style={{ fontSize: '0.9rem', color: '#aaa' }}>{opponent?.name || 'Opponent'}</span>
                                    <span className="score-val">{opponent?.score || 0}</span>
                                </div>
                            </div>

                            <div className="timer-bar" style={{ width: `${(timeRemaining / 15) * 100}%`, background: timeRemaining < 5 ? '#ff3c64' : 'var(--game-neon-blue)' }}></div>

                            {/* Question */}
                            <div className="question-board">
                                {quizData[currentQuestionIndex].question}
                            </div>

                            {/* Options */}
                            <div className="options-grid">
                                {quizData[currentQuestionIndex].options.map((option, idx) => {
                                    let btnClass = "option-btn";

                                    if (isAnswerRevealed) {
                                        if (idx === quizData[currentQuestionIndex].correctAnswerIndex) {
                                            btnClass += " correct"; // Always show correct answer
                                        } else if (idx === selectedOption) {
                                            btnClass += " wrong"; // Show if I clicked wrong
                                        }
                                    } else if (selectedOption === idx) {
                                        btnClass += " selected";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            className={btnClass}
                                            onClick={() => handleAnswerSelect(idx)}
                                            disabled={isAnswerRevealed}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>

                            <div style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>
                                Question {currentQuestionIndex + 1} of {quizData.length} | <FaClock /> {timeRemaining}s
                            </div>
                        </div>
                    )}

                    {view === 'RESULTS' && winnerDetails && (
                        <div className="results-screen">
                            {winnerDetails.winnerId === socket?.id ? (
                                <>
                                    <FaTrophy style={{ fontSize: '5rem', color: '#ffd700', marginBottom: '1rem' }} className="pulse" />
                                    <h2 className="win-text">VICTORY OVERRIDE</h2>
                                    <p style={{ fontSize: '1.2rem' }}>You destroyed {opponent?.name || 'the opponent'}.</p>
                                    <p style={{ color: '#00ffcc', fontSize: '1.5rem', fontWeight: 'bold' }}>+200 XP Earned</p>
                                </>
                            ) : winnerDetails.winnerId === null ? (
                                <>
                                    <h2 style={{ color: '#fff', fontSize: '3rem' }}>DRAW</h2>
                                    <p>Even match.</p>
                                </>
                            ) : (
                                <>
                                    <FaSkull style={{ fontSize: '5rem', color: '#ff3c64', marginBottom: '1rem' }} />
                                    <h2 className="lose-text">SYSTEM FAILURE</h2>
                                    <p style={{ fontSize: '1.2rem' }}>You were defeated by {winnerDetails.winnerName}.</p>
                                    {winnerDetails.reason && <p style={{ color: '#ff3c64' }}>{winnerDetails.reason}</p>}
                                </>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', margin: '3rem 0' }}>
                                {winnerDetails.players.map((p, i) => (
                                    <div key={i} style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem 2rem', borderRadius: '8px', border: p.id === winnerDetails.winnerId ? '2px solid #ffd700' : '1px solid var(--border-color)' }}>
                                        <h3>{p.name}</h3>
                                        <div style={{ fontFamily: 'Courier New', fontSize: '1.5rem' }}>{p.score} Pts</div>
                                    </div>
                                ))}
                            </div>

                            <button className="btn-primary" onClick={returnToLobby}>RETURN TO LOBBY</button>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default Arena;
