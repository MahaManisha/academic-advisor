// client/src/context/AccessibilityContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios'; // Automatically attaches tokens via interceptors
import { useAuth } from './AuthContext';
import { MotionConfig } from 'framer-motion';

const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
    const { user } = useAuth();

    const [preferences, setPreferences] = useState({
        highContrastMode: false,
        largeTextMode: false,
        dyslexiaFont: false,
        darkMode: false,
        reducedMotion: false,
        keyboardNavigation: false,
        voiceInteraction: false,
        simplifiedInterface: false,
        lowCognitiveLoad: false,
    });

    // Load user data or fallback to local storage
    useEffect(() => {
        if (user && user.accessibilityPreferences) {
            setPreferences(prev => ({ ...prev, ...user.accessibilityPreferences }));
        } else {
            const stored = localStorage.getItem('accessibilityPrefs');
            if (stored) {
                setPreferences(JSON.parse(stored));
            }
        }
    }, [user]);

    // Apply real-time visual changes
    useEffect(() => {
        const bodyArgs = [];
        const classList = document.body.classList;

        // Clear out earlier dynamically added tailwind classes related to accessibility to avoid conflict
        const classesToRemove = ['bg-black', 'text-yellow-300', 'text-xl', 'dark', 'font-dyslexic', 'reduced-motion', 'keyboard-nav-mode', 'simplified-ui'];
        classesToRemove.forEach(cls => classList.remove(cls));

        if (preferences.darkMode) {
            bodyArgs.push('dark');
        }

        if (preferences.highContrastMode) {
            bodyArgs.push('bg-black', 'text-yellow-300');
        }

        if (preferences.largeTextMode) {
            bodyArgs.push('text-xl');
        }

        if (preferences.dyslexiaFont) {
            bodyArgs.push('font-dyslexic'); // Make sure css exists or adjust tailwind config
        }

        if (preferences.reducedMotion) {
            bodyArgs.push('reduced-motion');
        }

        if (preferences.keyboardNavigation) {
            bodyArgs.push('keyboard-nav-mode');
        }

        if (preferences.simplifiedInterface) {
            bodyArgs.push('simplified-ui');
        }

        // Apply active classes
        if (bodyArgs.length > 0) {
            bodyArgs.forEach(arg => classList.add(arg));
        }

        localStorage.setItem('accessibilityPrefs', JSON.stringify(preferences));
    }, [preferences]);

    const updatePreference = async (key, value) => {
        const updatedPrefs = { ...preferences, [key]: value };
        setPreferences(updatedPrefs);

        // If logged in, persist to backend
        if (user) {
            try {
                await axios.patch('/users/accessibility', {
                    accessibilityPreferences: updatedPrefs
                });
            } catch (err) {
                console.error('Failed to sync accessibility preferences', err);
            }
        }
    };

    return (
        <AccessibilityContext.Provider value={{ preferences, updatePreference }}>
            <MotionConfig reducedMotion={preferences.reducedMotion ? 'always' : 'user'}>
                {children}
            </MotionConfig>
        </AccessibilityContext.Provider>
    );
};
