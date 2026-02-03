import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './Analytics.css'; // Shared styles

const StatCard = ({ title, value, icon, change, changeType = 'neutral', subtext }) => {
    return (
        <div className="stat-card">
            <div className="stat-header">
                <div className="stat-icon-container">
                    {icon}
                </div>
                <span className="stat-title">{title}</span>
            </div>
            <div className="stat-content">
                <h3 className="stat-value">{value}</h3>
                {change && (
                    <div className={`stat-change ${changeType}`}>
                        {changeType === 'positive' && <FaArrowUp />}
                        {changeType === 'negative' && <FaArrowDown />}
                        <span>{change}</span>
                    </div>
                )}
            </div>
            {subtext && <p className="stat-subtext">{subtext}</p>}
        </div>
    );
};

export default StatCard;
