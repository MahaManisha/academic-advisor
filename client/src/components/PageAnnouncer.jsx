import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { FaVolumeUp, FaVolumeMute, FaRedo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const pageInstructions = {
    '/': 'Welcome to Academic Advisor. Please log in or register to begin your learning journey.',
    '/login': 'You are on the login page. Please provide your email and password to access your dashboard.',
    '/register': 'This is the registration page. Create a new account to unlock all features.',
    '/dashboard': 'Welcome to your dashboard. Here you can track your academic progress, view your current rank, and see your upcoming tasks. You should review your assignments.',
    '/assessments': 'This is the assessments page. You should take your pending quizzes and assignments to evaluate your knowledge and gain XP.',
    '/planner': 'This is your study planner. You should organize your schedule, add new tasks, and mark completed items.',
    '/advisor-chat': 'This is the advisor chat. You can communicate with your academic advisor here to get personalized guidance.',
    '/peer-chat': 'This is the peer chat area. Connect with your fellow students to exchange notes and discuss coursework.',
    '/courses': 'Here you can view the courses you are currently enrolled in and explore recommended courses.',
    '/settings': 'This is the settings menu. You can update your profile details and configure your preferences here.',
    '/onboarding': 'Welcome to onboarding. Let us set up your profile by answering a few academic questions.',
    '/assessment-test': 'You are taking an assessment test right now. Please read the questions carefully and select the best answers.',
    '/assessment-intro': 'You are about to start a new assessment. Review the instructions and click start when you are ready.',
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
        <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-center space-y-3">
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="flex flex-col gap-2 bg-gray-900 border border-cyan-500/30 p-2 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] mb-2"
                    >
                        <button
                            onClick={replay}
                            className="p-3 bg-gray-800 hover:bg-cyan-900 text-cyan-400 rounded-lg transition-colors group relative flex items-center justify-center"
                            title="Replay Page Instruction"
                        >
                            <FaRedo className={`text-xl ${isPlaying ? 'animate-spin' : ''}`} />
                            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-xs text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Replay Instructions
                            </span>
                        </button>
                        <button
                            onClick={toggleVoice}
                            className={`p-3 hover:bg-cyan-900 rounded-lg transition-colors group relative flex items-center justify-center ${voiceEnabled ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'
                                }`}
                            title={voiceEnabled ? 'Disable Auto Voice' : 'Enable Auto Voice'}
                        >
                            {voiceEnabled ? <FaVolumeUp className="text-xl" /> : <FaVolumeMute className="text-xl" />}
                            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-xs text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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
                className={`p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center transition-all ${isPlaying ? 'bg-cyan-500 text-white animate-pulse' : 'bg-gray-800 text-cyan-400 border border-cyan-500/50 hover:bg-gray-700'
                    }`}
            >
                {isPlaying ? <FaVolumeUp className="text-2xl" /> : (voiceEnabled ? <FaVolumeUp className="text-2xl" /> : <FaVolumeMute className="text-2xl" />)}
            </motion.button>
        </div>
    );
};

export default PageAnnouncer;
