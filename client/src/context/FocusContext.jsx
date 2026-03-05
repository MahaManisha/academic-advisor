import React, { createContext, useContext, useState, useCallback } from 'react';

const FocusContext = createContext(null);

export const FocusProvider = ({ children }) => {
    const [isFocusModeActive, setIsFocusModeActive] = useState(false);
    const [focusCourse, setFocusCourse] = useState(null);

    const startFocusMode = useCallback((courseData) => {
        setFocusCourse(courseData || { id: null, title: 'Deep Work Session' });
        setIsFocusModeActive(true);
    }, []);

    const stopFocusMode = useCallback(() => {
        setIsFocusModeActive(false);
        setFocusCourse(null);
    }, []);

    return (
        <FocusContext.Provider value={{
            isFocusModeActive,
            focusCourse,
            startFocusMode,
            stopFocusMode
        }}>
            {children}
        </FocusContext.Provider>
    );
};

export const useFocus = () => {
    const context = useContext(FocusContext);
    if (!context) {
        throw new Error('useFocus must be used within a FocusProvider');
    }
    return context;
};
