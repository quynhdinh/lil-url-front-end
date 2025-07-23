import { useState } from 'react';
import './App.css';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
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
      // TODO: Replace with actual API call to your backend
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock shortened URL for demonstration
      const mockShortUrl = `https://lil.url/${Math.random().toString(36).substring(2, 8)}`;
      setShortenedUrl(mockShortUrl);
    } catch (error) {
      alert('Error shortening URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortenedUrl);
    alert('URL copied to clipboard!');
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
                  className="auth-btn edit-profile-btn"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </button>
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
          <div className="user-dashboard">
            <div className="dashboard-header">
              <h2 className="dashboard-title">Welcome to your Dashboard, {currentUser?.name}!</h2>
              <p className="dashboard-subtitle">
                Manage your shortened URLs and account settings
              </p>
            </div>
            
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

export default App;
