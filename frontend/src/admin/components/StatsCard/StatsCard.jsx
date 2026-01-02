import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'primary',
    secondary: 'secondary',
    dark: 'dark'
  };
  
  const colorClass = colorClasses[color] || 'primary';
  
  return (
    <div className={`stats-card ${colorClass}`}>
      <div className="stats-info">
        <h3 className="stats-value">{value}</h3>
        <p className="stats-title">{title}</p>
      </div>
      <div className="stats-icon">
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
  );
};

export default StatsCard;