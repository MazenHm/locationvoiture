import React, { useState } from 'react';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };
  
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <i className="fas fa-bars"></i>
        </button>
        <h1 className="page-title">Vehicle Rental Dashboard</h1>
      </div>
      
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search vehicles, clients, reservations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button type="submit" className="search-button">Search</button>
      </form>
      
      <div className="header-right">
        <button className="header-icon">
          <i className="fas fa-bell"></i>
          <span className="notification-badge">3</span>
        </button>
        <button className="header-icon">
          <i className="fas fa-envelope"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;