import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getGamificationStats, updateGamificationProgress } from '../api/gamification.api';
import { useAuth } from './AuthContext';

const GamificationContext = createContext(null);

export const GamificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
        progressToNextLevel: 0
    });

    // UI state for popups
    const [achievements, setAchievements] = useState([]);
    const [levelUpData, setLevelUpData] = useState(null);

    const fetchStats = useCallback(async () => {
        if (!user) return;
        try {
            const res = await getGamificationStats();
            if (res.success) {
                setStats({
                    xp: res.xp,
                    level: res.level,
                    streak: res.streak,
                    badges: res.badges,
                    progressToNextLevel: res.progressToNextLevel
                });
            }
        } catch (error) {
            console.error("Context fetchStats error", error);
        }
    }, [user]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const playSound = (type) => {
        // Placeholder for sound hooks
        // if (type === 'levelUp') new Audio('/sounds/levelup.mp3').play();
        console.log(`[Sound Hook] Playing sound: ${type}`);
    };

    const triggerAction = async (action, customXP = 0) => {
        try {
            const res = await updateGamificationProgress(action, customXP);
            if (res.success) {
                setStats(prev => ({
                    ...prev,
                    xp: res.newXP,
                    level: res.level,
                    streak: res.streak,
                    progressToNextLevel: ((res.newXP % 200) / 200) * 100,
                    // keep old badges until fetched or add new ones manually, actually let's just refetch or rely on returned stats
                    // the endpoint returns unlockedBadges today, we need to append them
                }));

                // If level up
                if (res.levelUp) {
                    setLevelUpData({ level: res.level });
                    playSound('levelUp');
                } else if (action === 'CORRECT_ANSWER') {
                    playSound('correctAnswer');
                } else {
                    playSound('reward');
                }

                // If badges unlocked, show achievement popup
                if (res.unlockedBadges && res.unlockedBadges.length > 0) {
                    setStats(prev => ({ ...prev, badges: [...new Set([...prev.badges, ...res.unlockedBadges])] }));
                    res.unlockedBadges.forEach(badge => {
                        showAchievementPopup(badge);
                    });
                }

                return res;
            }
        } catch (error) {
            console.error("Trigger action error", error);
        }
    };

    const showAchievementPopup = (badgeName) => {
        const id = Date.now() + Math.random();
        setAchievements(prev => [...prev, { id, name: badgeName }]);
        setTimeout(() => {
            setAchievements(prev => prev.filter(a => a.id !== id));
        }, 4000);
    };

    const clearLevelUp = () => setLevelUpData(null);

    return (
        <GamificationContext.Provider value={{
            ...stats,
            triggerAction,
            achievements,
            levelUpData,
            clearLevelUp,
            refreshStats: fetchStats
        }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => useContext(GamificationContext);
