import React from 'react';
import { useGamification } from '../../context/GamificationContext';

const XPBar = ({ showLabels = true }) => {
    const { xp, progressToNextLevel, level } = useGamification();

    const xpForCurrentLevel = (level - 1) * 200;
    const xpForNextLevel = level * 200;
    const currentLevelXP = xp - xpForCurrentLevel;

    return (
        <div className="g-xp-wrapper">
            {showLabels && (
                <div className="g-xp-labels">
                    <span>XP</span>
                    <span>{currentLevelXP} / 200</span>
                </div>
            )}
            <div className="g-xp-bg">
                <div
                    className="g-xp-fill"
                    style={{ width: `${progressToNextLevel}%` }}
                ></div>
            </div>
        </div>
    );
};

export default XPBar;
