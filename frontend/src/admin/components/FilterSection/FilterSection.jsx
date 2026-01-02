import React, { useState } from 'react';
import './FilterSection.css';

const FilterSection = () => {
  const [activeType, setActiveType] = useState('SUV');
  const [activeColor, setActiveColor] = useState(null);
  
  const vehicleTypes = ['SUV', 'Sport', 'Coupe', 'Hatchback', 'MVP', 'Sedan'];
  const colors = ['Black', 'Blue', 'Red', 'Dark Gray', 'Dark Blue', 'Green'];
  
  const handleTypeClick = (type) => {
    setActiveType(type);
  };
  
  const handleColorClick = (color) => {
    setActiveColor(activeColor === color ? null : color);
  };
  
  return (
    <div className="filter-section">
      <div className="filter-group">
        <h3 className="filter-title">Type</h3>
        <div className="filter-options">
          {vehicleTypes.map((type) => (
            <button
              key={type}
              className={`filter-option ${activeType === type ? 'active' : ''}`}
              onClick={() => handleTypeClick(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      <div className="filter-group">
        <h3 className="filter-title">Color</h3>
        <div className="filter-options">
          {colors.map((color) => (
            <button
              key={color}
              className={`filter-option ${activeColor === color ? 'active' : ''}`}
              onClick={() => handleColorClick(color)}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      
      <div className="gps-tracking">
        <div className="gps-header">
          <i className="fas fa-satellite"></i>
          <h3>GPS Tracking</h3>
        </div>
        <div className="tracking-info">
          <div className="tracking-item">
            <span className="tracking-label">Vehicle:</span>
            <span className="tracking-value">Tesla Model 3</span>
          </div>
          <div className="tracking-item">
            <span className="tracking-label">Plate:</span>
            <span className="tracking-value plate">B1T2ABC</span>
          </div>
          <div className="tracking-item">
            <span className="tracking-label">Status:</span>
            <span className="tracking-value status active">Active</span>
          </div>
          <div className="tracking-item">
            <span className="tracking-label">Last Updated:</span>
            <span className="tracking-value">5 min ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;