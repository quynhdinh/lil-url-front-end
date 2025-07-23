import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import './App.css';

// Component to handle redirects for shortened URLs
function RedirectHandler() {
  const { code } = useParams();
  
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
        console.log('Redirecting with code:', code);
        console.log('Backend URL:', backendUrl);
        
        const response = await fetch(`${backendUrl}/api/urls/${code}`, {
          method: 'GET',
        }); 
        console.log(response)
        console.log('Response status:', response.status);

        if (response.ok) {
          console.log("received")
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
        alert('Error: Shortened URL not found or expired.');
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
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123'
  });
  
  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: 'john.doe@example.com',
    password: 'password123'
  });

  const handleShortenUrl = async () => {
    if (!longUrl.trim()) {
      alert('Please enter a URL to shorten');
      return;
    }

    setIsLoading(true);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
      console.log('Backend URL:', backendUrl);
      const response = await fetch(`${backendUrl}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: longUrl.trim(),
          // Include user ID if logged in
          ...(isLoggedIn && currentUser && { userId: currentUser.email })
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Assuming the backend returns { shortUrl: "https://lil.url/abc123" }
      setShortenedUrl(data.shortUrl || data.shortened_url || data.url);
      
      // Clear the input after successful shortening
      setLongUrl('');
      
    } catch (error) {
      console.error('Error shortening URL:', error);
      alert('Error shortening URL. Please check if the backend is running and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
    alert('URL copied to clipboard!');
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
          alert('URL not found');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error redirecting:', error);
      alert('Error: Shortened URL not found or expired.');
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    // TODO: Implement actual sign up logic
    console.log('Sign up:', signUpData);
    alert('Sign up functionality will be implemented with backend!');
    setShowSignUpModal(false);
    setSignUpData({ name: 'John Doe', email: 'john.doe@example.com', password: 'password123' });
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    // TODO: Implement actual sign in logic
    console.log('Sign in:', signInData);
    
    // Mock successful login
    setCurrentUser({
      name: signInData.email === 'john.doe@example.com' ? 'John Doe' : 'User',
      email: signInData.email
    });
    setIsLoggedIn(true);
    setShowSignInModal(false);
    setSignInData({ email: 'john.doe@example.com', password: 'password123' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowEditProfile(false);
    setActiveSection('dashboard');
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
      email: editProfileData.email
    });
    
    alert('Profile updated successfully!');
    setShowEditProfile(false);
  };

  const closeModals = () => {
    setShowSignUpModal(false);
    setShowSignInModal(false);
    setShowEditProfile(false);
    setSignUpData({ name: 'John Doe', email: 'john.doe@example.com', password: 'password123' });
    setSignInData({ email: 'john.doe@example.com', password: 'password123' });
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
                      <button 
                        onClick={() => {
                          // Extract the code from the shortened URL
                          const code = shortenedUrl.split('/').pop();
                          handleRedirect(code);
                        }} 
                        className="copy-btn"
                        style={{marginLeft: '8px'}}
                      >
                        Test Redirect
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="user-stats">
              <h3 className="section-title">Your Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">12</div>
                  <div className="stat-label">URLs Shortened</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">248</div>
                  <div className="stat-label">Total Clicks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">5</div>
                  <div className="stat-label">Active URLs</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'urls':
        return (
          <div className="urls-section">
            <h3 className="section-title">My URLs</h3>
            <div className="urls-list">
              <div className="url-item">
                <div className="url-info">
                  <div className="original-url">https://www.example.com/very-long-url-that-needs-shortening</div>
                  <div className="short-url">https://lil.url/abc123</div>
                  <div className="url-stats">Created: Jan 15, 2025 • Clicks: 45</div>
                </div>
                <div className="url-actions">
                  <button className="action-btn copy-btn">Copy</button>
                  <button className="action-btn edit-btn">Edit</button>
                  <button className="action-btn delete-btn">Delete</button>
                </div>
              </div>
              <div className="url-item">
                <div className="url-info">
                  <div className="original-url">https://github.com/user/repository</div>
                  <div className="short-url">https://lil.url/def456</div>
                  <div className="url-stats">Created: Jan 10, 2025 • Clicks: 23</div>
                </div>
                <div className="url-actions">
                  <button className="action-btn copy-btn">Copy</button>
                  <button className="action-btn edit-btn">Edit</button>
                  <button className="action-btn delete-btn">Delete</button>
                </div>
              </div>
            </div>
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
            <h1>lil url</h1>
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
              Transform your long URLs into short, shareable links with lil url
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
            This is a project developed as part of coursework at MIU University
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
                  placeholder="john.doe@example.com"
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
                  onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                  className="form-input"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signin-password">Password</label>
                <input
                  id="signin-password"
                  type="password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({...signInData, password: e.target.value})}
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
