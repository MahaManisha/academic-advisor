import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaRobot, FaTimes, FaTrophy, FaLightbulb, FaExchangeAlt, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * AdaptiveAssessment Interface
 * A highly immersive, gamified reactive component testing user proficiency adaptively.
 */
const AdaptiveAssessment = ({ onClose, onComplete }) => {
    // Assessment State
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [answerText, setAnswerText] = useState("");

    // Gamification & UI State
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [streak, setStreak] = useState(0);
    const [domainGraphData, setDomainGraphData] = useState([{ round: 0, AI: 0, WebDev: 0, CoreCS: 0 }]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [viewMode, setViewMode] = useState('game'); // 'normal', 'game', 'accessibility'

    // Mock initial question load (In production, replace with API call)
    useEffect(() => {
        loadNextQuestion();
    }, []);

    const playSound = (type) => {
        if (!soundEnabled) return;
        // Mocking sound dispatch - in real app use Howler.js or Native Audio
        console.log(`Playing sound effect: ${type}`);
    };

    const loadNextQuestion = async () => {
        setIsLoading(true);
        // MOCK API CALL: In real app, hit `GET /api/assessment/next`
        setTimeout(() => {
            setCurrentQuestion({
                id: `q-${Date.now()}`,
                text: "Imagine you have to design a database for a high-traffic e-commerce site. Would you choose SQL or NoSQL, and why?",
                domainType: "CoreCS"
            });
            setIsLoading(false);
            playSound('pop');
        }, 1500);
    };

    const handleSubmitAnswer = async () => {
        if (!answerText.trim()) return;

        setIsLoading(true);
        // MOCK API CALL: In real app, hit `POST /api/assessment/submit`
        setTimeout(() => {
            // Simulated evaluation metrics returned from LLM Answer Evaluation Service
            const mockEvaluation = {
                gainedXp: answerText.length > 50 ? 50 : 20,
                metrics: { AI: Math.random() * 5, WebDev: Math.random() * 5, CoreCS: Math.random() * 10 }
            };

            // Update State
            const newXp = xp + mockEvaluation.gainedXp;
            setXp(newXp);
            if (newXp > level * 100) {
                setLevel(l => l + 1);
                playSound('levelup');
            } else {
                playSound('success');
            }
            setStreak(s => s + 1);

            // Update Graph
            setDomainGraphData(prev => [
                ...prev,
                { round: prev.length, ...mockEvaluation.metrics }
            ]);

            setHistory([...history, { q: currentQuestion.text, a: answerText }]);
            setAnswerText("");

            // End test condition (e.g., after 3 questions for demo)
            if (history.length >= 2) {
                setIsFinished(true);
                playSound('victory');
            } else {
                loadNextQuestion();
            }
        }, 2000);
    };

    // --- RENDER HELPERS ---

    const renderProgressBar = () => (
        <div className="w-full bg-gray-800 rounded-full h-3 mb-4 shadow-inner overflow-hidden border border-gray-700">
            <motion.div
                className="bg-gradient-to-r from-teal-400 to-blue-500 h-3"
                initial={{ width: 0 }}
                animate={{ width: `${(history.length / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>
    );

    const renderDomainGraph = () => (
        <div className="h-40 w-full bg-gray-900 rounded-xl p-2 border border-blue-900/50 shadow-lg">
            <h4 className="text-xs text-blue-300 mb-1 ml-2 font-semibold uppercase tracking-wider">Evolution Graph</h4>
            <ResponsiveContainer width="100%" height="80%">
                <LineChart data={domainGraphData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                    <XAxis dataKey="round" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="CoreCS" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} />
                    <Line type="monotone" dataKey="WebDev" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    if (isFinished) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <div className="bg-gray-900 border-2 border-green-500 p-8 rounded-2xl max-w-lg w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                    <FaTrophy className="text-6xl text-yellow-500 mx-auto mb-4 animate-bounce" />
                    <h2 className="text-3xl font-bold text-white mb-2">Assessment Complete!</h2>
                    <p className="text-gray-400 mb-6">Your adaptive profile has been updated in the intelligence layer.</p>

                    <div className="flex justify-center gap-6 mb-8">
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <span className="block text-sm text-gray-400">Total XP</span>
                            <span className="text-2xl font-bold text-teal-400">{xp}</span>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <span className="block text-sm text-gray-400">Final Level</span>
                            <span className="text-2xl font-bold text-purple-400">{level}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => { onComplete && onComplete(); onClose(); }}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 font-bold rounded-xl text-white shadow-lg transition-transform hover:scale-105"
                    >
                        Return to Hub
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            >
                {/* Main Card */}
                <div className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${viewMode === 'game' ? 'bg-gray-900 border border-blue-500/30' :
                        viewMode === 'accessibility' ? 'bg-white border-4 border-black' :
                            'bg-slate-800 border border-slate-600'
                    }`}>

                    {/* Header Bar */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-black/20">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/50">
                                <FaTrophy fontSize="12px" />
                                <span className="font-bold text-sm">Lvl {level}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/50">
                                <span className="font-bold text-sm">{xp} XP</span>
                            </div>
                            <div className="flex items-center gap-2 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full border border-orange-500/50">
                                🔥 <span className="font-bold text-sm">{streak} Streak</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-gray-400 hover:text-white transition-colors">
                                {soundEnabled ? <FaVolumeUp size={20} /> : <FaVolumeMute size={20} />}
                            </button>
                            <button onClick={() => setViewMode(v => v === 'game' ? 'normal' : 'game')} className="text-gray-400 hover:text-blue-400 transition-colors" title="Toggle Mode">
                                <FaExchangeAlt size={20} />
                            </button>
                            <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                                <FaTimes size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                        {/* LEFT PANEL - Question Area */}
                        <div className="flex-1 p-6 lg:p-10 flex flex-col overflow-y-auto">
                            {renderProgressBar()}

                            <div className="flex-1 flex flex-col justify-center">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center animate-pulse py-20">
                                        <FaRobot className="text-6xl text-blue-500 mb-4" />
                                        <h3 className="text-xl text-blue-300 font-mono">Synthesizing Adaptive Scenario...</h3>
                                    </div>
                                ) : (
                                    <motion.div
                                        key={currentQuestion?.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6 lg:p-8 shadow-inner"
                                    >
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="bg-blue-500 p-3 rounded-xl shadow-lg shadow-blue-500/50">
                                                <FaRobot className="text-2xl text-white" />
                                            </div>
                                            <div>
                                                <h2 className={`text-2xl lg:text-3xl font-bold leading-relaxed ${viewMode === 'accessibility' ? 'text-black' : 'text-white'}`}>
                                                    {currentQuestion?.text}
                                                </h2>
                                                <div className="mt-3 inline-block bg-teal-500/20 text-teal-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                    Domain Scan: {currentQuestion?.domainType}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Free Text Input directly integrated */}
                                        <div className="mt-8 relative">
                                            <textarea
                                                autoFocus
                                                value={answerText}
                                                onChange={(e) => setAnswerText(e.target.value)}
                                                placeholder="Explain your thought process here..."
                                                className={`w-full h-40 p-5 rounded-xl border-2 transition-all resize-none font-medium text-lg focus:outline-none ${viewMode === 'accessibility'
                                                        ? 'bg-white border-black text-black'
                                                        : 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:bg-gray-800/80 shadow-inner'
                                                    }`}
                                            />
                                            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                                <span className="text-xs text-gray-500 font-mono">{answerText.length} chars</span>
                                                <button
                                                    onClick={handleSubmitAnswer}
                                                    disabled={answerText.length < 10}
                                                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1"
                                                >
                                                    <FaPlay />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT PANEL - Live Stats & Graph */}
                        <div className="w-full md:w-80 bg-gray-900/50 border-l border-gray-700/50 p-6 flex flex-col gap-6">

                            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-purple-500/30 rounded-2xl p-5 relative overflow-hidden">
                                <FaLightbulb className="absolute -right-4 -top-4 text-7xl text-purple-500/20" />
                                <h3 className="text-purple-300 text-sm font-bold uppercase tracking-wider mb-2">Live Profiling</h3>
                                <p className="text-gray-300 text-sm leading-relaxed relative z-10">
                                    The engine is mapping your responses to architectural and cognitive dimensions in real-time.
                                </p>
                            </div>

                            {renderDomainGraph()}

                            <div className="flex-1 flex flex-col justify-end">
                                <div className="text-center font-mono text-xs text-gray-600 mb-2">
                                    SYSTEM LINK: SECURE
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdaptiveAssessment;
