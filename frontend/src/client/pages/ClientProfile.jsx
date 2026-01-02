import React, { useState, useEffect } from 'react';
import { useAuth } from '../../admin/context/AuthContext';
import { userAPI } from '../../services/api';
import styles from './ClientProfile.module.css';

const ClientProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    avatar: null,
    driverLicense: '',
    licenseExpiry: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newsletter: true,
    marketingEmails: false
  });

  useEffect(() => {
    if (user?.id) loadProfileData();
  }, [user?.id]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getProfile();
      const userData = response.data || response;
      
      // Parse name
      const nameParts = (userData.name || user?.name || 'User').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setProfileData({
        firstName,
        lastName,
        email: userData.email || user?.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        country: userData.country || '',
        postalCode: userData.postalCode || '',
        avatar: userData.avatar || null,
        driverLicense: userData.driverLicense || '',
        licenseExpiry: userData.licenseExpiry || ''
      });

      // Load preferences if available
      if (userData.preferences) {
        setPreferences(prev => ({
          ...prev,
          ...userData.preferences
        }));
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      // Set default from auth user
      const nameParts = (user?.name || 'User').split(' ');
      setProfileData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        avatar: null,
        driverLicense: '',
        licenseExpiry: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handlePreferenceChange = (name) => {
    setPreferences(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
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
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      const updateData = {
        name: fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        country: profileData.country,
        postalCode: profileData.postalCode,
        avatar: profileData.avatar,
        driverLicense: profileData.driverLicense,
        licenseExpiry: profileData.licenseExpiry
      };

      await userAPI.updateProfile(updateData);
      
      // Update auth context
      updateUser({
        ...user,
        name: fullName,
        email: profileData.email
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to update profile';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSaveSuccess(false);

    // Validation
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    // Password strength check
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongRegex.test(passwordData.newPassword)) {
      setError('Password must contain uppercase, lowercase, number, and special character');
      setIsLoading(false);
      return;
    }

    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSaveSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to change password';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsLoading(true);
      await userAPI.updatePreferences(preferences);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    const first = profileData.firstName?.charAt(0) || '';
    const last = profileData.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const getMemberSince = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
    return 'Recently';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.clientProfile}>
      {/* HEADER */}
      <div className={styles.profileHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>My Profile</h1>
          <p className={styles.pageSubtitle}>Manage your account settings and preferences</p>
        </div>
        
        {saveSuccess && (
          <div className={styles.saveSuccess}>
            <i className="fas fa-check-circle"></i>
            <span>Changes saved successfully!</span>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className={styles.profileContainer}>
        {/* SIDEBAR */}
        <div className={styles.profileSidebar}>
          <div className={styles.userCard}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrapper}>
                {profileData.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt="Profile" 
                    className={styles.avatarImage}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {getInitials()}
                  </div>
                )}
                <label className={styles.avatarUpload}>
                  <i className="fas fa-camera"></i>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div className={styles.userInfo}>
                <h3>{profileData.firstName} {profileData.lastName}</h3>
                <p className={styles.userEmail}>{profileData.email}</p>
                <span className={styles.userBadge}>
                  <i className="fas fa-crown"></i> Premium Member
                </span>
              </div>
            </div>
          </div>

          <nav className={styles.profileNav}>
            <button
              className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <div className={styles.navIcon}>
                <i className="fas fa-user-circle"></i>
              </div>
              <div className={styles.navContent}>
                <span className={styles.navTitle}>Profile Information</span>
                <span className={styles.navDesc}>Personal details & contact</span>
              </div>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'password' ? styles.active : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <div className={styles.navIcon}>
                <i className="fas fa-lock"></i>
              </div>
              <div className={styles.navContent}>
                <span className={styles.navTitle}>Security</span>
                <span className={styles.navDesc}>Password & security settings</span>
              </div>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'preferences' ? styles.active : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <div className={styles.navIcon}>
                <i className="fas fa-sliders-h"></i>
              </div>
              <div className={styles.navContent}>
                <span className={styles.navTitle}>Preferences</span>
                <span className={styles.navDesc}>Notifications & settings</span>
              </div>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === 'licenses' ? styles.active : ''}`}
              onClick={() => setActiveTab('licenses')}
            >
              <div className={styles.navIcon}>
                <i className="fas fa-id-card"></i>
              </div>
              <div className={styles.navContent}>
                <span className={styles.navTitle}>Driver's License</span>
                <span className={styles.navDesc}>License information</span>
              </div>
            </button>
          </nav>

          <div className={styles.accountStats}>
            <div className={styles.statItem}>
              <i className="fas fa-calendar-alt"></i>
              <div>
                <span className={styles.statLabel}>Member Since</span>
                <span className={styles.statValue}>{getMemberSince()}</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <i className="fas fa-shield-alt"></i>
              <div>
                <span className={styles.statLabel}>Account Status</span>
                <span className={styles.statValue}>
                  <span className={styles.statusBadge}>Active</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className={styles.profileContent}>
          {error && (
            <div className={styles.errorAlert}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
              <button onClick={() => setError('')} className={styles.alertClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className={styles.profileForm}>
              <div className={styles.sectionHeader}>
                <h2><i className="fas fa-user"></i> Personal Information</h2>
                <p>Update your personal details and contact information</p>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-user"></i> First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className={styles.formInput}
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-user"></i> Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className={styles.formInput}
                    placeholder="Enter your last name"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-envelope"></i> Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className={styles.formInput}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-phone"></i> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className={styles.formInput}
                    placeholder="+1 (123) 456-7890"
                  />
                </div>
              </div>

              <div className={styles.sectionHeader}>
                <h2><i className="fas fa-home"></i> Address Information</h2>
                <p>Your primary address for billing and deliveries</p>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-map-marker-alt"></i> Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    className={styles.formInput}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-city"></i> City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleProfileChange}
                    className={styles.formInput}
                    placeholder="New York"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-flag"></i> Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={profileData.country}
                    onChange={handleProfileChange}
                    className={styles.formInput}
                    placeholder="United States"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-mail-bulk"></i> Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={profileData.postalCode}
                    onChange={handleProfileChange}
                    className={styles.formInput}
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.primaryButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PASSWORD TAB */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className={styles.profileForm}>
              <div className={styles.sectionHeader}>
                <h2><i className="fas fa-lock"></i> Change Password</h2>
                <p>Update your password to keep your account secure</p>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-key"></i> Current Password *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={styles.formInput}
                    placeholder="Enter your current password"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-key"></i> New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={styles.formInput}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-key"></i> Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={styles.formInput}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              <div className={styles.passwordRequirements}>
                <h4><i className="fas fa-shield-alt"></i> Password Requirements</h4>
                <ul className={styles.requirementsList}>
                  <li className={passwordData.newPassword.length >= 8 ? styles.requirementMet : ''}>
                    <i className="fas fa-check-circle"></i> At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(passwordData.newPassword) ? styles.requirementMet : ''}>
                    <i className="fas fa-check-circle"></i> One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(passwordData.newPassword) ? styles.requirementMet : ''}>
                    <i className="fas fa-check-circle"></i> One lowercase letter
                  </li>
                  <li className={/\d/.test(passwordData.newPassword) ? styles.requirementMet : ''}>
                    <i className="fas fa-check-circle"></i> One number
                  </li>
                  <li className={/[@$!%*?&]/.test(passwordData.newPassword) ? styles.requirementMet : ''}>
                    <i className="fas fa-check-circle"></i> One special character
                  </li>
                </ul>
              </div>

              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.primaryButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key"></i> Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <div className={styles.preferencesForm}>
              <div className={styles.sectionHeader}>
                <h2><i className="fas fa-sliders-h"></i> Notification Preferences</h2>
                <p>Choose how you want to receive updates and notifications</p>
              </div>

              <div className={styles.preferencesGrid}>
                <div className={styles.preferenceCard}>
                  <div className={styles.preferenceInfo}>
                    <div className={styles.preferenceIcon}>
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div>
                      <h4>Email Notifications</h4>
                      <p>Receive booking confirmations, reminders, and updates via email</p>
                    </div>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={() => handlePreferenceChange('emailNotifications')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.preferenceCard}>
                  <div className={styles.preferenceInfo}>
                    <div className={styles.preferenceIcon}>
                      <i className="fas fa-sms"></i>
                    </div>
                    <div>
                      <h4>SMS Notifications</h4>
                      <p>Get text alerts for urgent updates and booking reminders</p>
                    </div>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications}
                      onChange={() => handlePreferenceChange('smsNotifications')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.preferenceCard}>
                  <div className={styles.preferenceInfo}>
                    <div className={styles.preferenceIcon}>
                      <i className="fas fa-newspaper"></i>
                    </div>
                    <div>
                      <h4>Newsletter</h4>
                      <p>Receive our monthly newsletter with special offers and tips</p>
                    </div>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={preferences.newsletter}
                      onChange={() => handlePreferenceChange('newsletter')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.preferenceCard}>
                  <div className={styles.preferenceInfo}>
                    <div className={styles.preferenceIcon}>
                      <i className="fas fa-bullhorn"></i>
                    </div>
                    <div>
                      <h4>Marketing Emails</h4>
                      <p>Get notified about special promotions and new features</p>
                    </div>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={preferences.marketingEmails}
                      onChange={() => handlePreferenceChange('marketingEmails')}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.formActions}>
                <button 
                  onClick={handleSavePreferences}
                  className={styles.primaryButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* DRIVER'S LICENSE TAB */}
          {activeTab === 'licenses' && (
            <form className={styles.profileForm}>
              <div className={styles.sectionHeader}>
                <h2><i className="fas fa-id-card"></i> Driver's License Information</h2>
                <p>Keep your license information up-to-date for faster booking</p>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-id-card"></i> License Number
                  </label>
                  <input
                    type="text"
                    name="driverLicense"
                    value={profileData.driverLicense}
                    onChange={handleProfileChange}
                    className={styles.formInput}
                    placeholder="Enter your driver's license number"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <i className="fas fa-calendar-alt"></i> Expiry Date
                  </label>
                  <input
                    type="date"
                    name="licenseExpiry"
                    value={profileData.licenseExpiry}
                    onChange={handleProfileChange}
                    className={styles.formInput}
                  />
                  {profileData.licenseExpiry && (
                    <span className={styles.dateHint}>
                      Expires on: {formatDate(profileData.licenseExpiry)}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.licenseNote}>
                <i className="fas fa-info-circle"></i>
                <p>Your driver's license information is stored securely and only used for booking verification.</p>
              </div>

              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.primaryButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save License Info
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;