import React from 'react';
import { FaFire } from 'react-icons/fa';
import { useGamification } from '../../context/GamificationContext';

const StreakIndicator = () => {
    const { streak } = useGamification();

    if (streak === 0) return null;

    return (
        <div className={`g-streak ${streak >= 3 ? 'active' : ''}`} title={`${streak} Day Streak!`}>
            <FaFire />
            <span>{streak}</span>
        </div>
    );
};

export default StreakIndicator;
