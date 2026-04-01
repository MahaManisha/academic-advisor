import React, { useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

const ScreenReader = () => {
    const { preferences } = useAccessibility();
    const voiceEnabled = preferences?.voiceInteraction;

    useEffect(() => {
        if (!voiceEnabled) return;

        let debounceTimeout;

        const speakText = (text) => {
            if (!text) return;
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        };

        const handleFocus = (e) => {
            const target = e.target;
            const textToRead = target.getAttribute('aria-label') || target.alt || target.innerText || target.value;
            if (textToRead) {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    speakText(textToRead);
                }, 100);
            }
        };

        const handleMouseEnter = (e) => {
            // Optional: Also read on hover if they are partially sighted or just need help
            const target = e.target;
            // Only read standard interactive elements or elements with aria-label
            if (target.tagName.toLowerCase() === 'button' || target.tagName.toLowerCase() === 'a' || target.getAttribute('aria-label') || target.tagName.toLowerCase() === 'input') {
                const textToRead = target.getAttribute('aria-label') || target.alt || target.innerText || target.value || target.placeholder;
                if (textToRead) {
                    clearTimeout(debounceTimeout);
                    debounceTimeout = setTimeout(() => {
                        speakText(textToRead);
                    }, 300);
                }
            }
        };

        document.addEventListener('focusin', handleFocus);
        document.addEventListener('mouseenter', handleMouseEnter, true);

        return () => {
            document.removeEventListener('focusin', handleFocus);
            document.removeEventListener('mouseenter', handleMouseEnter, true);
        };
    }, [voiceEnabled]);

    return null; // This component doesn't render anything
};

export default ScreenReader;
