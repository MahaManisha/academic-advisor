import React from 'react';
import { useGamification } from '../../context/GamificationContext';

const LevelBadge = ({ size = 'medium' }) => {
    const { level } = useGamification();

    return (
        <div className="g-level-badge" style={{
            transform: size === 'large' ? 'scale(1.5)' : size === 'small' ? 'scale(0.8)' : 'scale(1)',
            margin: size === 'large' ? '12px' : '0'
        }}>
            {level}
        </div>
    );
};

export default LevelBadge;
