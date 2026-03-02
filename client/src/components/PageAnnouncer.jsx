import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { FaVolumeUp, FaVolumeMute, FaRedo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './PageAnnouncer.css';

const pageInstructions = {
    '/': 'Welcome to Academic Advisor. Please log in or register to begin your learning journey.',
    '/login': 'You are on the login page. Please provide your credentials to access your player hub.',
    '/register': 'This is the registration page. Create a new account to unlock all features.',
    '/dashboard': 'Player Hub initialized. Track your active quests, monitor your academic stats, and review your strategy guide to stay ahead.',
    '/admin/dashboard': 'Admin Command Center initialized. Monitor student progress, review active quests, and manage system parameters.',
    '/assessments': 'Welcome to the quest board. Take on pending assessments to test your knowledge and gain experience points.',
    '/planner': 'Your strategy guide is open. Organize your schedule, add new quests, and mark completed missions.',
    '/advisor-chat': 'AI Companion online. Ask me for personalized academic guidance or strategic advice.',
    '/peer-chat': 'Guild chat active. Connect with your fellow players to exchange notes and strategize.',
    '/courses': 'Mission library open. View your current active missions and explore recommended new tracks.',
    '/settings': 'System settings open. Update your profile parameters and configure your interface preferences.',
    '/onboarding': 'Welcome to the initialization protocol. Let us calibrate your profile by analyzing your academic baseline.',
    '/assessment-test': 'Assessment protocol active. Please analyze the questions carefully and submit your optimal response to earn XP.',
    '/assessment-intro': 'Briefing room open. Review the mission parameters and initialize the assessment when you are ready.',
    '/academic-status': 'Please provide your basic academic background to help us personalize your learning experience.',
    '/academic-details': 'Please provide more details about your academic goals to complete your profile.'
};

const PageAnnouncer = () => {
    const location = useLocation();
    const { preferences, updatePreference } = useAccessibility();
    const [isPlaying, setIsPlaying] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const voiceEnabled = preferences?.voiceInteraction;

    const playInstruction = useCallback((overrideEnable = false) => {
        if (!overrideEnable && !voiceEnabled) {
            window.speechSynthesis.cancel();
            return;
        }

        const instruction = pageInstructions[location.pathname];

        if (instruction) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(instruction);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;

            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);

            window.speechSynthesis.speak(utterance);
        }
    }, [location.pathname, voiceEnabled]);

    useEffect(() => {
        // Stop any speech when leaving the page or changing paths
        window.speechSynthesis.cancel();
        setIsPlaying(false);

        // Initial play on page change if enabled
        if (voiceEnabled) {
            // Small timeout to allow the browser to load components before speaking
            const timeoutId = setTimeout(() => {
                playInstruction();
            }, 700);
            return () => clearTimeout(timeoutId);
        }
    }, [location.pathname, voiceEnabled, playInstruction]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const toggleVoice = () => {
        const newVal = !voiceEnabled;
        updatePreference('voiceInteraction', newVal);
        if (!newVal) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            // Play immediately when turned on
            setTimeout(() => playInstruction(true), 100);
        }
    };

    const replay = () => {
        if (!isPlaying) {
            playInstruction(true); // Always play when manually requested
        }
    };

    return (
        <div className="announcer-container">
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="announcer-menu"
                    >
                        <button
                            onClick={replay}
                            className="announcer-menu-btn"
                            title="Replay Page Instruction"
                        >
                            <FaRedo className={isPlaying ? 'spin-icon' : ''} />
                            <span className="announcer-tooltip">Replay Instructions</span>
                        </button>
                        <button
                            onClick={toggleVoice}
                            className={`announcer-menu-btn ${voiceEnabled ? 'active' : ''}`}
                            title={voiceEnabled ? 'Disable Auto Voice' : 'Enable Auto Voice'}
                        >
                            {voiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                            <span className="announcer-tooltip">
                                {voiceEnabled ? 'Disable Auto Voice' : 'Enable Auto Voice'}
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMenu(!showMenu)}
                className={`announcer-fab ${isPlaying ? 'playing' : ''}`}
            >
                {isPlaying ? <FaVolumeUp /> : (voiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />)}
            </motion.button>
        </div>
    );
};

export default PageAnnouncer;
