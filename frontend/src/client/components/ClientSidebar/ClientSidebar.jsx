import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../admin/context/AuthContext';
import styles from './ClientSidebar.module.css';

const ClientSidebar = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 1, icon: "fa-home", label: "Dashboard", path: "/client/dashboard" },
    { id: 2, icon: "fa-car", label: "Available Cars", path: "/client/cars" },
    { id: 3, icon: "fa-calendar-check", label: "My Bookings", path: "/client/reservations" },
    { id: 4, icon: "fa-user", label: "My Profile", path: "/client/profile" }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getUserInitials = () => {
    if (!user?.name) return 'C';
    const names = user.name.split(' ');
    return names.length >= 2
      ? `${names[0][0]}${names[1][0]}`
      : names[0][0];
  };

  return (
    <aside className={`${styles.clientSidebar} ${collapsed ? styles.collapsed : ''}`}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <i className="fas fa-car"></i>
          </div>

          {!collapsed && (
            <div className={styles.logoText}>
              <h1>PolyDrive</h1>
              <p className={styles.logoSubtitle}>Client Portal</p>
            </div>
          )}
        </div>

        <button className={styles.toggle} onClick={onToggle}>
          <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>

      {/* NAV */}
      <nav className={styles.nav}>
        <ul className={styles.menu}>
          {menuItems.map(item => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${styles.menuLink} ${isActive ? styles.active : ''}`
                }
              >
                <div className={styles.menuIcon}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                {!collapsed && <span className={styles.menuLabel}>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* FOOTER */}
      <div className={styles.footer}>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>{getUserInitials()}</div>

          {!collapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || 'Client'}</span>
              <span className={styles.userRole}>Client</span>
            </div>
          )}
        </div>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

    </aside>
  );
};

export default ClientSidebar;
