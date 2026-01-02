import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../../services/api'; // Import your API service
import './Settings.css';

const Settings = () => {
  const { user, updateUser, token } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Initialize profile data from authenticated user
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    joinDate: '',
    avatar: null
  });

  // Password Data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        const response = await authAPI.getUserProfile(user.id);
        const userData = response.data.user;
        
        // Parse user name into first and last name
        const nameParts = userData.name?.split(' ') || ['User', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setProfileData({
          firstName,
          lastName,
          email: userData.email || '',
          phone: userData.phone || '',
          position: userData.role || 'User',
          department: userData.department || '',
          joinDate: userData.createdAt ? new Date(userData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          avatar: userData.avatar || null
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      }
    };
    
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSaveSuccess(false);
    
    try {
      // Combine first and last name
      const name = `${profileData.firstName} ${profileData.lastName}`.trim();
      
      // Prepare data for update
      const updateData = {
        name,
        email: profileData.email,
        phone: profileData.phone || '',
        department: profileData.department || '',
        avatar: profileData.avatar || null,
      };
      
      // Make API call to update profile
      const response = await authAPI.updateProfile(user.id, updateData);
      
      // Update local user state
      const updatedUserData = {
        ...user,
        ...response.data.user
      };
      updateUser(updatedUserData);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to update profile';
      setError(errorMsg);
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSaveSuccess(false);
    
    // Basic validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match!');
      setIsLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long!');
      setIsLoading(false);
      return;
    }
    
    try {
      // Prepare password change data
      const passwordDataToSend = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };
      
      // Make API call to change password
      await authAPI.changePassword(user.id, passwordDataToSend);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to change password';
      setError(errorMsg);
      console.error('Error changing password:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get role badge color
  const getRoleBadgeClass = (role) => {
    if (!role) return 'badge';
    switch (role.toLowerCase()) {
      case 'admin': return 'badge badge-admin';
      case 'agent': return 'badge badge-agent';
      case 'client': return 'badge badge-client';
      default: return 'badge';
    }
  };

  // Helper to get user initials
  const getUserInitials = () => {
    if (!profileData.firstName && !profileData.lastName) return 'U';
    return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`;
  };

  // Render Profile Section
  const renderProfileSection = () => (
    <form className="settings-form" onSubmit={handleSaveProfile}>
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="form-section">
        <h3 className="section-title">Personal Information</h3>
        
        <div className="avatar-section">
          <div className="avatar-preview">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Profile" className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                {getUserInitials()}
              </div>
            )}
          </div>
          <div className="avatar-actions">
            <label className="btn btn-outline">
              <i className="fas fa-camera"></i> Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
            <button 
              type="button" 
              className="btn btn-text"
              onClick={() => setProfileData(prev => ({ ...prev, avatar: null }))}
            >
              Remove
            </button>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={profileData.firstName}
              onChange={handleProfileChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={profileData.lastName}
              onChange={handleProfileChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Work Information</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="position">Position</label>
            <input
              type="text"
              id="position"
              name="position"
              value={profileData.position}
              onChange={handleProfileChange}
              disabled
            />
            <small className="helper-text">Your role is assigned by administrators</small>
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={profileData.department}
              onChange={handleProfileChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="joinDate">Join Date</label>
          <input
            type="date"
            id="joinDate"
            name="joinDate"
            value={profileData.joinDate}
            onChange={handleProfileChange}
            disabled
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );

  // Render Password Section
  const renderPasswordSection = () => (
    <form className="settings-form" onSubmit={handleChangePassword}>
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="form-section">
        <h3 className="section-title">Change Password</h3>
        <p className="section-description">
          Use a strong password that includes letters, numbers, and symbols.
        </p>

        <div className="form-group">
          <label htmlFor="currentPassword">Current Password *</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
            placeholder="Enter your current password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password *</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
            placeholder="At least 6 characters"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
            placeholder="Re-enter your new password"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Password Requirements</h3>
        <ul className="requirements-list">
          <li className="requirement met">
            <i className="fas fa-check-circle"></i>
            Minimum 6 characters
          </li>
          <li className="requirement">
            <i className="fas fa-circle"></i>
            At least one uppercase letter
          </li>
          <li className="requirement">
            <i className="fas fa-circle"></i>
            At least one number
          </li>
          <li className="requirement">
            <i className="fas fa-circle"></i>
            At least one special character
          </li>
        </ul>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </form>
  );

  // ... rest of the component (NotificationsSection, PreferencesSection) remains the same

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="page-title">Settings</h1>
        {saveSuccess && (
          <div className="save-success">
            <i className="fas fa-check-circle"></i>
            Changes saved successfully!
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </button>
            
            <button
              className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <i className="fas fa-lock"></i>
              <span>Password</span>
            </button>
            
            <button
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <i className="fas fa-bell"></i>
              <span>Notifications</span>
            </button>
            
            <button
              className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <i className="fas fa-cog"></i>
              <span>Preferences</span>
            </button>
          </nav>

          <div className="account-info">
            <h4>Account Information</h4>
            <div className="info-item">
              <span className="info-label">Member since:</span>
              <span className="info-value">
                {profileData.joinDate ? new Date(profileData.joinDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Role:</span>
              <span className={`info-value ${getRoleBadgeClass(user?.role)}`}>
                {user?.role || 'User'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value status active">
                <i className="fas fa-circle"></i> Active
              </span>
            </div>
          </div>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && renderProfileSection()}
          {activeTab === 'password' && renderPasswordSection()}
      
        </div>
      </div>
    </div>
  );
};

export default Settings;