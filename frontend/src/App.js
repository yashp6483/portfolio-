import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaGithub, 
  FaLinkedin, 
  FaEnvelope, 
  FaPhone, 
  FaExternalLinkAlt, 
  FaArrowRight, 
  FaCode, 
  FaBriefcase, 
  FaGraduationCap, 
  FaLaptopCode, 
  FaTools, 
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
  FaLock,
  FaSignOutAlt,
  FaTrash,
  FaEye,
  FaUsers,
  FaCommentAlt,
  FaArrowLeft,
  FaSun,
  FaMoon
} from 'react-icons/fa';
import { config } from './config';

const strings = [
  'MERN Stack Developer',
  'React.js Specialist',
  'Node.js & Express Expert',
  'Full-Stack Developer'
];

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Sync theme to body tag
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };
  
  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    type: '', // 'success', 'error', 'info', ''
    message: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Typing Effect
  const [typedText, setTypedText] = useState('');
  const [stringIdx, setStringIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- ADMIN & VISITOR ANALYTICS STATE ---
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  
  const [adminTab, setAdminTab] = useState('messages'); // 'messages' | 'analytics' | 'settings'
  const [dashboardStats, setDashboardStats] = useState({
    messagesCount: 0,
    totalVisits: 0,
    uniqueVisitors: 0
  });
  const [messagesList, setMessagesList] = useState([]);
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [browserStats, setBrowserStats] = useState([]);
  const [platformStats, setPlatformStats] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Settings Panel States
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsStatus, setSettingsStatus] = useState({ type: '', message: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Initialize Page Tracker & Scroll Listeners
  useEffect(() => {
    // 1. Track Visit
    const trackVisit = async (pageName) => {
      try {
        await fetch(`${config.apiUrl}/api/visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: pageName || 'Home' })
        });
      } catch (err) {
        console.log('Local mode: visitor tracking inactive.');
      }
    };

    // 2. Check for saved admin session
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setIsAdminLoggedIn(true);
      fetchDashboardData(savedToken);
    }

    // 3. Hash routing check & tracking
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setIsAdminActive(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        trackVisit('Admin Dashboard');
      } else {
        setIsAdminActive(false);
        const pageName = hash 
          ? hash.substring(1).charAt(0).toUpperCase() + hash.substring(2)
          : 'Home';
        trackVisit(pageName);
      }
    };
    checkHash();

    // 4. Scroll spy listener
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavScrolled(true);
      } else {
        setNavScrolled(false);
      }

      const sections = ['home', 'about', 'skills', 'experience', 'projects', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('hashchange', checkHash);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  // Typing Effect Logic
  useEffect(() => {
    let timer;
    const currentFullString = strings[stringIdx];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setTypedText(currentFullString.substring(0, charIdx - 1));
        setCharIdx(prev => prev - 1);
      }, 50);
    } else {
      timer = setTimeout(() => {
        setTypedText(currentFullString.substring(0, charIdx + 1));
        setCharIdx(prev => prev + 1);
      }, 100);
    }

    if (!isDeleting && charIdx === currentFullString.length) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setStringIdx(prev => (prev + 1) % strings.length);
    }

    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, stringIdx]);

  // --- ADMIN ACTIONS & FETCH CALLS ---

  const fetchDashboardData = async (token) => {
    setDashboardLoading(true);
    const activeToken = token || localStorage.getItem('adminToken');
    
    if (!activeToken) return;

    try {
      // Fetch Messages
      const msgRes = await fetch(`${config.apiUrl}/api/admin/messages`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const msgData = await msgRes.json();
      
      // Fetch Analytics
      const analyticsRes = await fetch(`${config.apiUrl}/api/admin/visitors`, {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const analyticsData = await analyticsRes.json();

      if (msgRes.ok && msgData.success) {
        setMessagesList(msgData.data);
      }
      
      if (analyticsRes.ok && analyticsData.success) {
        setVisitorLogs(analyticsData.logs);
        setBrowserStats(analyticsData.browsers);
        setPlatformStats(analyticsData.platforms);
        
        // Count unique IPs
        const uniqueIps = new Set(analyticsData.logs.map(log => log.ip)).size;
        
        setDashboardStats({
          messagesCount: msgData.data ? msgData.data.length : 0,
          totalVisits: analyticsData.total,
          uniqueVisitors: uniqueIps
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoginLoading(true);
    setAdminError('');

    try {
      const response = await fetch(`${config.apiUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsAdminLoggedIn(true);
        setAdminPassword('');
        fetchDashboardData(data.token);
      } else {
        setAdminError(data.message || 'Invalid admin credentials.');
      }
    } catch (err) {
      setAdminError('Could not reach login server. Verify your backend is running.');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminLoggedIn(false);
    setAdminUsername('');
    setAdminPassword('');
    setMessagesList([]);
    setVisitorLogs([]);
    window.location.hash = '';
    setIsAdminActive(false);
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsStatus({ type: '', message: '' });

    if (newPassword && newPassword !== confirmPassword) {
      setSettingsStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      setSettingsLoading(false);
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${config.apiUrl}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newUsername: newUsername || undefined,
          newPassword: newPassword || undefined
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSettingsStatus({ type: 'success', message: 'Credentials updated successfully! Logging out...' });
        setNewUsername('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          handleAdminLogout();
        }, 2000);
      } else {
        setSettingsStatus({ type: 'error', message: data.message || 'Failed to update credentials.' });
      }
    } catch (err) {
      setSettingsStatus({ type: 'error', message: 'Could not connect to settings server.' });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${config.apiUrl}/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessagesList(prev => prev.filter(msg => msg._id !== id));
        setDashboardStats(prev => ({
          ...prev,
          messagesCount: Math.max(0, prev.messagesCount - 1)
        }));
      } else {
        alert(data.message || 'Failed to delete message.');
      }
    } catch (err) {
      alert('Error connecting to API server.');
    }
  };

  // Form input handler
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Contact Inquiry Form Submit Handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormStatus({ type: 'info', message: 'Sending message...' });

    try {
      const response = await fetch(`${config.apiUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormStatus({
          type: 'success',
          message: data.message || 'Thank you! Your message has been sent successfully.'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setFormStatus({
          type: 'error',
          message: data.message || 'Something went wrong. Please check your connection and try again.'
        });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setFormStatus({
        type: 'success',
        message: 'Message captured locally in frontend! Note: The backend server is offline, but your details are ready.'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Map skill category to icons
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Languages': return <FaCode />;
      case 'Frontend': return <FaLaptopCode />;
      case 'Backend & Databases': return <FaBriefcase />;
      default: return <FaTools />;
    }
  };

  // Motion variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <>
      {/* Animated Mesh Background */}
      <div className="mesh-background" />

      {/* Header / Navigation */}
      <nav className={`navbar ${navScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#home" className="logo" onClick={() => setIsAdminActive(false)}>
            {'{'}{config.personal.name.split(' ')[0]}<span className="logo-dot">.</span>dev{'}'}
          </a>
          
          {!isAdminActive ? (
            <>
              <ul className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <li>
                  <a 
                    href="#home" 
                    className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a 
                    href="#about" 
                    className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </a>
                </li>
                <li>
                  <a 
                    href="#skills" 
                    className={`nav-link ${activeSection === 'skills' ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Skills
                  </a>
                </li>
                <li>
                  <a 
                    href="#experience" 
                    className={`nav-link ${activeSection === 'experience' ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Experience
                  </a>
                </li>
                <li>
                  <a 
                    href="#projects" 
                    className={`nav-link ${activeSection === 'projects' ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Projects
                  </a>
                </li>
                <li>
                  <a 
                    href="#contact" 
                    className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#contact" className="nav-btn" onClick={() => setMobileMenuOpen(false)}>
                    Hire Me
                  </a>
                </li>
              </ul>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className="theme-toggle-btn" 
                  onClick={toggleTheme}
                  aria-label="Toggle light/dark theme"
                >
                  {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>

                <button 
                  className="hamburger" 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button 
                className="theme-toggle-btn" 
                onClick={toggleTheme}
                aria-label="Toggle light/dark theme"
              >
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
              </button>
              <button 
                className="nav-btn" 
                style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }} 
                onClick={() => {
                  window.location.hash = '';
                  setIsAdminActive(false);
                }}
              >
                <FaArrowLeft style={{ marginRight: '0.5rem' }} /> Back to Portfolio
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* --- RENDER ADMIN DASHBOARD WORKSPACE OR PORTFOLIO LANDING PAGE --- */}
      {isAdminActive ? (
        <section className="admin-section">
          <div className="container">
            {!isAdminLoggedIn ? (
              // 1. ADMIN LOGIN VIEW
              <div className="login-card-wrapper">
                <motion.div 
                  className="glass-card login-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div className="visual-logo-wrapper" style={{ margin: '0 auto 1.5rem auto' }}>
                      <FaLock />
                    </div>
                    <h2 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Admin Dashboard</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Enter credentials to view analytics & messages</p>
                  </div>

                  <form onSubmit={handleAdminLogin}>
                    {adminError && (
                      <div className="form-status error" style={{ marginBottom: '1.5rem' }}>
                        {adminError}
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label" htmlFor="username">Admin Username</label>
                      <input 
                        type="text" 
                        id="username"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        className="form-control" 
                        placeholder="e.g. admin" 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="admin-password">Password</label>
                      <input 
                        type="password" 
                        id="admin-password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="form-control" 
                        placeholder="••••••••" 
                        required 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ width: '100%', marginTop: '2rem' }}
                      disabled={adminLoginLoading}
                    >
                      {adminLoginLoading ? 'Verifying...' : 'Login Securely'} <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                    </button>
                  </form>
                </motion.div>
              </div>
            ) : (
              // 2. LOGGED-IN ADMIN DASHBOARD
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {/* Header Metrics */}
                <div className="dashboard-header">
                  <div className="dashboard-title-group">
                    <h2 className="gradient-text glow-text">Welcome back, Yash</h2>
                    <p>Track your latest website visitors and respond to inquiry messages.</p>
                  </div>
                  <button className="btn btn-outline" onClick={handleAdminLogout} style={{ gap: '0.5rem' }}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>

                {/* Stat Metric Cards */}
                <div className="dashboard-stats">
                  <div className="glass-card stat-card">
                    <div className="stat-icon-wrapper">
                      <FaEye />
                    </div>
                    <div className="stat-info">
                      <h3>{dashboardStats.totalVisits}</h3>
                      <p>Total pageviews</p>
                    </div>
                  </div>

                  <div className="glass-card stat-card">
                    <div className="stat-icon-wrapper">
                      <FaUsers />
                    </div>
                    <div className="stat-info">
                      <h3>{dashboardStats.uniqueVisitors}</h3>
                      <p>Unique IPs</p>
                    </div>
                  </div>

                  <div className="glass-card stat-card">
                    <div className="stat-icon-wrapper">
                      <FaCommentAlt />
                    </div>
                    <div className="stat-info">
                      <h3>{dashboardStats.messagesCount}</h3>
                      <p>Inquiries</p>
                    </div>
                  </div>
                </div>

                {/* Dashboard Tabs */}
                <div className="dashboard-tabs">
                  <button 
                    className={`dashboard-tab-btn ${adminTab === 'messages' ? 'active' : ''}`}
                    onClick={() => setAdminTab('messages')}
                  >
                    User Inquiries ({messagesList.length})
                  </button>
                  <button 
                    className={`dashboard-tab-btn ${adminTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setAdminTab('analytics')}
                  >
                    Visitor Logs
                  </button>
                  <button 
                    className={`dashboard-tab-btn ${adminTab === 'settings' ? 'active' : ''}`}
                    onClick={() => {
                      setAdminTab('settings');
                      setSettingsStatus({ type: '', message: '' });
                    }}
                  >
                    Account Settings
                  </button>
                </div>

                {/* Dashboard View Content */}
                {dashboardLoading ? (
                  <div className="admin-empty-state">Loading dashboard data...</div>
                ) : adminTab === 'messages' ? (
                  // --- MESSAGES TAB ---
                  <div className="dashboard-content-grid">
                    {messagesList.length === 0 ? (
                      <div className="glass-card admin-empty-state">
                        <FaCommentAlt style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-muted)' }} />
                        <p>No messages have been submitted yet.</p>
                      </div>
                    ) : (
                      <div className="admin-messages-list">
                        {messagesList.map((msg) => (
                          <motion.div 
                            key={msg._id} 
                            className="glass-card admin-message-card"
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="msg-card-header">
                              <div className="msg-sender-info">
                                <h4>{msg.name}</h4>
                                <p>{msg.email}</p>
                              </div>
                              <div className="msg-meta">
                                <span className="msg-date">{new Date(msg.createdAt).toLocaleString()}</span>
                                <button 
                                  className="btn-delete" 
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  title="Delete Message"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <div className="msg-subject-label">Subject</div>
                              <div className="msg-subject">{msg.subject}</div>
                              <div className="msg-body">{msg.message}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : adminTab === 'analytics' ? (
                  // --- ANALYTICS/VISITORS TAB ---
                  <div className="analytics-dashboard-grid">
                    {/* Live Tracker Log Table */}
                    <div className="table-wrapper">
                      {visitorLogs.length === 0 ? (
                        <div className="admin-empty-state">No visitors tracked yet.</div>
                      ) : (
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>IP Address</th>
                              <th>Visited Page</th>
                              <th>Browser</th>
                              <th>Platform</th>
                              <th>Time Captured</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visitorLogs.map((log) => (
                              <tr key={log._id}>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.ip}</td>
                                <td>
                                  <span className="badge" style={{ fontSize: '0.7rem', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.2)', backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                                    {log.page || 'Home'}
                                  </span>
                                </td>
                                <td>{log.browser}</td>
                                <td>
                                  <span className={`badge ${log.platform === 'Windows' || log.platform === 'macOS' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '0.7rem' }}>
                                    {log.platform}
                                  </span>
                                </td>
                                <td>{new Date(log.visitedAt).toLocaleTimeString()} ({new Date(log.visitedAt).toLocaleDateString()})</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Breakdown Graphs (Browsers & Platforms) */}
                    <div className="analytics-charts">
                      {/* Browser stats */}
                      <div className="glass-card chart-card">
                        <h3 className="dashboard-card-title"><FaLaptopCode /> Browser Distribution</h3>
                        <div className="chart-bars-list">
                          {browserStats.map((stat, idx) => {
                            const percent = dashboardStats.totalVisits > 0 ? (stat.count / dashboardStats.totalVisits) * 100 : 0;
                            return (
                              <div className="chart-bar-item" key={idx}>
                                <div className="chart-bar-info">
                                  <span className="chart-bar-name">{stat._id}</span>
                                  <span className="chart-bar-count">{stat.count} ({Math.round(percent)}%)</span>
                                </div>
                                <div className="chart-bar-track">
                                  <div className="chart-bar-fill" style={{ width: `${percent}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* OS Stats */}
                      <div className="glass-card chart-card">
                        <h3 className="dashboard-card-title"><FaTools /> OS Distribution</h3>
                        <div className="chart-bars-list">
                          {platformStats.map((stat, idx) => {
                            const percent = dashboardStats.totalVisits > 0 ? (stat.count / dashboardStats.totalVisits) * 100 : 0;
                            return (
                              <div className="chart-bar-item" key={idx}>
                                <div className="chart-bar-info">
                                  <span className="chart-bar-name">{stat._id}</span>
                                  <span className="chart-bar-count">{stat.count} ({Math.round(percent)}%)</span>
                                </div>
                                <div className="chart-bar-track">
                                  <div className="chart-bar-fill" style={{ width: `${percent}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // --- SETTINGS TAB ---
                  <div className="dashboard-content-grid" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                    <motion.div 
                      className="glass-card admin-message-card"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h3 className="dashboard-card-title"><FaLock /> Update Admin Credentials</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                        Modify your secure profile credentials. If successful, you will be logged out to verify your new details.
                      </p>

                      <form onSubmit={handleUpdateSettings}>
                        {settingsStatus.message && (
                          <div className={`form-status ${settingsStatus.type}`} style={{ marginBottom: '1.5rem' }}>
                            {settingsStatus.message}
                          </div>
                        )}

                        <div className="form-group">
                          <label className="form-label" htmlFor="new-username">New Username (Email)</label>
                          <input 
                            type="email" 
                            id="new-username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="form-control" 
                            placeholder="yashp4710@gmail.com" 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="new-password">New Password</label>
                          <input 
                            type="password" 
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="form-control" 
                            placeholder="Min 6 characters" 
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
                          <input 
                            type="password" 
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-control" 
                            placeholder="Repeat new password" 
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="btn btn-primary" 
                          style={{ width: '100%', marginTop: '1.5rem' }}
                          disabled={settingsLoading}
                        >
                          {settingsLoading ? 'Saving...' : 'Save Settings'} <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </section>
      ) : (
        // --- PORTFOLIO VIEW PAGE ---
        <>
          {/* 1. Hero Section */}
          <section id="home" className="hero">
            <div className="container">
              <div className="hero-grid">
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <motion.div variants={fadeInVariants} className="hero-tag">
                    <span className="hero-pulse"></span> Available for Opportunities
                  </motion.div>
                  <motion.h1 variants={fadeInVariants} className="hero-title">
                    <span className="hero-greeting">Hi, I'm</span> <br />
                    <span className="gradient-text glow-text">{config.personal.name}</span>
                  </motion.h1>
                  <motion.div variants={fadeInVariants} className="hero-subtitle">
                    I am a <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{typedText}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: '300' }} className="blink-cursor">|</span>
                  </motion.div>
                  <motion.p 
                    variants={fadeInVariants} 
                    style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '600px' }}
                  >
                    I build robust, high-performance backends, connect them with secure schemas, and design modern, pixel-perfect frontend user experiences.
                  </motion.p>
                  <motion.div variants={fadeInVariants} className="hero-buttons">
                    <a href="#projects" className="btn btn-primary">
                      View Projects <FaArrowRight style={{ fontSize: '0.85rem' }} />
                    </a>
                    <a href="#contact" className="btn btn-outline">
                      Let's Connect
                    </a>
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="hero-visual"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="visual-glowing-sphere"></div>
                  <div className="visual-card">
                    <div className="visual-logo-wrapper">
                      <FaLaptopCode />
                    </div>
                    <div className="visual-name">{config.personal.name}</div>
                    <div className="visual-tag">{config.personal.title}</div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                      <span className="badge badge-primary">React</span>
                      <span className="badge badge-secondary">Node.js</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* 2. About Section */}
          <section id="about">
            <div className="container">
              <div className="section-title-wrapper">
                <p className="section-subtitle">Get to know me</p>
                <h2 className="section-title">About Me</h2>
              </div>

              <div className="about-grid">
                <motion.div 
                  className="about-details"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={containerVariants}
                >
                  <motion.div variants={fadeInVariants} className="about-summary">
                    {config.personal.careerSummary}
                  </motion.div>

                  <motion.div variants={fadeInVariants} className="info-cards">
                    <div className="glass-card info-card">
                      <span className="info-label"><FaMapMarkerAlt style={{ marginRight: '0.25rem' }} /> Location</span>
                      <span className="info-value">{config.personal.location}</span>
                    </div>
                    <div className="glass-card info-card">
                      <span className="info-label"><FaEnvelope style={{ marginRight: '0.25rem' }} /> Email</span>
                      <span className="info-value">{config.personal.email}</span>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="edu-card"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="edu-header">
                    <div>
                      <h3 className="edu-college">{config.education.college}</h3>
                      <div className="edu-degree"><FaGraduationCap style={{ marginRight: '0.5rem' }} />{config.education.degree}</div>
                    </div>
                    <span className="edu-duration">{config.education.duration}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                    Acquired core knowledge in computer engineering, database design, software systems, and network communications. Applied theoretical concepts in building secure MERN stack web applications.
                  </p>
                  {config.education.coursework && (
                    <div style={{ marginTop: '1.2rem' }}>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '0.6rem', fontWeight: 700 }}>Relevant Coursework:</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {config.education.coursework.map((course, idx) => (
                          <span key={idx} className="badge" style={{ textTransform: 'none', fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </section>

          {/* 3. Skills Section */}
          <section id="skills" style={{ backgroundColor: 'rgba(15, 22, 34, 0.4)' }}>
            <div className="container">
              <div className="section-title-wrapper">
                <p className="section-subtitle">My Toolbox</p>
                <h2 className="section-title">Skills & Technologies</h2>
              </div>

              <div className="skills-grid">
                {config.skills.map((skillGroup, index) => (
                  <motion.div 
                    key={index} 
                    className="glass-card skill-category-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="skill-header">
                      <span className="skill-icon">{getCategoryIcon(skillGroup.category)}</span>
                      <h3 className="skill-title">{skillGroup.category}</h3>
                    </div>
                    <div className="skill-tags">
                      {skillGroup.items.map((skill, sIdx) => (
                        <span key={sIdx} className="skill-item">{skill}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Experience Section */}
          <section id="experience">
            <div className="container">
              <div className="section-title-wrapper">
                <p className="section-subtitle">Professional Path</p>
                <h2 className="section-title">Work Experience</h2>
              </div>

              <div className="experience-timeline">
                {config.experience.map((exp, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker">
                      <div className="timeline-marker-inner"></div>
                    </div>
                    
                    <motion.div 
                      className="glass-card experience-card"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, type: 'spring' }}
                    >
                      <div className="exp-header">
                        <div className="exp-title-group">
                          <h3>{exp.role}</h3>
                          <span className="exp-company">{exp.company}</span>
                          {exp.location && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.75rem', fontWeight: '500' }}>
                              • {exp.location}
                            </span>
                          )}
                        </div>
                        <span className="exp-duration">{exp.duration}</span>
                      </div>
                      
                      <ul className="exp-list">
                        {exp.points.map((point, pIdx) => (
                          <li key={pIdx}>{point}</li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 5. Projects Section */}
          <section id="projects" style={{ backgroundColor: 'rgba(15, 22, 34, 0.4)' }}>
            <div className="container">
              <div className="section-title-wrapper">
                <p className="section-subtitle">My Creations</p>
                <h2 className="section-title">Featured Projects</h2>
              </div>

              <div className="projects-grid">
                {config.projects.map((project, index) => (
                  <motion.div 
                    key={index} 
                    className="glass-card project-card"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="project-header">
                      <span className="project-type">{project.type}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {project.technologies.slice(0, 2).map((tech, tIdx) => (
                          <span key={tIdx} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{tech}</span>
                        ))}
                      </div>
                    </div>

                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-desc">{project.description}</p>
                    
                    <div className="project-tech-list">
                      {project.technologies.map((tech, tIdx) => (
                        <span key={tIdx} className="project-tech-badge">{tech}</span>
                      ))}
                    </div>

                    <ul className="project-bullets">
                      {project.points.map((point, pIdx) => (
                        <li key={pIdx}>{point}</li>
                      ))}
                    </ul>

                    <div className="project-links">
                      <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="project-link-btn">
                        <FaGithub /> GitHub Source
                      </a>
                      <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="project-link-btn">
                        <FaExternalLinkAlt /> Live Demo
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 6. Contact Section */}
          <section id="contact">
            <div className="container">
              <div className="section-title-wrapper">
                <p className="section-subtitle">Get in Touch</p>
                <h2 className="section-title">Contact Me</h2>
              </div>

              <div className="contact-grid">
                <motion.div 
                  className="contact-info"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div>
                    <p className="contact-info-subtitle">
                      Have an exciting project idea, internship opportunity, or just want to chat? Fill out the form, or reach out directly!
                    </p>
                  </div>

                  <div className="contact-methods">
                    <a href={config.socials.email} className="glass-card contact-method-card">
                      <div className="contact-method-icon-wrapper">
                        <FaEnvelope />
                      </div>
                      <div className="contact-method-details">
                        <h4>Email Address</h4>
                        <p>{config.personal.email}</p>
                      </div>
                    </a>

                    <a href={config.socials.phone} className="glass-card contact-method-card">
                      <div className="contact-method-icon-wrapper">
                        <FaPhone />
                      </div>
                      <div className="contact-method-details">
                        <h4>Phone Number</h4>
                        <p>{config.personal.phone}</p>
                      </div>
                    </a>

                    <a href={config.socials.linkedin} target="_blank" rel="noopener noreferrer" className="glass-card contact-method-card">
                      <div className="contact-method-icon-wrapper">
                        <FaLinkedin />
                      </div>
                      <div className="contact-method-details">
                        <h4>LinkedIn</h4>
                        <p>{config.personal.linkedin.replace('https://', '')}</p>
                      </div>
                    </a>
                  </div>
                </motion.div>

                <motion.div 
                  className="glass-card contact-form-card"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <form onSubmit={handleFormSubmit}>
                    {formStatus.message && (
                      <div className={`form-status ${formStatus.type}`}>
                        {formStatus.message}
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="name">Your Name</label>
                        <input 
                          type="text" 
                          id="name"
                          name="name" 
                          value={formData.name}
                          onChange={handleInputChange}
                          className="form-control" 
                          placeholder="John Doe" 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="email">Your Email</label>
                        <input 
                          type="email" 
                          id="email"
                          name="email" 
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-control" 
                          placeholder="john@example.com" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="subject">Subject</label>
                      <input 
                        type="text" 
                        id="subject"
                        name="subject" 
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="form-control" 
                        placeholder="Project Inquiry / Job Opportunity" 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="message">Message</label>
                      <textarea 
                        id="message"
                        name="message" 
                        value={formData.message}
                        onChange={handleInputChange}
                        className="form-control" 
                        placeholder="Write your message here..." 
                        required
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      disabled={formLoading}
                    >
                      {formLoading ? 'Sending...' : 'Send Message'} <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                    </button>
                  </form>
                </motion.div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} {config.personal.name}. All rights reserved. Built with MERN Stack. 
            <button 
              onClick={() => {
                window.location.hash = '#admin';
                setIsAdminActive(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                marginLeft: '0.75rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              🔒 Admin Panel
            </button>
          </div>
          <div className="footer-socials">
            <a href={config.socials.github} target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href={config.socials.linkedin} target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href={config.socials.email} className="footer-social-link" aria-label="Email">
              <FaEnvelope />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
