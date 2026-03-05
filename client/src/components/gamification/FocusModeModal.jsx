import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaTrophy, FaVideo, FaVolumeUp } from 'react-icons/fa';
import { startStudySession, endStudySession } from '../../api/study.api';
import './FocusModeModal.css';

const FocusModeModal = ({ course, onClose, onRewardEarned }) => {
    const webcamRef = useRef(null);
    const [model, setModel] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [isFocused, setIsFocused] = useState(true);

    // Timers and Stats
    const [sessionData, setSessionData] = useState(null); // the backend ID
    const [totalTimeMs, setTotalTimeMs] = useState(0); // overall run
    const [focusedTimeMs, setFocusedTimeMs] = useState(0);
    const [distractions, setDistractions] = useState(0);
    const [focusScore, setFocusScore] = useState(100);

    // Distraction loop tracking
    const [consecutiveDistractedSeconds, setConsecutiveDistractedSeconds] = useState(0);

    // Voice Synthesis helper
    const speak = (text) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-US";
        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1.1;

        // Pick female voice if available
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.name.includes("Female") || v.name.includes("Google US English"));
        if (femaleVoice) speech.voice = femaleVoice;

        window.speechSynthesis.speak(speech);
    };

    // Initialization: Load Model & Start Backend Session
    useEffect(() => {
        let active = true;

        async function init() {
            try {
                await tf.ready();
                const loadedModel = await blazeface.load();
                if (active) setModel(loadedModel);

                // Let's spawn a study session in the backend
                const res = await startStudySession(course?.id);
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
        };
    }, [course]);

    // The Main Loop for TFJS Checking + Timing
    useEffect(() => {
        if (!model || !cameraActive) return;

        let loopInterval;
        const LOOP_SPEED_MS = 1000; // Check every 1 second

        const detectFace = async () => {
            if (
                typeof webcamRef.current !== "undefined" &&
                webcamRef.current !== null &&
                webcamRef.current.video.readyState === 4
            ) {
                const video = webcamRef.current.video;
                const predictions = await model.estimateFaces(video, false);

                let currentlyFocused = false;
                if (predictions.length > 0) {
                    // we have a face
                    currentlyFocused = true;
                }

                if (currentlyFocused) {
                    setIsFocused(true);
                    setFocusedTimeMs(prev => prev + LOOP_SPEED_MS);
                    setConsecutiveDistractedSeconds(0);
                } else {
                    setIsFocused(false);
                    setConsecutiveDistractedSeconds(prev => {
                        const newDistractionTime = prev + 1;

                        // Triggers Voice Alert if distracted 15+ seconds!
                        if (newDistractionTime === 15) {
                            setDistractions(d => d + 1);
                            speak("Warning: Focus drifting. Please return your attention to the study session.");
                        } else if (newDistractionTime === 45) {
                            setDistractions(d => d + 1);
                            speak("You are distracted for quite a while. Your mission progress requires focus.");
                        }

                        return newDistractionTime;
                    });
                }

                setTotalTimeMs(prev => prev + LOOP_SPEED_MS);
            }
        };

        loopInterval = setInterval(detectFace, LOOP_SPEED_MS);

        return () => clearInterval(loopInterval);
    }, [model, cameraActive]);

    // Calculate Score Dynamically
    useEffect(() => {
        if (totalTimeMs > 0) {
            const score = Math.round((focusedTimeMs / totalTimeMs) * 100);
            setFocusScore(score);
        }
    }, [totalTimeMs, focusedTimeMs]);

    // Target: 60 mins -> 3600000 ms
    // For demonstration/testing, set the reward goal to just 1 minute so you can see it easily in Dev.
    // We can change to 60 * 60 * 1000 when going live.
    const REWARD_GOAL_MS = process.env.NODE_ENV === 'development' ? 60000 : 3600000;

    const handleEndSession = async () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        setCameraActive(false);

        let xpEarned = 0;
        if (focusedTimeMs >= REWARD_GOAL_MS) {
            xpEarned = 100;
            speak("Excellent! Focus goal achieved. Uploading XP rewards to mainframe!");
            alert("Focus Badge unlocked! +100 XP Earned!");
            if (onRewardEarned) onRewardEarned(100);
        } else {
            speak("Study session terminated.");
        }

        try {
            if (sessionData && sessionData._id) {
                await endStudySession({
                    sessionId: sessionData._id,
                    totalStudyTime: Math.floor(totalTimeMs / 1000), // store as seconds
                    focusedTime: Math.floor(focusedTimeMs / 1000),  // store as seconds
                    distractions,
                    xpEarned
                });
            }
        } catch (e) {
            console.error("Failed to commit session", e);
        }

        onClose();
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="focus-modal-overlay">
            <div className="focus-modal-content">
                <button className="focus-close-btn" onClick={handleEndSession}>
                    <FaTimesCircle />
                </button>

                <div className="focus-header">
                    <h2><FaVideo /> FOCUS MODE {course ? `| ${course.title}` : ''}</h2>
                    <div className={`status-indicator ${isFocused ? 'focused' : 'distracted'}`}>
                        {isFocused ? <><FaCheckCircle /> IN THE ZONE</> : <><FaExclamationTriangle /> DISTRACTED</>}
                    </div>
                </div>

                <div className="focus-main">
                    <div className="camera-feed-container">
                        {!model && (
                            <div className="model-loading">
                                <div className="loader-ring"></div>
                                <p>Initializing Neural Net Tracking</p>
                            </div>
                        )}
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            className={`webcam-preview ${cameraActive ? 'active' : ''} ${!isFocused ? 'dimmed' : ''}`}
                            onUserMedia={() => setCameraActive(true)}
                        />
                        {!cameraActive && model && (
                            <div className="cam-placeholder">Awaiting Feed Access...</div>
                        )}
                    </div>

                    <div className="focus-stats-panel">
                        <div className="stat-block tooltipable">
                            <span className="label">Focus Score</span>
                            <span className="value" style={{ color: focusScore > 80 ? '#00ffcc' : '#ff00ff' }}>
                                {focusScore}%
                            </span>
                        </div>

                        <div className="stat-block tooltipable">
                            <span className="label">Session Timer</span>
                            <span className="value">
                                {formatTime(totalTimeMs)}
                            </span>
                        </div>

                        <div className="stat-block tooltipable">
                            <span className="label">Pure Focus Timer</span>
                            <span className="value" style={{ color: '#00ffcc' }}>
                                {formatTime(focusedTimeMs)}
                            </span>
                        </div>

                        <div className="stat-block tooltipable">
                            <span className="label">Distractions</span>
                            <span className="value" style={{ color: distractions > 0 ? '#ff3366' : '#fff' }}>
                                {distractions}
                            </span>
                        </div>

                        <div className="reward-tracker">
                            <div className="reward-label">
                                <FaTrophy style={{ color: '#ffd700' }} /> XP Target Progress
                                <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '10px' }}>
                                    ({process.env.NODE_ENV === 'development' ? '1 Min Demo' : '60 Mins'})
                                </span>
                            </div>
                            <div className="progress-bar-bg" style={{ background: 'rgba(255, 255, 255, 0.1)', height: '10px', borderRadius: '5px', marginTop: '5px' }}>
                                <div className="progress-fill" style={{
                                    background: 'linear-gradient(90deg, #ffd700, #ff00ff)',
                                    height: '100%',
                                    borderRadius: '5px',
                                    width: `${Math.min(100, (focusedTimeMs / REWARD_GOAL_MS) * 100)}%`
                                }}></div>
                            </div>
                        </div>

                        <button className="btn-end-session" onClick={handleEndSession}>
                            End Study Session
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusModeModal;
