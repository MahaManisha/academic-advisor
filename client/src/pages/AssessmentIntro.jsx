import { useNavigate } from 'react-router-dom';
import './Register.css'; // Reusing the same nice styles

const AssessmentIntro = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/dashboard'); // Or wherever the app actually starts
    };

    return (
        <div className="register-container">
            <div className="register-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
                <h1 className="register-title">All Set! 🎉</h1>
                <p className="register-subtitle">
                    Thanks for sharing your details. Let's get started with your personalized dashboard.
                </p>
                <div style={{ fontSize: '60px', margin: '20px 0' }}>🚀</div>
                <button onClick={handleStart} className="register-button">
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
};

export default AssessmentIntro;
