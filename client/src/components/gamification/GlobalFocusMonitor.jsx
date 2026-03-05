import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaTrophy, FaVideo, FaMinus, FaExpand } from 'react-icons/fa';
import { startStudySession, endStudySession } from '../../api/study.api';
import { useFocus } from '../../context/FocusContext';
import { useGamification } from '../../context/GamificationContext';
import './GlobalFocusMonitor.css';

const GlobalFocusMonitor = () => {
    const { isFocusModeActive, focusCourse, stopFocusMode } = useFocus();
    const { triggerAction } = useGamification();
    const webcamRef = useRef(null);
    const [model, setModel] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [isFocused, setIsFocused] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);

    // Timers and Stats
    const [sessionData, setSessionData] = useState(null);
    const [totalTimeMs, setTotalTimeMs] = useState(0);
    const [focusedTimeMs, setFocusedTimeMs] = useState(0);
    const [distractions, setDistractions] = useState(0);
    const [focusScore, setFocusScore] = useState(100);
    const [consecutiveDistractedSeconds, setConsecutiveDistractedSeconds] = useState(0);

    const speak = (text) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.rate = 1;
        speech.pitch = 1.1;
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.name.includes("Female") || v.name.includes("Google US English") || v.lang.includes("en-US"));
        if (femaleVoice) speech.voice = femaleVoice;
        window.speechSynthesis.speak(speech);
    };

    useEffect(() => {
        if (!isFocusModeActive) return;

        let active = true;
        async function init() {
            try {
                await tf.ready();
                const loadedModel = await blazeface.load();
                if (active) setModel(loadedModel);

                const res = await startStudySession(focusCourse?.id);
                if (res.success && active) {
                    setSessionData(res.session);
                    speak("Focus study mode initiated. Good luck on your mission.");
                }
            } catch (err) {
                console.error("Setup error:", err);
            }
        }
        init();

        return () => {
            active = false;
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            // Reset stats when closed
            setTotalTimeMs(0);
            setFocusedTimeMs(0);
            setDistractions(0);
            setFocusScore(100);
            setCameraActive(false);
            setModel(null);
        };
    }, [isFocusModeActive, focusCourse]);

    useEffect(() => {
        if (!model || !cameraActive || !isFocusModeActive) return;

        let loopInterval;
        const LOOP_SPEED_MS = 1000;

        const detectFace = async () => {
            if (webcamRef.current?.video?.readyState === 4) {
                const video = webcamRef.current.video;
                const predictions = await model.estimateFaces(video, false);

                let currentlyFocused = predictions.length > 0;

                if (currentlyFocused) {
                    setIsFocused(true);
                    setFocusedTimeMs(prev => prev + LOOP_SPEED_MS);
                    setConsecutiveDistractedSeconds(0);
                } else {
                    setIsFocused(false);
                    setConsecutiveDistractedSeconds(prev => {
                        const newDistractionTime = prev + 1;
                        if (newDistractionTime === 15) {
                            setDistractions(d => d + 1);
                            speak("Warning: Focus drifting.");
                        } else if (newDistractionTime === 45) {
                            setDistractions(d => d + 1);
                            speak("You are distracted for quite a while.");
                        }
                        return newDistractionTime;
                    });
                }
                setTotalTimeMs(prev => prev + LOOP_SPEED_MS);
            }
        };

        loopInterval = setInterval(detectFace, LOOP_SPEED_MS);
        return () => clearInterval(loopInterval);
    }, [model, cameraActive, isFocusModeActive]);

    useEffect(() => {
        if (totalTimeMs > 0) {
            setFocusScore(Math.round((focusedTimeMs / totalTimeMs) * 100));
        }
    }, [totalTimeMs, focusedTimeMs]);

    const REWARD_GOAL_MS = process.env.NODE_ENV === 'development' ? 60000 : 3600000;

    const handleEndSession = async () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();

        let xpEarned = 0;
        if (focusedTimeMs >= REWARD_GOAL_MS) {
            xpEarned = 100;
            speak("Excellent! Focus goal achieved.");
            triggerAction('FOCUS_SESSION', 100);
            alert("Focus Badge unlocked! +100 XP Earned!");
        } else {
            speak("Study session terminated.");
        }

        try {
            if (sessionData?._id) {
                await endStudySession({
                    sessionId: sessionData._id,
                    totalStudyTime: Math.floor(totalTimeMs / 1000),
                    focusedTime: Math.floor(focusedTimeMs / 1000),
                    distractions,
                    xpEarned
                });
            }
        } catch (e) {
            console.error("Failed to commit session", e);
        }

        stopFocusMode();
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!isFocusModeActive) return null;

    return (
        <div className={`focus-monitor-overlay ${isMinimized ? 'minimized' : ''}`}>
            <div className="focus-monitor-content">
                <div className="focus-monitor-controls">
                    <button className="control-btn minimize" onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? <FaExpand /> : <FaMinus />}
                    </button>
                    <button className="control-btn close" onClick={handleEndSession}>
                        <FaTimesCircle />
                    </button>
                </div>

                <div className="focus-monitor-header">
                    <h2 className="title-text"><FaVideo /> {isMinimized ? '' : 'FOCUS MODE'}</h2>
                    <div className={`status-pill ${isFocused ? 'focused' : 'distracted'}`}>
                        {isFocused ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        {!isMinimized && (isFocused ? ' IN THE ZONE' : ' DISTRACTED')}
                    </div>
                </div>

                {!isMinimized && (
                    <div className="focus-monitor-main">
                        <div className="cam-box">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                className={`webcam-preview ${cameraActive ? 'active' : ''} ${!isFocused ? 'dimmed' : ''}`}
                                onUserMedia={() => setCameraActive(true)}
                                videoConstraints={{ width: 160, height: 120 }}
                            />
                            {!cameraActive && model && <div className="cam-placeholder">Loading...</div>}
                        </div>

                        <div className="stats-mini-grid">
                            <div className="mini-stat">
                                <span className="lbl">Score</span>
                                <span className="val" style={{ color: focusScore > 80 ? '#00ffcc' : '#ff00ff' }}>{focusScore}%</span>
                            </div>
                            <div className="mini-stat">
                                <span className="lbl">Time</span>
                                <span className="val">{formatTime(totalTimeMs)}</span>
                            </div>
                        </div>

                        <div className="progress-mini">
                            <div className="bar-bg">
                                <div className="bar-fill" style={{ width: `${Math.min(100, (focusedTimeMs / REWARD_GOAL_MS) * 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {isMinimized && (
                    <div className="minimized-info">
                        <span className="mini-timer">{formatTime(totalTimeMs)}</span>
                        <span className="mini-score" style={{ color: focusScore > 80 ? '#00ffcc' : '#ff00ff' }}>{focusScore}%</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalFocusMonitor;
