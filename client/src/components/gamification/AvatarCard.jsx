import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LevelBadge from './LevelBadge';
import StreakIndicator from './StreakIndicator';
import XPBar from './XPBar';

export const AvatarCard = () => {
    const { user } = useAuth();

    return (
        <div className="g-glass-card g-avatar-card g-hover-effect">
            <LevelBadge />
            <div className="g-avatar-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="g-avatar-name">{user?.fullName || user?.name || "Student"}</div>
                    <StreakIndicator />
                </div>
                <XPBar />
            </div>
        </div>
    );
};
