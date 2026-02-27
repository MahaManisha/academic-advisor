// client/src/pages/AssessmentTest.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaClock, FaCheckCircle, FaTimesCircle, FaFire, FaVolumeUp, FaRobot, FaTrophy } from 'react-icons/fa';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { getOnboardingQuestions } from '../api/assessment.api';
import { useGamification } from '../context/GamificationContext';
import { Howl } from 'howler';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import './AssessmentTest.css';

// Sound Effects Setup (Using free hotlinkable sounds for demo)
const sfx = {
  correct: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'], volume: 0.5 }),
  wrong: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'], volume: 0.5 }),
  complete: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'], volume: 0.5 }),
  levelUp: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'], volume: 0.6 })
};

const AssessmentTest = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gamification & Voice State
  const { triggerAction } = useGamification();
  const [combo, setCombo] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [floatingXP, setFloatingXP] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementMsg, setAchievementMsg] = useState('');

  // Voice setup
  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // stop current
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const goodVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Female')));
    if (goodVoice) utterance.voice = goodVoice;

    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Stop talking when unmounting
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Fetch dynamic questions or use passed assessment
  useEffect(() => {
    const initializeAssessment = async () => {
      if (location.state?.assessment) {
        const assessmentData = location.state.assessment;
        let allQuestions = [];
        if (assessmentData.sections) {
          assessmentData.sections.forEach(section => {
            const sectionQuestions = section.questions.map((q, idx) => {
              let correctIndex = -1;
              if (q.options && q.correct_answer) {
                correctIndex = q.options.findIndex(opt => opt === q.correct_answer || opt.startsWith(q.correct_answer));
                if (correctIndex === -1 && q.correct_answer.length === 1) {
                  const charCode = q.correct_answer.charCodeAt(0);
                  if (charCode >= 65 && charCode <= 68) correctIndex = charCode - 65;
                }
              }
              return {
                id: `ai-${section.section_name}-${idx}`,
                question: q.question,
                options: q.options || [],
                difficulty: 'medium',
                subject: section.section_name,
                correct: correctIndex !== -1 ? correctIndex : 0,
                type: q.question_type
              };
            });
            allQuestions = [...allQuestions, ...sectionQuestions];
          });
        }

        const mcqQuestions = allQuestions.filter(q => q.type === 'MCQ' && q.options.length > 0);
        if (mcqQuestions.length > 0) {
          setQuestions(mcqQuestions);
          setLoading(false);
          // Auto-speak first question if desired, usually browsers block autoplay without interaction
          return;
        }
      }

      // Fallback
      try {
        setLoading(true);
        const data = await getOnboardingQuestions();
        if (data.success && data.questions.length > 0) {
          const formattedQuestions = data.questions.map(q => ({
            id: q._id,
            question: q.questionText,
            options: q.options,
            difficulty: q.difficulty === 1 ? 'easy' : q.difficulty === 2 ? 'medium' : 'hard',
            subject: q.domain,
            correct: parseInt(q.correctAnswer)
          }));
          setQuestions(formattedQuestions);
        } else {
          setError("No questions found for your course.");
        }
      } catch (err) {
        console.error("Failed to load:", err);
        setError("Failed to load assessment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initializeAssessment();
  }, [location.state]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, showResults]);

  const fireConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00ffcc', '#4facfe', '#ff00ff']
    });
  };

  const triggerAchievement = (msg) => {
    setAchievementMsg(msg);
    setShowAchievement(true);
    sfx.levelUp.play();
    setTimeout(() => setShowAchievement(false), 3000);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    if (answers[questionId] !== undefined) return;

    setAnswers({ ...answers, [questionId]: optionIndex });
    const q = questions.find(q => q.id === questionId);

    if (q.correct === optionIndex) {
      sfx.correct.play();
      fireConfetti();
      let xpReward = 10;
      let newCombo = combo + 1;

      if (newCombo === 3) {
        triggerAchievement("3 Hit Combo! 🔥");
      } else if (newCombo === 5) {
        triggerAchievement("Unstoppable! 🚀");
      }

      if (newCombo >= 3) xpReward += 20;

      setCombo(newCombo);
      setSessionXP(prev => prev + xpReward);
      triggerAction('CORRECT_ANSWER', xpReward);

      setFloatingXP(`+${xpReward} XP`);
      setTimeout(() => setFloatingXP(null), 1500);
    } else {
      sfx.wrong.play();
      setCombo(0);
    }

    // Auto next after 1.5s if desired (Duolingo style) - Disabled to let user see correct answer
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const calculateResults = () => {
    let totalScore = 0;
    let subjectScores = {};
    let difficultyScores = { easy: 0, medium: 0, hard: 0 };

    questions.forEach(question => {
      const isCorrect = answers[question.id] === question.correct;
      if (isCorrect) {
        totalScore++;
        if (!subjectScores[question.subject]) subjectScores[question.subject] = { correct: 0, total: 0 };
        subjectScores[question.subject].correct++;
      }
      if (question.difficulty && isCorrect) difficultyScores[question.difficulty]++;
      if (!subjectScores[question.subject]) subjectScores[question.subject] = { correct: 0, total: 0 };
      subjectScores[question.subject].total++;
    });

    const percentageScore = ((totalScore / questions.length) * 100).toFixed(1);
    let proficiencyLevel = 'Beginner';
    if (percentageScore >= 80) proficiencyLevel = 'Expert';
    else if (percentageScore >= 60) proficiencyLevel = 'Advanced';
    else if (percentageScore >= 40) proficiencyLevel = 'Intermediate';

    return {
      totalScore,
      totalQuestions: questions.length,
      percentageScore,
      subjectScores,
      difficultyScores,
      proficiencyLevel,
      strengths: Object.entries(subjectScores).filter(([_, data]) => (data.correct / data.total) >= 0.7).map(([subj]) => subj),
      weaknesses: Object.entries(subjectScores).filter(([_, data]) => (data.correct / data.total) < 0.5).map(([subj]) => subj),
    };
  };

  const handleSubmit = async () => {
    const testResults = calculateResults();
    sfx.complete.play();
    confetti({ particleCount: 200, spread: 100, colors: ['#00ffcc', '#ff00ff', '#f59e0b', '#4facfe'] });

    setResults(testResults);
    setShowResults(true);

    triggerAction('ASSESSMENT_COMPLETE');
    setSessionXP(prev => prev + 100);

    const assessmentData = {
      assessmentCompleted: true,
      assessmentDate: new Date().toISOString(),
      assessmentResults: testResults,
      knowledgeScore: testResults.percentageScore,
      proficiencyLevel: testResults.proficiencyLevel,
      strengths: testResults.strengths,
      weaknesses: testResults.weaknesses,
    };

    try {
      await updateProfile(assessmentData);
    } catch (error) {
      console.error('Failed to save assessment results:', error);
    }
  };

  if (loading) {
    return (
      <div className="assessment-container">
        <div className="assessment-card loading-card">
          <div className="loader-ring"></div>
          <h2>Initiating Simulation...</h2>
          <p>Loading parameters and questions.</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="assessment-container">
        <div className="assessment-card error-card">
          <h2>Simulation Error</h2>
          <p>{error || "No data available."}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">Return to Hub</button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="assessment-container">
        <motion.div
          className="results-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <div className="results-header">
            <FaTrophy className="results-icon success" style={{ color: '#ffd700', filter: 'drop-shadow(0 0 10px #ffd700)' }} />
            <h2 className="results-title">Simulation Complete!</h2>
            <p className="results-subtitle">Data sync finished. Uploading to mainframe.</p>
          </div>

          <div className="results-score">
            <div className="score-circle">
              <div className="score-value">{results.percentageScore}%</div>
              <div className="score-label">Sync Rate</div>
            </div>
            <div className="score-details">
              <p>{results.totalScore} / {results.totalQuestions} Objectives Met</p>
              <div className="proficiency-badge">{results.proficiencyLevel} Rank</div>
              <div className="xp-gained-box mt-4">
                + {sessionXP} XP Earned!
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 300, margin: '20px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={Object.entries(results.subjectScores).map(([sub, d]) => ({
                subject: sub, value: Math.round((d.correct / d.total) * 100), fullMark: 100
              }))}>
                <PolarGrid stroke="rgba(0, 255, 204, 0.3)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#00ffcc', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
                <Radar name="Performance" dataKey="value" stroke="#4facfe" fill="#4facfe" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <button className="btn-dashboard btn-submit-test" style={{ width: '100%', marginTop: '20px' }} onClick={() => navigate('/dashboard')}>
            Return to Hub
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progressPercent = ((currentQuestion) / questions.length) * 100;

  return (
    <div className="assessment-container">
      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            className="achievement-popup"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            <FaTrophy style={{ color: '#ffd700' }} /> {achievementMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="assessment-card" style={{ maxWidth: '800px', width: '100%' }}>
        {/* Header & Stats Info */}
        <div className="duo-header">
          <FaTimesCircle className="icon-btn" style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => navigate('/dashboard')} title="Abandon Quest" />

          <div className="progress-bar-container">
            <motion.div
              className="progress-fill neon-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <div className="streak-box" style={{ color: combo >= 3 ? '#f59e0b' : '#6b7280' }}>
            <FaFire className={combo >= 3 ? 'fire-anim' : ''} />
            <span style={{ fontWeight: 800, fontSize: '18px', marginLeft: '4px' }}>{combo}</span>
          </div>
        </div>

        <div className="assessment-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div className="assessment-timer" style={{ margin: '0 auto', fontSize: '20px', color: timeLeft < 60 ? '#ef4444' : '#00ffcc' }}>
            <FaClock />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Question Area with Framer Motion Animation */}
        <div className="question-section" style={{ position: 'relative', marginTop: '-10px' }}>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="ai-speaker-area" style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '30px' }}>
                <div
                  className={`avatar-glow-box ${isSpeaking ? 'speaking' : ''}`}
                  onClick={() => speakQuestion(currentQ.question)}
                  title="Click to hear question"
                >
                  <FaRobot size={36} color="#00ffcc" />
                  <div className="vol-icon"><FaVolumeUp size={12} /></div>
                </div>

                <div className="question-bubble">
                  {currentQ.question}
                </div>
              </div>

              <div className="options-grid">
                {currentQ.options.map((option, index) => {
                  const answered = answers[currentQ.id] !== undefined;
                  const isSelected = answers[currentQ.id] === index;
                  const isCorrectOpt = index === currentQ.correct;

                  let btnClass = 'duo-option';
                  if (answered) {
                    if (isCorrectOpt) btnClass += ' correct';
                    else if (isSelected) btnClass += ' incorrect';
                    else btnClass += ' disabled';
                  }

                  return (
                    <motion.button
                      whileHover={!answered ? { scale: 1.02, boxShadow: '0 0 10px rgba(0,255,204,0.3)' } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      key={index}
                      className={btnClass}
                      onClick={() => handleAnswerSelect(currentQ.id, index)}
                      disabled={answered}
                    >
                      <span className="duo-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="option-text" style={{ flex: 1, textAlign: 'left', fontWeight: 600 }}>{option}</span>

                      {answered && isCorrectOpt && <FaCheckCircle style={{ color: '#00e676', fontSize: '24px' }} />}
                      {answered && isSelected && !isCorrectOpt && <FaTimesCircle style={{ color: '#ff3366', fontSize: '24px' }} />}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Floating XP Animation */}
          <AnimatePresence>
            {floatingXP && (
              <motion.div
                className="g-floating-xp"
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: -40, scale: 1.2 }}
                exit={{ opacity: 0, y: -80 }}
                style={{ left: '50%', translateX: '-50%' }}
              >
                {floatingXP}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="assessment-actions" style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
          {answers[currentQ.id] !== undefined && (
            currentQuestion < questions.length - 1 ? (
              <button className="btn-primary duo-next-btn" onClick={handleNext}>
                CONTINUE
              </button>
            ) : (
              <button className="btn-submit-test duo-next-btn" onClick={handleSubmit}>
                FINISH SIMULATION
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentTest;