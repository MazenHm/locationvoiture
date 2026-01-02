import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [notification, setNotification] = useState({
    show: false,
    type: '', // 'success' or 'error'
    message: ''
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, error: authError, clearError } = useAuth();
  
  const from = location.state?.from?.pathname || '/dashboard';

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, []);

  // Show notification
  const showNotification = (type, message) => {
    setNotification({
      show: true,
      type,
      message
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Hide notification
  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  // Show auth error from context
  useEffect(() => {
    if (authError) {
      showNotification('error', authError);
    }
  }, [authError]);

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear notifications when user starts typing
    hideNotification();
    clearError?.();
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear notifications when user starts typing
    hideNotification();
    clearError?.();
  };

  const validateLoginForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};
    
    if (!registerData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!registerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleLoginSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateLoginForm()) return;
  
  setIsLoading(true);
  hideNotification();
  clearError?.();
  
  if (formData.rememberMe) {
    localStorage.setItem('rememberedEmail', formData.email);
  } else {
    localStorage.removeItem('rememberedEmail');
  }
  
  const result = await login(formData.email, formData.password);
  
  if (result.success) {
    showNotification('success', 'Login successful! Redirecting...');
    
    // Get user from auth context or localStorage
    const storedUser = localStorage.getItem('user');
    let redirectPath = '/client/dashboard'; // Default for clients
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === 'admin') {
          redirectPath = '/admin/dashboard';
        }
        // For 'client' role or undefined, use client path
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    
    setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 1500);
  } else {
    showNotification('error', result.error || 'Login failed. Please try again.');
  }
  
  setIsLoading(false);
};

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;
    
    setIsLoading(true);
    hideNotification();
    clearError?.();
    
    try {
      // Register the user
  const registerResult = await register({
  name: registerData.name,
  email: registerData.email,
  password: registerData.password,
  role: 'client'
});
      
      if (registerResult.success) {
        // Clear registration form
        setRegisterData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
        showNotification('success', 'Account created successfully! Logging you in...');
        
        // Auto-login after successful registration
        const loginResult = await login(registerData.email, registerData.password);
        
        if (loginResult.success) {
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        } else {
          // If auto-login fails, show message and switch to login
          showNotification('info', 'Registration successful! Please sign in with your new account.');
          setIsRegisterMode(false);
          // Pre-fill the login form
          setFormData(prev => ({
            ...prev,
            email: registerData.email,
            password: ''
          }));
        }
      } else {
        showNotification('error', registerResult.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      showNotification('error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="login-page">
      {/* Chic Notification */}
      {notification.show && (
        <div className={`notification-toast notification-${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
              {notification.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
              {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
            </div>
            <div className="notification-message">
              <h4>{notification.type === 'success' ? 'Success!' : 
                   notification.type === 'error' ? 'Error!' : 'Info!'}</h4>
              <p>{notification.message}</p>
            </div>
            <button className="notification-close" onClick={hideNotification}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="notification-progress"></div>
        </div>
      )}

      <div className="login-container">
        {/* Mobile Header */}
        <div className="mobile-header">
          <div className="mobile-logo">
            <div className="logo-icon">
              <i className="fas fa-car"></i>
            </div>
            <h1>PolyDrive</h1>
          </div>
          <div className="mobile-welcome">
            <h2>{!isRegisterMode ? 'Welcome Back' : 'Join PolyDrive'}</h2>
            <p>{!isRegisterMode 
              ? 'Sign in to manage your vehicle rentals' 
              : 'Create your account to get started'}</p>
          </div>
        </div>

        {/* Auth Tabs */}
        <div className="mobile-tabs">
          <button
            className={`mobile-tab ${!isRegisterMode ? 'active' : ''}`}
            onClick={() => {
              setIsRegisterMode(false);
              hideNotification();
              clearError?.();
            }}
            disabled={isLoading}
          >
            <i className="fas fa-sign-in-alt"></i>
            <span>Sign In</span>
          </button>
          <button
            className={`mobile-tab ${isRegisterMode ? 'active' : ''}`}
            onClick={() => {
              setIsRegisterMode(true);
              hideNotification();
              clearError?.();
            }}
            disabled={isLoading}
          >
            <i className="fas fa-user-plus"></i>
            <span>Sign Up</span>
          </button>
        </div>

        {/* Login Form */}
        {!isRegisterMode ? (
          <form className="mobile-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <div className="input-with-icon">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleLoginChange}
                  placeholder="Email address"
                  className={errors.email ? 'error' : ''}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <div className="input-with-icon">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleLoginChange}
                  placeholder="Password"
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                />
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className="form-options">
              <label className="mobile-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleLoginChange}
                  disabled={isLoading}
                />
                <div className="checkbox-custom"></div>
                <span>Remember me</span>
              </label>
              <button type="button" className="forgot-password" disabled={isLoading}>
                Forgot password?
              </button>
            </div>
            
            <button 
              type="submit" 
              className="mobile-btn primary" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Sign In
                </>
              )}
            </button>

          </form>
        ) : (
          // Register Form
          <form className="mobile-form" onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <div className="input-with-icon">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  placeholder="Full name"
                  className={errors.name ? 'error' : ''}
                  disabled={isLoading}
                />
              </div>
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <div className="input-with-icon">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="Email address"
                  className={errors.email ? 'error' : ''}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <div className="input-with-icon">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Create password"
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                />
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
              <div className="password-hint">
                Must be at least 6 characters
              </div>
            </div>

            <div className="form-group">
              <div className="input-with-icon">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Confirm password"
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
            
            
            <button 
              type="submit" 
              className="mobile-btn primary" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i> Create Account
                </>
              )}
            </button>

            <div className="registration-note">
              <i className="fas fa-info-circle"></i>
              <p>Creating a client account. Admin accounts must be created by system administrators.</p>
            </div>
          </form>
        )}

        {/* Switch Mode */}
        <div className="switch-mode">
          <p>
            {!isRegisterMode 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <button 
              type="button" 
              className="switch-btn"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                hideNotification();
                clearError?.();
              }}
              disabled={isLoading}
            >
              {!isRegisterMode ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;