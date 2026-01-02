import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminSidebar.css';

const Sidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 1, icon: "fa-tachometer-alt", label: "Dashboard", path: "/admin/dashboard" },
    { id: 2, icon: "fa-car", label: "Vehicles", path: "/admin/vehicles" },
    { id: 3, icon: "fa-calendar-alt", label: "Reservations", path: "/admin/reservations" },
    { id: 4, icon: "fa-users", label: "Clients", path: "/admin/clients" },
    { id: 5, icon: "fa-user-tie", label: "Agents", path: "/admin/agents" },
    { id: 6, icon: "fa-chart-bar", label: "Reports", path: "/admin/reports" },
    { id: 7, icon: "fa-cog", label: "Settings", path: "/admin/settings" }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    return names.length >= 2
      ? `${names[0][0]}${names[1][0]}`
      : names[0][0];
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <i className="fas fa-car"></i>
          </div>

          {!collapsed && (
            <div className="logo-text">
              <h1>PolyDrive</h1>
              <p className="logo-subtitle">Admin</p>
            </div>
          )}
        </div>

        {/* ✅ TOGGLE BUTTON (TOP) */}
        <button
        
          className="sidebar-toggle top-toggle"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>

      {/* NAV */}
      <nav className="sidebar-nav">
        <ul className="menu">
          {menuItems.map(item => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `menu-link ${isActive ? 'active' : ''}`
                }
                end
                data-title={item.label}
              >
                <div className="menu-icon">
                  <i className={`fas ${item.icon}`}></i>
                </div>
                {!collapsed && (
                  <span className="menu-label">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="user-section">
          <div className="user-profile">
            <div className="user-avatar">
              {getUserInitials()}
            </div>

            {!collapsed && user && (
              <div className="user-info">
                <h4 className="user-name">{user.name || 'User'}</h4>
                <p className="user-role">{user.role || 'Admin'}</p>
              </div>
            )}
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
