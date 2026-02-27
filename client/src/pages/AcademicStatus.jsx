import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaUniversity, FaGraduationCap, FaCheckCircle } from 'react-icons/fa';
import ProgressSteps from '../components/common/ProgressSteps';
import './Register.css';

const AcademicStatus = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);

    const handleSelect = (status) => {
        setSelected(status);
        // Save to localStorage immediately or on continue, but state is enough for UI feedback
    };

    const handleNext = () => {
        if (!selected) return;
        localStorage.setItem('academicType', selected);
        navigate('/academic-details');
    };

    return (
        <div className="register-container">
            <div className="register-card" style={{ maxWidth: '800px' }}>
                <ProgressSteps currentStep={2} />

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 className="register-title">Choose Your Path 🎓</h2>
                    <p className="register-subtitle">
                        {selected
                            ? "Great choice! 🎯 Let's personalize your experience."
                            : "Tell us where you are in your academic journey."}
                    </p>
                </div>

                {/* Status Selection Cards */}
                <div className="status-grid">
                    {/* 1. School Student */}
                    <div
                        onClick={() => handleSelect('school')}
                        className={`status-card ${selected === 'school' ? 'active-card' : ''}`}
                    >
                        <div className="card-icon">
                            <FaUniversity size={30} color={selected === 'school' ? '#4facfe' : '#00ffcc'} />
                        </div>
                        <h3>School Student</h3>
                        {selected === 'school' && <FaCheckCircle className="check-icon" />}
                    </div>

                    {/* 2. College Student */}
                    <div
                        onClick={() => handleSelect('college')}
                        className={`status-card ${selected === 'college' ? 'active-card' : ''}`}
                    >
                        <div className="card-icon">
                            <FaGraduationCap size={30} color={selected === 'college' ? '#4facfe' : '#00ffcc'} />
                        </div>
                        <h3>College Student</h3>
                        {selected === 'college' && <FaCheckCircle className="check-icon" />}
                    </div>

                    {/* 3. Graduate */}
                    <div
                        onClick={() => handleSelect('graduate')}
                        className={`status-card ${selected === 'graduate' ? 'active-card' : ''}`}
                    >
                        <div className="card-icon">
                            <FaUserGraduate size={30} color={selected === 'graduate' ? '#4facfe' : '#00ffcc'} />
                        </div>
                        <h3>Graduate</h3>
                        {selected === 'graduate' && <FaCheckCircle className="check-icon" />}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <button
                        onClick={handleNext}
                        className={`register-button ${selected ? 'pulse-on-hover' : ''}`}
                        disabled={!selected}
                        style={{ width: '100%', maxWidth: '300px' }}
                    >
                        Continue
                    </button>
                </div>
            </div>

            <style>{`
                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 30px 0;
                }
                .status-card {
                    position: relative;
                    border: 2px solid rgba(0, 255, 204, 0.3);
                    border-radius: 16px;
                    padding: 30px 20px;
                    cursor: pointer;
                    text-align: center;
                    background: rgba(0, 0, 0, 0.4);
                    color: #fff;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                    backdrop-filter: blur(10px);
                }
                .status-card:hover {
                    border-color: #00ffcc;
                    transform: translateY(-4px);
                    box-shadow: 0 0 15px rgba(0, 255, 204, 0.3);
                }
                .status-card.active-card {
                    border-color: #4facfe;
                    background: rgba(79, 172, 254, 0.1);
                    transform: scale(1.05);
                    box-shadow: inset 0 0 20px rgba(79, 172, 254, 0.2), 0 0 20px rgba(79, 172, 254, 0.4);
                    border-width: 2px;
                }
                .status-card h3 {
                    font-family: var(--game-font-display, 'Orbitron', sans-serif);
                    letter-spacing: 1px;
                    margin: 0;
                    text-transform: uppercase;
                    font-size: 16px;
                }
                .card-icon {
                    width: 60px;
                    height: 60px;
                    background: rgba(0, 255, 204, 0.1);
                    border: 1px solid rgba(0, 255, 204, 0.3);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .active-card .card-icon {
                    background: transparent;
                    border-color: #4facfe;
                    box-shadow: inset 0 0 15px rgba(79, 172, 254, 0.5);
                }
                .check-icon {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    color: #4facfe;
                    font-size: 20px;
                    text-shadow: 0 0 10px #4facfe;
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                @keyframes popIn {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .pulse-on-hover:hover {
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(0, 255, 204, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(0, 255, 204, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0, 255, 204, 0); }
                }
            `}</style>
        </div>
    );
};

export default AcademicStatus;
