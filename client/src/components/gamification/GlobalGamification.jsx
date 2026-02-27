import React from 'react';
import Confetti from 'react-confetti';
import { useGamification } from '../../context/GamificationContext';
import { FaCrown, FaTimes } from 'react-icons/fa';

const GlobalGamification = () => {
    const { achievements, levelUpData, clearLevelUp } = useGamification();

    return (
        <>
            {/* Achievement Popups */}
            <div className="g-achievement-container">
                {achievements.map((ach) => (
                    <div key={ach.id} className="g-achievement-popup">
                        <div className="g-achievement-icon">
                            <FaCrown />
                        </div>
                        <div className="g-achievement-text">
                            <h4>Achievement Unlocked!</h4>
                            <p>{ach.name}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Level Up Modal Wrapper */}
            {levelUpData && (
                <div className="g-level-up-overlay" onClick={clearLevelUp}>
                    <Confetti numberOfPieces={200} recycle={false} />
                    <div className="g-level-up-modal" onClick={e => e.stopPropagation()}>
                        <button style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }} onClick={clearLevelUp}><FaTimes /></button>
                        <h2 className="g-level-up-title">Level Up!</h2>
                        <div className="g-level-bignum">{levelUpData.level}</div>
                        <p style={{ color: '#a0aec0', marginBottom: 24 }}>You are making great progress! Keep it up!</p>
                        <button className="g-level-btn" onClick={clearLevelUp}>Awesome!</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default GlobalGamification;
