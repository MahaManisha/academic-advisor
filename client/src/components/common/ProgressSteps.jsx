import React from 'react';
import './ProgressSteps.css';
import { FaUser, FaEnvelope, FaGraduationCap } from 'react-icons/fa';

const ProgressSteps = ({ currentStep }) => {
    const steps = [
        { id: 1, label: 'Account', icon: <FaUser /> },
        { id: 2, label: 'Identity', icon: <FaGraduationCap /> },
        { id: 3, label: 'Details', icon: <FaEnvelope /> } // Reusing icon or getting a better one? FaFileAlt? FaBriefcase?
    ];

    return (
        <div className="progress-container">
            <div className="progress-bar-background">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
            </div>
            {steps.map((step, index) => (
                <div
                    key={step.id}
                    className={`step-item ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
                >
                    <div className="step-icon">
                        {step.icon}
                    </div>
                    <span className="step-label">{step.label}</span>
                </div>
            ))}
        </div>
    );
};

export default ProgressSteps;
