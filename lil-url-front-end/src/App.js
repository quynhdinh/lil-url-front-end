import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import './App.css';

function RedirectHandler() {
  const { code } = useParams();
  
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
        console.log('Redirecting with code:', code);
        
        const response = await fetch(`${backendUrl}/api/urls/${code}`, {
          method: 'GET',
        }); 
        if (response.ok) {
          const data = await response.json();
          // Assuming backend returns { originalUrl: "https://google.com" }
          const originalUrl = data.originalUrl || data.url;
          if (originalUrl) {
            // Redirect to the original URL
            window.location.href = originalUrl;
          } else {
            alert('URL not found');
          }
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error redirecting:', error);
      }
    };

    if (code) {
      handleRedirect();
    }
  }, [code]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      fontSize: '18px' 
    }}>
      <div>
        <p>Redirecting...</p>
        <p>If you are not redirected automatically, the URL may be invalid or expired.</p>
      </div>
    </div>
  );
}

function MainApp() {
  const [longUrl, setLongUrl] = useState('https://www.nbcnews.com/news/obituaries/ozzy-osbourne-photos-young-black-sabbath-final-concert-before-death-rcna220337?utm_source=firefox-newtab-en-us');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [customShortCode, setCustomShortCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userUrls, setUserUrls] = useState([]);
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    name: 'John Doe',
    email: 'john.doe@miu.edu',
    password: 'password123'
  });
  
  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: 'john.doe@miu.edu',
    password: 'password123',
    id: 1
  });

  // Show notification function
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, show: true });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Hide notification function
  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  // Define fetchUserUrls function before useEffect hooks
  const fetchUserUrls = useCallback(async () => {
    if (!currentUser?.id) {
      console.log('No user ID available for fetching URLs');
      return;
    }

    setIsLoadingUrls(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
      const token = localStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${backendUrl}/api/users/${currentUser.id}/urls`, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched user URLs:', data);
      setUserUrls(data);
      
    } catch (error) {
      console.error('Error fetching user URLs:', error);
      // Don't show alert for this error, just log it
      setUserUrls([]); // Set empty array on error
    } finally {
      setIsLoadingUrls(false);
    }
  }, [currentUser?.id]);

  // Check for existing authentication token on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsLoggedIn(true);
        console.log('Restored user session from localStorage:', user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  // Fetch user URLs when user logs in
  useEffect(() => {
    if (isLoggedIn && currentUser?.id) {
      fetchUserUrls();
    }
  }, [isLoggedIn, currentUser?.id, fetchUserUrls]);

  // Fetch user URLs when switching to URLs section
  useEffect(() => {
    if (activeSection === 'urls' && isLoggedIn && currentUser?.id) {
      fetchUserUrls();
    }
  }, [activeSection, isLoggedIn, currentUser?.id, fetchUserUrls]);

  const handleShortenUrl = async () => {
    if (!longUrl.trim()) {
      showNotification('Please enter a URL to shorten', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: longUrl.trim(),
          // Include user ID if logged in
          ...(isLoggedIn && currentUser && { userId: currentUser.id }),
          // Include custom short code if provided and user is logged in
          ...(isLoggedIn && customShortCode.trim() && { customCode: customShortCode.trim() })
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log('Shortened URL response:', data);
      
      // Construct the shortened URL using the frontend host and the short code
      const frontendHost = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
      const constructedShortUrl = `${frontendHost}/${data.shortCode}`;
      // console.log('Constructed short URL:', constructedShortUrl);
      
      // Set the shortened URL to display
      setShortenedUrl(data.shortUrl || constructedShortUrl || data.url);
      
      // Clear the input after successful shortening
      setLongUrl('');
      setCustomShortCode(''); // Clear custom short code as well
      
      // Refresh user URLs if user is logged in
      if (isLoggedIn && currentUser?.id) {
        fetchUserUrls();
      }
      
    } catch (error) {
      console.error('Error shortening URL:', error);
      showNotification('Error shortening URL. Please check if the backend is running and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
    showNotification('URL copied to clipboard!', 'success');
  };

  const handleRedirect = async (code) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
      console.log('Redirecting with code:', code);
      
      const response = await fetch(`${backendUrl}/${code}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        // Assuming backend returns { originalUrl: "https://google.com" }
        const originalUrl = data.originalUrl || data.url;
        if (originalUrl) {
          // Redirect to the original URL
          window.location.href = originalUrl;
        } else {
          showNotification('URL not found', 'error');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error redirecting:', error);
      showNotification('Error: Shortened URL not found or expired.', 'error');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
      
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: signUpData.name,
          email: signUpData.email,
          password: signUpData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sign up successful:', data);
      
      // Show success message
      showNotification('Account created successfully! You can now sign in.', 'success');
      
      // Close modal and reset form
      setShowSignUpModal(false);
      setSignUpData({ name: 'John Doe', email: 'john.doe@miu.edu', password: 'password123' });
      
      // Optionally open sign in modal
      setShowSignInModal(true);
      
    } catch (error) {
      console.error('Error signing up:', error);
      showNotification(`Error creating account: ${error.message}`, 'error');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
      
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signInData.email,
          password: signInData.password
        }),
      });
      console.log("Response received:", response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sign in successful:', data);
      
      console.log(data);
      // Set user data from backend response
      const userData = {
        name: data.fullName || data.name || 'User',
        email: data.email || signInData.email,
        id: data.id || data._id || 1
      };
      
      setCurrentUser(userData);
      
      // Store token if provided (for future authenticated requests)
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      // Store user data in localStorage for session persistence
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setIsLoggedIn(true);
      setShowSignInModal(false);
      setSignInData({ email: data.email, password: data.password, id: data.id });

    } catch (error) {
      console.error('Error signing in:', error);
      showNotification(`Error signing in: ${error.message}`, 'error');
    }
  };

  const handleLogout = () => {
    // Clear stored authentication token and user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowEditProfile(false);
    setActiveSection('dashboard');
    setUserUrls([]); // Clear user URLs on logout
  };

  const handleEditProfile = () => {
    setEditProfileData({
      name: currentUser.name,
      email: currentUser.email,
      password: 'password123' // Mock current password
    });
    setShowEditProfile(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // TODO: Implement actual profile update logic
    console.log('Save profile:', editProfileData);
    
    // Update current user data
    setCurrentUser({
      name: editProfileData.name,
      email: editProfileData.email,
      id: currentUser.id
    });
    
    showNotification('Profile updated successfully!', 'success');
    setShowEditProfile(false);
  };

  const closeModals = () => {
    setShowSignUpModal(false);
    setShowSignInModal(false);
    setShowEditProfile(false);
    setSignUpData({ name: 'John Doe', email: 'john.doe@miu.edu', password: 'password123' });
    setSignInData({ email: 'john.doe@miu.edu', password: 'password123', id: 1 });
  };

  const renderDashboardContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <div className="url-shortener">
              <h3 className="section-title">Shorten a New URL</h3>
              <div className="input-container">
                <input
                  type="url"
                  placeholder="Enter your long URL here..."
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  className="url-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleShortenUrl()}
                />
                {isLoggedIn && (
                  <input
                    type="text"
                    placeholder="Custom short code (optional) - e.g., mylink123"
                    value={customShortCode}
                    onChange={(e) => {
                      // Allow only alphanumeric characters, hyphens, and underscores
                      const value = e.target.value.replace(/[^a-zA-Z0-9\-_]/g, '');
                      setCustomShortCode(value);
                    }}
                    className="url-input"
                    style={{ 
                      marginTop: '10px',
                      width: '60%',
                      maxWidth: '300px'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleShortenUrl()}
                    maxLength={50}
                  />
                )}
                <button 
                  onClick={handleShortenUrl}
                  disabled={isLoading}
                  className="shorten-btn"
                >
                  {isLoading ? 'Shortening...' : 'Shorten URL'}
                </button>
              </div>
              
              {shortenedUrl && (
                <div className="result-container">
                  <div className="shortened-url">
                    <span className="result-label">Your shortened URL:</span>
                    <div className="url-result">
                      <input
                        type="text"
                        value={shortenedUrl}
                        readOnly
                        className="result-input"
                      />
                      <button onClick={copyToClipboard} className="copy-btn">
                        Copy
                      </button>
                    </div>
                    {/* Clickable shortened URL */}
                    <div className="clickable-url-container" style={{marginTop: '10px'}}>
                      <span className="result-label">Click to test:</span>
                      <a 
                        href={shortenedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="clickable-short-url"
                        style={{
                          display: 'block',
                          padding: '10px',
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          color: '#007bff',
                          fontSize: '14px',
                          marginTop: '5px',
                          wordBreak: 'break-all'
                        }}
                      >
                        {shortenedUrl}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="user-stats">
              <h3 className="section-title">Your Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{userUrls.length}</div>
                  <div className="stat-label">URLs Shortened</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">-</div>
                  <div className="stat-label">Total Clicks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{userUrls.length}</div>
                  <div className="stat-label">Active URLs</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'urls':
        const formatDate = (timestamp) => {
          const date = new Date(timestamp);
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
        };

        const constructShortUrl = (shortCode) => {
          const frontendHost = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
          return `${frontendHost}/${shortCode}`;
        };

        const copyUrlToClipboard = (url) => {
          navigator.clipboard.writeText(url);
          showNotification('URL copied to clipboard!', 'success');
        };

        return (
          <div className="urls-section">
            <h3 className="section-title">My URLs</h3>
            {isLoadingUrls ? (
              <div className="loading-container" style={{ 
                textAlign: 'center', 
                padding: '40px 0',
                color: '#666'
              }}>
                <p>Loading your URLs...</p>
              </div>
            ) : userUrls.length === 0 ? (
              <div className="no-urls-container" style={{ 
                textAlign: 'center', 
                padding: '40px 0',
                color: '#666'
              }}>
                <p>You haven't created any URLs yet.</p>
                <p>Go to the Dashboard to shorten your first URL!</p>
              </div>
            ) : (
              <div className="urls-list">
                {userUrls.map((urlItem) => (
                  <div key={urlItem.id} className="url-item">
                    <div className="url-info">
                      <div className="original-url" title={urlItem.originalUrl}>
                        {urlItem.originalUrl}
                      </div>
                      <div className="short-url">
                        {constructShortUrl(urlItem.shortCode)}
                      </div>
                      <div className="url-stats">
                        Created: {formatDate(urlItem.createdAt)} • Short Code: {urlItem.shortCode}
                      </div>
                    </div>
                    <div className="url-actions">
                      <button 
                        className="action-btn copy-btn"
                        onClick={() => copyUrlToClipboard(constructShortUrl(urlItem.shortCode))}
                      >
                        Copy
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          showNotification('Edit functionality coming soon!', 'info');
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => {
                          // TODO: Implement delete functionality
                          if (window.confirm('Are you sure you want to delete this URL?')) {
                            showNotification('Delete functionality coming soon!', 'info');
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'analytics':
        return (
          <div className="analytics-section">
            <h3 className="section-title">Analytics</h3>
            <div className="analytics-content">
              <div className="analytics-card">
                <h4>Top Performing URLs</h4>
                <div className="analytics-list">
                  <div className="analytics-item">
                    <span>lil.url/abc123</span>
                    <span>45 clicks</span>
                  </div>
                  <div className="analytics-item">
                    <span>lil.url/def456</span>
                    <span>23 clicks</span>
                  </div>
                </div>
              </div>
              <div className="analytics-card">
                <h4>Recent Activity</h4>
                <div className="analytics-list">
                  <div className="analytics-item">
                    <span>New URL created</span>
                    <span>2 hours ago</span>
                  </div>
                  <div className="analytics-item">
                    <span>URL clicked 5 times</span>
                    <span>1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="settings-section">
            <h3 className="section-title">Account Settings</h3>
            <div className="settings-content">
              <div className="setting-item">
                <h4>Profile Information</h4>
                <p>Update your name, email, and password</p>
                <button className="settings-btn" onClick={handleEditProfile}>
                  Edit Profile
                </button>
              </div>
              <div className="setting-item">
                <h4>Notifications</h4>
                <p>Manage your email notifications</p>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                  Email notifications
                </label>
              </div>
              <div className="setting-item">
                <h4>Privacy</h4>
                <p>Control your data and privacy settings</p>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                  Public URL analytics
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      {/* Header with Sign Up/Sign In buttons */}
      <header className="App-nav">
        <div className="nav-container">
          <div className="logo">
            <h1>Baby URL</h1>
          </div>
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <span className="user-welcome">Welcome, {currentUser?.name}!</span>
                <button 
                  className="auth-btn logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  className="auth-btn sign-in-btn"
                  onClick={() => setShowSignInModal(true)}
                >
                  Sign In
                </button>
                <button 
                  className="auth-btn sign-up-btn"
                  onClick={() => setShowSignUpModal(true)}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content">
        {isLoggedIn ? (
          <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
              <div className="sidebar-content">
                <div className="user-profile">
                  <div className="user-avatar">
                    {currentUser?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h4>{currentUser?.name}</h4>
                    <p>{currentUser?.email}</p>
                  </div>
                </div>
                
                <nav className="sidebar-nav">
                  <button 
                    className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveSection('dashboard')}
                  >
                    <span className="nav-icon">📊</span>
                    Dashboard
                  </button>
                  <button 
                    className={`nav-item ${activeSection === 'urls' ? 'active' : ''}`}
                    onClick={() => setActiveSection('urls')}
                  >
                    <span className="nav-icon">🔗</span>
                    My URLs
                  </button>
                  <button 
                    className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveSection('analytics')}
                  >
                    <span className="nav-icon">📈</span>
                    Analytics
                  </button>
                  <button 
                    className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveSection('settings')}
                  >
                    <span className="nav-icon">⚙️</span>
                    Settings
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Dashboard Content */}
            <div className="dashboard-main">
              <div className="dashboard-header">
                <h2 className="dashboard-title">
                  {activeSection === 'dashboard' && `Welcome back, ${currentUser?.name}!`}
                  {activeSection === 'urls' && 'My URLs'}
                  {activeSection === 'analytics' && 'Analytics'}
                  {activeSection === 'settings' && 'Settings'}
                </h2>
                <p className="dashboard-subtitle">
                  {activeSection === 'dashboard' && 'Manage your shortened URLs and account settings'}
                  {activeSection === 'urls' && 'View and manage all your shortened URLs'}
                  {activeSection === 'analytics' && 'Track your URL performance and statistics'}
                  {activeSection === 'settings' && 'Manage your account preferences'}
                </p>
              </div>
              
              {renderDashboardContent()}
            </div>
          </div>
        ) : (
          <div className="hero-section">
            <h2 className="hero-title">Shorten Your URLs</h2>
            <p className="hero-subtitle">
              Transform your long URLs into short, shareable links with Baby URL.
            </p>
            
            <div className="url-shortener">
              <div className="input-container">
                <input
                  type="url"
                  placeholder="Enter your long URL here..."
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  className="url-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleShortenUrl()}
                />
                {isLoggedIn && (
                  <input
                    type="text"
                    placeholder="Custom short code (optional) - e.g., mylink123"
                    value={customShortCode}
                    onChange={(e) => {
                      // Allow only alphanumeric characters, hyphens, and underscores
                      const value = e.target.value.replace(/[^a-zA-Z0-9\-_]/g, '');
                      setCustomShortCode(value);
                    }}
                    className="url-input"
                    style={{ 
                      marginTop: '10px',
                      width: '60%',
                      maxWidth: '300px'
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleShortenUrl()}
                    maxLength={50}
                  />
                )}
                <button 
                  onClick={handleShortenUrl}
                  disabled={isLoading}
                  className="shorten-btn"
                >
                  {isLoading ? 'Shortening...' : 'Shorten URL'}
                </button>
              </div>
              
              {shortenedUrl && (
                <div className="result-container">
                  <div className="shortened-url">
                    <span className="result-label">Your shortened URL:</span>
                    <div className="url-result">
                      <input
                        type="text"
                        value={shortenedUrl}
                        readOnly
                        className="result-input"
                      />
                      <button onClick={copyToClipboard} className="copy-btn">
                        Copy
                      </button>
                    </div>
                    {/* Clickable shortened URL */}
                    <div className="clickable-url-container" style={{marginTop: '10px'}}>
                      <span className="result-label">Click to test:</span>
                      <a 
                        href={shortenedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="clickable-short-url"
                        style={{
                          display: 'block',
                          padding: '10px',
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          color: '#007bff',
                          fontSize: '14px',
                          marginTop: '5px',
                          wordBreak: 'break-all'
                        }}
                      >
                        {shortenedUrl}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="App-footer">
        <div className="footer-container">
          <p className="footer-text">
            This is a project developed as part of the Software Engineering course at Maharishi International University.
          </p>
        </div>
      </footer>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="close-btn" onClick={closeModals}>×</button>
            </div>
            <form onSubmit={handleSaveProfile} className="auth-form">
              <div className="form-group">
                <label htmlFor="edit-name">Name</label>
                <input
                  id="edit-name"
                  type="text"
                  value={editProfileData.name}
                  onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-email">Email</label>
                <input
                  id="edit-email"
                  type="email"
                  value={editProfileData.email}
                  onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-password">New Password (optional)</label>
                <input
                  id="edit-password"
                  type="password"
                  value={editProfileData.password}
                  onChange={(e) => setEditProfileData({...editProfileData, password: e.target.value})}
                  className="form-input"
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <button type="submit" className="form-submit-btn">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sign Up</h3>
              <button className="close-btn" onClick={closeModals}>×</button>
            </div>
            <form onSubmit={handleSignUp} className="auth-form">
              <div className="form-group">
                <label htmlFor="signup-name">Name</label>
                <input
                  id="signup-name"
                  type="text"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
                  className="form-input"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                  className="form-input"
                  placeholder="john.doe@miu.edu"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                  className="form-input"
                  placeholder="Create a strong password"
                  required
                />
              </div>
              <button type="submit" className="form-submit-btn">
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Sign In</h3>
              <button className="close-btn" onClick={closeModals}>×</button>
            </div>
            <form onSubmit={handleSignIn} className="auth-form">
              <div className="form-group">
                <label htmlFor="signin-email">Email</label>
                <input
                  id="signin-email"
                  type="email"
                  value={signInData.email}
                  onChange={(e) => setSignInData({...signInData, email: e.target.value, id: 1})}
                  className="form-input"
                  placeholder="john.doe@miu.edu"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signin-password">Password</label>
                <input
                  id="signin-password"
                  type="password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({...signInData, password: e.target.value, id: 1})}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="form-submit-btn">
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notification Component */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={hideNotification}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/:code" element={<RedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
