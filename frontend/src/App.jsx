
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5191'
  : 'https://mmsu-knowledgehub-backend.onrender.com';

import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mmsu_theme') || 'light';
  });
  
  // Settings Modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState('profile');
  
  // Mobile Nav State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Password Visibility States
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  
  // Auth & Session States
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mmsu_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Login input states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register input states
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // Feedback states
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Info Carousel states (Left panel of Login page)
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselSlides = [
    {
      title: "MMSU Knowledge Hub",
      text: "The MMSU Knowledge Hub is a centralized digital repository that consolidates academic resources, college directories, program guidelines, and student clearances from the College of Computing and Information Sciences (CCIS) and other university campuses."
    },
    {
      title: "Intelligent Advising",
      text: "It provides a single access point for academic pathfinding, vector-based handbook policy searches, and multi-campus operation logs that support irregular student guidance and administrative scheduling."
    },
    {
      title: "Graph Recalculations & RAG",
      text: "Through this platform, users can easily explore curriculum dependencies via Directed Acyclic Graphs, query handbook rules semantically, and synchronize academic records across campus nodes."
    }
  ];

  // About Modal state
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // User Management (CRUD) States
  const [usersList, setUsersList] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [crudForm, setCrudForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    studentId: '',
    college: 'CCIS'
  });
  const [crudError, setCrudError] = useState('');
  const [crudSuccess, setCrudSuccess] = useState('');

  // SMTP Settings States
  const [smtpConfig, setSmtpConfig] = useState({
    provider: 'Outlook / Office 365',
    senderName: 'MMSU Knowledge Hub',
    senderEmail: 'hub@mmsu.edu.ph',
    host: 'smtp.office365.com',
    port: 587,
    username: 'mickogabriel75@gmail.com',
    password: ''
  });
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Active Main Tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Philippine Standard Time Clock State
  const [pst, setPst] = useState(new Date());

  // RAG Chatbot States
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your MMSU Student Handbook advising assistant. Ask me anything about university regulations, grades, shifting, or Latin honors!' }
  ]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [activeHandbookHighlight, setActiveHandbookHighlight] = useState(null);

  // Curriculum Pathfinder States
  const [courses, setCourses] = useState([]);
  const [failedCourses, setFailedCourses] = useState([]);
  const [recalculatedPlan, setRecalculatedPlan] = useState(null);
  const [currentYear, setCurrentYear] = useState(1);
  const [currentSemester, setCurrentSemester] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync Engine & Conflict Simulator States
  const [campusSyncLogs, setCampusSyncLogs] = useState({
    Batac: ['[System] Node Batac initialized.', '[DB] Local database active.'],
    Laoag: ['[System] Node Laoag initialized.', '[DB] Local database active.'],
    Currimao: ['[System] Node Currimao initialized.', '[DB] Local database active.']
  });
  
  const [unifiedDatabase, setUnifiedDatabase] = useState([
    { id: 1, type: 'Event', content: 'University-wide Enrollment Period Begins', timestamp: 1718000000000 },
    { id: 2, type: 'Room', content: 'Batac CCIS Lab 1 reserved for CS 321 (Software Engineering)', timestamp: 1718100000000 },
    { id: 3, type: 'Event', content: 'Laoag CTE Campus General Assembly & Orientation', timestamp: 1718050000000 },
    { id: 4, type: 'Room', content: 'Currimao CASAT Fisheries Lab Maintenance', timestamp: 1718200000000 }
  ]);

  // Conflict Simulator States
  const [conflictRecordId, setConflictRecordId] = useState(2);
  const [batacContent, setBatacContent] = useState('Batac CCIS Lab 1 reserved for AI Research Lab');
  const [laoagContent, setLaoagContent] = useState('Batac CCIS Lab 1 assigned for Faculty Meeting');
  const [batacTimeOffset, setBatacTimeOffset] = useState(10);
  const [laoagTimeOffset, setLaoagTimeOffset] = useState(20);

  // Hit Counters for Categories & Quick Links (Simulates live database hits)
  const [categoryHits, setCategoryHits] = useState({
    shifting: 128,
    mrr: 96,
    honors: 245,
    clearance: 77
  });

  const [linkHits, setLinkHits] = useState({
    portal: 63,
    mvle: 58,
    library: 137,
    tracking: 42,
    mcat: 48,
    alumni: 32
  });

  // Reference to Handbook bot section for scrolling
  const handbookBotRef = useRef(null);

  const SUGGESTED_QUESTIONS = [
    "What GWA is needed for Latin honors?",
    "What are the rules for shifting between colleges?",
    "What is the maximum residency rule (MRR) for BSCS?",
    "What is the fine for overdue library books?",
    "Can a student overload units in their graduating semester?"
  ];

  // Carousel auto-next effect
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  // Live Philippine Standard Time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setPst(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Set initial theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Fetch initial curriculum graph
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/curriculum`)
      .then(res => res.json())
      .then(data => {
        if (data.courses) {
          const sorted = [...data.courses].sort((a, b) => {
            if (a.defaultYear !== b.defaultYear) return a.defaultYear - b.defaultYear;
            return a.defaultSemester - b.defaultSemester;
          });
          setCourses(sorted);
        }
      })
      .catch(err => console.error('Error fetching curriculum:', err));
  }, []);

  // Recalculate pathfinder plan
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/recalculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        failedCourses,
        currentYear,
        currentSemester
      })
    })
      .then(res => res.json())
      .then(data => {
        setRecalculatedPlan(data);
      })
      .catch(err => console.error('Error recalculating plan:', err));
  }, [failedCourses, currentYear, currentSemester]);

  // Fetch User database & SMTP settings if user is Admin/Super Admin
  useEffect(() => {
    if (user && (user.role === 'Super Admin' || user.role === 'Admin')) {
      fetchUsersList();
      fetchSMTPSettings();
    }
  }, [user]);

  // Auto-fill SMTP host & port based on selected provider (matching DOST)
  useEffect(() => {
    if (smtpConfig.provider === 'Gmail') {
      setSmtpConfig(prev => ({ ...prev, host: 'smtp.gmail.com', port: 587 }));
    } else if (smtpConfig.provider === 'Outlook / Office 365' || smtpConfig.provider === 'Outlook') {
      setSmtpConfig(prev => ({ ...prev, host: 'smtp.office365.com', port: 587 }));
    }
  }, [smtpConfig.provider]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('mmsu_theme', next);
      return next;
    });
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('mmsu_theme', newTheme);
  };

  // ----------------------------------------------------
  // AUTHENTICATION LOGIC
  // ----------------------------------------------------
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginIdentifier,
        password: loginPassword
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || 'Login failed') });
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem('mmsu_user', JSON.stringify(data.user));
        setUser(data.user);
        setAuthSuccess('Welcome back!');
        // Default tabs based on roles
        if (data.user.role === 'Student') {
          setActiveTab('dashboard');
        } else {
          setActiveTab('dashboard');
        }
      })
      .catch(err => {
        setAuthError(err.message);
      });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: regStudentId,
        email: regEmail,
        password: regPassword
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || 'Registration failed') });
        }
        return res.json();
      })
      .then(data => {
        setAuthSuccess('Account created successfully! You can now log in.');
        setAuthMode('login');
        setLoginIdentifier(regEmail);
        // Reset fields
        setRegStudentId('');
        setRegEmail('');
        setRegPassword('');
      })
      .catch(err => {
        setAuthError(err.message);
      });
  };

  const handleLogOut = () => {
    localStorage.removeItem('mmsu_user');
    setUser(null);
    setLoginPassword('');
    setAuthSuccess('');
    setAuthError('');
  };

  // ----------------------------------------------------
  // ADMIN USER CRUD SERVICES
  // ----------------------------------------------------
  const fetchUsersList = () => {
    fetch(`${API_BASE_URL}/api/users`)
      .then(res => res.json())
      .then(data => {
        setUsersList(data.users || []);
      })
      .catch(err => console.error('Error fetching users:', err));
  };

  const handleLoginIdentifierChange = (e) => {
    let val = e.target.value;
    if (val.length > 0 && /^\d/.test(val)) {
      const digits = val.replace(/\D/g, '');
      if (digits.length <= 2) {
        val = digits;
      } else {
        val = digits.slice(0, 2) + '-' + digits.slice(2, 8);
      }
    }
    setLoginIdentifier(val);
  };

  const handleRegStudentIdChange = (e) => {
    let val = e.target.value;
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 2) {
      val = digits;
    } else {
      val = digits.slice(0, 2) + '-' + digits.slice(2, 8);
    }
    setRegStudentId(val);
  };

  const handleCrudFormChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'studentId') {
      const digits = val.replace(/\D/g, '');
      if (digits.length <= 2) {
        val = digits;
      } else {
        val = digits.slice(0, 2) + '-' + digits.slice(2, 8);
      }
    }
    setCrudForm(prev => ({ ...prev, [name]: val }));
  };

  const handleCreateOrUpdateUser = (e) => {
    e.preventDefault();
    setCrudError('');
    setCrudSuccess('');

    if (editingUserId) {
      // Update User
      fetch(`${API_BASE_URL}/api/users/${editingUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crudForm)
      })
        .then(res => {
          if (!res.ok) return res.json().then(err => { throw new Error(err.error) });
          return res.json();
        })
        .then(() => {
          setCrudSuccess('User updated successfully.');
          setEditingUserId(null);
          setCrudForm({ name: '', email: '', password: '', role: 'Student', studentId: '', college: 'CCIS' });
          fetchUsersList();
        })
        .catch(err => setCrudError(err.message));
    } else {
      // Create User
      fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crudForm)
      })
        .then(res => {
          if (!res.ok) return res.json().then(err => { throw new Error(err.error) });
          return res.json();
        })
        .then(() => {
          setCrudSuccess('User added successfully.');
          setCrudForm({ name: '', email: '', password: '', role: 'Student', studentId: '', college: 'CCIS' });
          fetchUsersList();
        })
        .catch(err => setCrudError(err.message));
    }
  };

  const handleEditUserClick = (targetUser) => {
    setEditingUserId(targetUser.id);
    setCrudForm({
      name: targetUser.name,
      email: targetUser.email,
      password: targetUser.password,
      role: targetUser.role,
      studentId: targetUser.studentId,
      college: targetUser.college
    });
  };

  const handleDeleteUserClick = (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setCrudError('');
    setCrudSuccess('');

    fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.error) });
        return res.json();
      })
      .then(() => {
        setCrudSuccess('User deleted successfully.');
        fetchUsersList();
      })
      .catch(err => setCrudError(err.message));
  };

  // ----------------------------------------------------
  // SMTP SETTINGS SERVICES
  // ----------------------------------------------------
  const fetchSMTPSettings = () => {
    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.smtpConfig) {
          setSmtpConfig(data.smtpConfig);
        }
      })
      .catch(err => console.error('Error loading SMTP configurations:', err));
  };

  const handleSmtpChange = (e) => {
    const { name, value } = e.target;
    setSmtpConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSmtpSettings = (e) => {
    e.preventDefault();
    setSettingsSuccess('');

    fetch(`${API_BASE_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smtpConfig)
    })
      .then(res => res.json())
      .then(() => {
        setSettingsSuccess('SMTP Configuration saved successfully.');
      })
      .catch(err => console.error('Error updating SMTP settings:', err));
  };

  // ----------------------------------------------------
  // Chat Handlers
  // ----------------------------------------------------
  const handleQueryRAG = (queryText) => {
    if (!queryText.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', text: queryText }]);
    setIsLoadingChat(true);

    fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(queryText)}`)
      .then(res => res.json())
      .then(data => {
        setIsLoadingChat(false);
        if (data.results && data.results.length > 0) {
          const topMatch = data.results[0];
          setChatMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: topMatch.content,
              citation: topMatch.citation,
              score: topMatch.score
            }
          ]);
          setActiveHandbookHighlight(topMatch.citation);
        } else {
          setChatMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: "I couldn't find any direct matches in the student handbook. Could you please rephrase or target a topic like grading, shifting, residency, or honors?"
            }
          ]);
          setActiveHandbookHighlight(null);
        }
      })
      .catch(err => {
        setIsLoadingChat(false);
        setChatMessages(prev => [
          ...prev,
          { sender: 'bot', text: 'Error connecting to the handbook policy engine. Make sure the backend server container is running.' }
        ]);
      });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    handleQueryRAG(chatInput.trim());
    setChatInput('');
  };

  // Increment hit counter & scroll/trigger RAG
  const handleCategoryClick = (categoryKey, queryText) => {
    setCategoryHits(prev => ({
      ...prev,
      [categoryKey]: prev[categoryKey] + 1
    }));
    
    // Scroll to Handbook RAG section
    if (handbookBotRef.current) {
      handbookBotRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Auto query
    setTimeout(() => {
      handleQueryRAG(queryText);
    }, 800);
  };

  // Increment hit counter & open link
  const handleLinkClick = (linkKey, url) => {
    setLinkHits(prev => ({
      ...prev,
      [linkKey]: prev[linkKey] + 1
    }));
    window.open(url, '_blank');
  };

  // ----------------------------------------------------
  // Pathfinder Handlers
  // ----------------------------------------------------
  const handleToggleCourseFailed = (courseId) => {
    setFailedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const clearPathfinderFilters = () => {
    setFailedCourses([]);
  };

  const filteredCourses = courses.filter(course => 
    course.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ----------------------------------------------------
  // Sync Handlers & Conflict Simulation
  // ----------------------------------------------------
  const triggerSyncNode = (nodeName) => {
    const randomActions = [
      { type: 'Event', content: `${nodeName} Room reservation modified`, timestamp: Date.now() },
      { type: 'Schedule', content: `${nodeName} class scheduling update`, timestamp: Date.now() },
      { type: 'Notice', content: `${nodeName} campus announcement updated`, timestamp: Date.now() }
    ];
    const newLogItem = randomActions[Math.floor(Math.random() * randomActions.length)];
    const mockId = Math.floor(Math.random() * 1000) + 10;
    const localDelta = [{ id: mockId, ...newLogItem }];

    setCampusSyncLogs(prev => ({
      ...prev,
      [nodeName]: [
        ...prev[nodeName],
        `[Sync] Pushing delta: "${newLogItem.content}" (ID: ${mockId})`
      ]
    }));

    fetch(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nodeName,
        localLogs: localDelta
      })
    })
      .then(res => res.json())
      .then(data => {
        setUnifiedDatabase(data.unifiedRecords);
        setCampusSyncLogs(prev => ({
          ...prev,
          [nodeName]: [
            ...prev[nodeName],
            `[Sync] Success. Node in-sync. Size: ${data.unifiedDatabaseSize} records.`
          ]
        }));
      })
      .catch(err => {
        setCampusSyncLogs(prev => ({
          ...prev,
          [nodeName]: [...prev[nodeName], '[Error] Sync failed. Backend unreachable.']
        }));
      });
  };

  const runConflictSimulation = () => {
    const now = Date.now();
    const batacTimestamp = now + (parseInt(batacTimeOffset) * 60 * 1000);
    const laoagTimestamp = now + (parseInt(laoagTimeOffset) * 60 * 1000);

    const batacRecord = {
      id: parseInt(conflictRecordId),
      type: 'Room',
      content: batacContent,
      timestamp: batacTimestamp
    };

    const laoagRecord = {
      id: parseInt(conflictRecordId),
      type: 'Room',
      content: laoagContent,
      timestamp: laoagTimestamp
    };

    setCampusSyncLogs(prev => ({
      ...prev,
      Batac: [...prev.Batac, `[Simulator] Local edit on ID ${conflictRecordId}: "${batacContent}"`],
      Laoag: [...prev.Laoag, `[Simulator] Local edit on ID ${conflictRecordId}: "${laoagContent}"`]
    }));

    fetch(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nodeName: 'Batac',
        localLogs: [batacRecord]
      })
    })
      .then(res => res.json())
      .then(data => {
        setUnifiedDatabase(data.unifiedRecords);
        setCampusSyncLogs(prev => ({
          ...prev,
          Batac: [...prev.Batac, `[Simulator] Delta pushed (TS: ${new Date(batacTimestamp).toLocaleTimeString()}).`]
        }));

        return fetch(`${API_BASE_URL}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodeName: 'Laoag',
            localLogs: [laoagRecord]
          })
        });
      })
      .then(res => res.json())
      .then(data => {
        setUnifiedDatabase(data.unifiedRecords);
        const winner = batacTimestamp > laoagTimestamp ? 'Batac' : 'Laoag';
        setCampusSyncLogs(prev => ({
          ...prev,
          Laoag: [...prev.Laoag, `[Simulator] Delta pushed (TS: ${new Date(laoagTimestamp).toLocaleTimeString()}).`],
          Batac: [...prev.Batac, `[Reconciliation] Conflict resolved via LWW. Winner: ${winner}`],
          Laoag: [...prev.Laoag, `[Reconciliation] Conflict resolved via LWW. Winner: ${winner}`]
        }));
      })
      .catch(err => {
        console.error('Error in conflict simulation:', err);
      });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatPstDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatPstTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour12: true });
  };

  const renderUsersCrud = () => {
    return (
      <div className="user-crud-container" style={{ marginTop: '12px' }}>
        {crudError && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>⚠️ {crudError}</div>}
        {crudSuccess && <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>✓ {crudSuccess}</div>}
        
        {/* CRUD Form */}
        <form onSubmit={handleCreateOrUpdateUser} className="crud-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{editingUserId ? 'Edit User Details' : 'Add New User Account'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="input-field"
                placeholder="e.g. John Doe"
                value={crudForm.name}
                onChange={handleCrudFormChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Student ID (xx-xxxxxx)</label>
              <input
                type="text"
                name="studentId"
                required
                className="input-field"
                placeholder="e.g. 23-140015"
                value={crudForm.studentId}
                onChange={handleCrudFormChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                name="email"
                required
                className="input-field"
                placeholder="e.g. user@domain.com"
                value={crudForm.email}
                onChange={handleCrudFormChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password (Optional - auto-generated if blank)</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="e.g. password123 (or blank for auto-generate)"
                value={crudForm.password}
                onChange={handleCrudFormChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Role</label>
              <select
                name="role"
                className="input-field"
                value={crudForm.role}
                onChange={handleCrudFormChange}
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">College</label>
              <input
                type="text"
                name="college"
                className="input-field"
                placeholder="e.g. CCIS"
                value={crudForm.college}
                onChange={handleCrudFormChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" className="btn-signin" style={{ maxWidth: '150px', padding: '10px' }}>
              {editingUserId ? 'Update User' : 'Create User'}
            </button>
            {editingUserId && (
              <button 
                type="button" 
                className="btn-signin" 
                style={{ maxWidth: '150px', padding: '10px', backgroundColor: 'var(--border-color)', color: 'var(--text-main)' }}
                onClick={() => {
                  setEditingUserId(null);
                  setCrudForm({ name: '', email: '', password: '', role: 'Student', studentId: '', college: 'CCIS' });
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Master Table */}
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Active Registry Ledger</h4>
          <div style={{ overflowX: 'auto', maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '10px' }}>Name</th>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Password</th>
                  <th style={{ padding: '10px' }}>Role</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                    <td style={{ padding: '10px', fontWeight: '600' }}>{item.name}</td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{item.studentId}</td>
                    <td style={{ padding: '10px' }}>{item.email}</td>
                    <td style={{ padding: '10px' }}><code>{item.password}</code></td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '700',
                        backgroundColor: item.role === 'Super Admin' ? 'rgba(217, 119, 6, 0.1)' : item.role === 'Admin' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                        color: item.role === 'Super Admin' ? 'var(--secondary)' : item.role === 'Admin' ? 'var(--accent)' : 'var(--text-muted)'
                      }}>
                        {item.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" className="btn-crud-action btn-edit" style={{ padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }} onClick={() => handleEditUserClick(item)}>Edit</button>
                        <button type="button" className="btn-crud-action btn-delete" style={{ padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }} onClick={() => handleDeleteUserClick(item.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSmtpSettings = () => {
    return (
      <form onSubmit={handleSaveSmtpSettings} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}>
        {settingsSuccess && <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>✓ {settingsSuccess}</div>}
        
        <div className="settings-smtp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="input-group">
            <label className="input-label">Email Provider</label>
            <select 
              name="provider"
              className="input-field"
              value={smtpConfig.provider}
              onChange={handleSmtpChange}
            >
              <option>Outlook / Office 365</option>
              <option>Gmail</option>
              <option>Custom SMTP</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Sender Display Name</label>
            <input
              type="text"
              name="senderName"
              className="input-field"
              placeholder="e.g. MMSU Knowledge Hub"
              value={smtpConfig.senderName}
              onChange={handleSmtpChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Sender Email (Optional)</label>
            <input
              type="email"
              name="senderEmail"
              className="input-field"
              placeholder="e.g. hub@mmsu.edu.ph"
              value={smtpConfig.senderEmail}
              onChange={handleSmtpChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">SMTP Host</label>
            <input
              type="text"
              name="host"
              className="input-field"
              placeholder="e.g. smtp.office365.com"
              value={smtpConfig.host}
              onChange={handleSmtpChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Port</label>
            <input
              type="number"
              name="port"
              className="input-field"
              placeholder="e.g. 587"
              value={smtpConfig.port}
              onChange={handleSmtpChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Authentication Username</label>
            <input
              type="email"
              name="username"
              className="input-field"
              placeholder="e.g. user@domain.com"
              value={smtpConfig.username}
              onChange={handleSmtpChange}
            />
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label">Authentication Password / App Password</label>
            <div className="password-input-wrapper">
              <input
                type={showSmtpPassword ? 'text' : 'password'}
                name="password"
                className="input-field"
                placeholder="••••••••"
                value={smtpConfig.password}
                onChange={handleSmtpChange}
              />
              <button 
                type="button" 
                onClick={() => setShowSmtpPassword(!showSmtpPassword)} 
                className="password-toggle-btn"
              >
                {showSmtpPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          * Note: Most providers (Gmail/Outlook) will only respect these if they are verified aliases. Use an App Password if 2FA is enabled.
        </div>

        <div>
          <button type="submit" className="btn-signin" style={{ maxWidth: '150px', padding: '10px' }}>Save Settings</button>
        </div>
      </form>
    );
  };

  const renderSettingsModal = () => {
    if (!showSettingsModal) return null;
    return (
      <div className="about-modal-overlay" onClick={() => setShowSettingsModal(false)} style={{ zIndex: 3000 }}>
        <div className="about-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', display: 'flex', flexDirection: 'column', height: '600px', padding: 0, overflow: 'hidden' }}>
          
          {/* Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>⚙️ Settings & Profile</h3>
            <button className="modal-close-btn" onClick={() => setShowSettingsModal(false)} style={{ position: 'static', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>×</button>
          </div>

          {/* Modal Body */}
          <div className="settings-modal-body">
            {/* Sidebar Tabs */}
            <div className="settings-modal-sidebar">
              
              {/* User Profile Card in Sidebar - only show if logged in */}
              {user && (
                <div style={{ padding: '0 16px 16px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {user.email}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>
                        {user.role}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile & Account Tab - only show if logged in */}
              {user && (
                <button 
                  type="button"
                  onClick={() => setSettingsActiveTab('profile')} 
                  className={`settings-sidebar-tab ${settingsActiveTab === 'profile' ? 'active' : ''}`}
                >
                  👤 Profile & Account
                </button>
              )}
              
              <button 
                type="button"
                onClick={() => setSettingsActiveTab('appearance')} 
                className={`settings-sidebar-tab ${settingsActiveTab === 'appearance' ? 'active' : ''}`}
              >
                🎨 Appearance
              </button>
              
              {/* Users CRUD - Admins / Super Admins only */}
              {user && (user.role === 'Admin' || user.role === 'Super Admin') && (
                <button 
                  type="button"
                  onClick={() => setSettingsActiveTab('users')} 
                  className={`settings-sidebar-tab ${settingsActiveTab === 'users' ? 'active' : ''}`}
                >
                  👥 Users CRUD
                </button>
              )}
              
              {/* SMTP Settings - Super Admin only */}
              {user && user.role === 'Super Admin' && (
                <button 
                  type="button"
                  onClick={() => setSettingsActiveTab('smtp')} 
                  className={`settings-sidebar-tab ${settingsActiveTab === 'smtp' ? 'active' : ''}`}
                >
                  ✉️ SMTP Settings
                </button>
              )}

              {/* Logout Button - only show if logged in */}
              {user && (
                <button 
                  type="button"
                  onClick={() => {
                    handleLogOut();
                    setShowSettingsModal(false);
                  }}
                  className="settings-logout-btn"
                  style={{
                    marginTop: 'auto',
                    marginRight: '16px',
                    marginLeft: '16px',
                    marginBottom: '16px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    fontWeight: '700',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Logout
                </button>
              )}
            </div>

            {/* Tab Content Area */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
              
              {/* Tab: Profile - only show if logged in */}
              {settingsActiveTab === 'profile' && user && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Account Information</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="input-group">
                      <label className="input-label">Full Name</label>
                      <input className="input-field" type="text" readOnly value={user.name} style={{ opacity: 0.8 }} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Email Address</label>
                      <input className="input-field" type="text" readOnly value={user.email} style={{ opacity: 0.8 }} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Role</label>
                      <input className="input-field" type="text" readOnly value={user.role} style={{ opacity: 0.8 }} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Student ID / Employee ID</label>
                      <input className="input-field" type="text" readOnly value={user.studentId} style={{ opacity: 0.8 }} />
                    </div>
                    <div className="input-group" style={{ gridColumn: 'span 2' }}>
                      <label className="input-label">College / Office</label>
                      <input className="input-field" type="text" readOnly value={user.college || 'CCIS'} style={{ opacity: 0.8 }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Appearance */}
              {settingsActiveTab === 'appearance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Theme Options</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                    Customize the look and feel of your MMSU Knowledge Hub experience.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                    <div 
                      onClick={() => handleThemeChange('light')}
                      style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        border: `2px solid ${theme === 'light' ? 'var(--secondary)' : 'var(--border-color)'}`, 
                        cursor: 'pointer', 
                        backgroundColor: theme === 'light' ? 'rgba(217, 119, 6, 0.05)' : 'transparent',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>☀️</div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Light Mode</div>
                    </div>
                    <div 
                      onClick={() => handleThemeChange('dark')}
                      style={{ 
                        padding: '16px', 
                        borderRadius: '12px', 
                        border: `2px solid ${theme === 'dark' ? 'var(--secondary)' : 'var(--border-color)'}`, 
                        cursor: 'pointer', 
                        backgroundColor: theme === 'dark' ? 'rgba(217, 119, 6, 0.05)' : 'transparent',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌙</div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Dark Mode</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Users CRUD - Admins / Super Admins only */}
              {settingsActiveTab === 'users' && user && (user.role === 'Admin' || user.role === 'Super Admin') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>User Accounts Directory</h4>
                  {renderUsersCrud()}
                </div>
              )}

              {/* Tab: SMTP Settings - Super Admin only */}
              {settingsActiveTab === 'smtp' && user && user.role === 'Super Admin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Mail Delivery Configuration</h4>
                  {renderSmtpSettings()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // RENDER CONDITIONAL PAGE: NOT LOGGED IN
  // ----------------------------------------------------
  if (!user) {
    return (
      <div className="solido-app">
        
        {/* Sticky top Navigation Header */}
        <nav className="solido-nav" style={{ position: 'sticky', top: 0, width: '100%', zIndex: 1000 }}>
          <div className="solido-nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '16px 24px' }}>
            <div className="solido-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/mmsu-logo.png" style={{ height: '40px' }} alt="MMSU Logo" />
              <img src="/CCIS.png" style={{ height: '40px' }} alt="CCIS Logo" />
            </div>
            <button 
              type="button" 
              style={{ cursor: 'pointer', fontSize: '18px', background: 'none', border: 'none', color: 'var(--text-main)' }} 
              onClick={() => { setSettingsActiveTab('appearance'); setShowSettingsModal(true); }}
            >
              ⚙️
            </button>
          </div>
        </nav>
        {renderSettingsModal()}

        {/* SOLIDO BRANDING HEADER BANNER */}
        <header className="solido-header">
          <div className="solido-header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src="/logo_dn.png" style={{ height: '55px', objectFit: 'contain' }} alt="Main Logo" />
              <div>
                <h1 className="solido-title" style={{ fontSize: '22px', margin: 0 }}>MMSU KNOWLEDGE HUB</h1>
                <p className="solido-subtitle" style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Public Academic Portal with Live Updates and Bulletins</p>
              </div>
            </div>
            
            <div className="pst-clock-card" style={{ margin: 0 }}>
              <span className="pst-label">Philippine Standard Time</span>
              <div className="pst-time">{formatPstTime(pst)}</div>
              <div className="pst-date">{formatPstDate(pst)}</div>
            </div>
          </div>
        </header>

        {/* Hero & Login Grid */}
        <div id="auth-grid" style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="auth-grid-container">
            
            {/* LEFT COLUMN: HERO SECTION */}
            <div className="auth-hero-col">
              <span style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)', color: 'var(--secondary)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Mariano Marcos State University
              </span>
              <h1 style={{ fontSize: '42px', fontWeight: '800', marginTop: '16px', lineHeight: '1.2', color: 'var(--text-main)' }}>
                Welcome to the Unified Knowledge Hub & Pathfinder
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginTop: '20px', lineHeight: '1.6' }}>
                An Integrated Multi Campus Academic Information System with Graph Theoretic Pathfinding and Semantic Policy Retrieval inspired by DOST SOLIDO Knowledge Hub. Connect your course paths, query student policies offline, and sync campus data records instantly.
              </p>
              
              {/* Informational Carousel embedded in the hero */}
              <div style={{ marginTop: '30px', padding: '20px', borderLeft: '4px solid var(--secondary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '0 12px 12px 0', boxShadow: 'var(--card-shadow)' }}>
                <h4 style={{ fontWeight: '700', fontSize: '15px', color: 'var(--primary)' }}>
                  {carouselSlides[carouselIndex].title}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {carouselSlides[carouselIndex].text}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {carouselSlides.map((_, idx) => (
                    <button
                      key={idx}
                      className={`dot-btn ${carouselIndex === idx ? 'active' : ''}`}
                      onClick={() => setCarouselIndex(idx)}
                      style={{ width: '8px', height: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: carouselIndex === idx ? 'var(--secondary)' : 'rgba(0,0,0,0.1)' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LOGIN / REGISTER CARD */}
            <div className="auth-card-col">
              <div className="w-full max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-100" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px', boxShadow: 'var(--card-shadow)' }}>
                
                {authMode === 'login' ? (
                  <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', textAlign: 'center' }}>Sign In</h2>
                    
                    {authError && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', padding: '10px', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px dashed rgba(239,68,68,0.2)', borderRadius: '8px' }}>⚠️ {authError}</div>}
                    {authSuccess && <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: '600', padding: '10px', backgroundColor: 'rgba(16,185,129,0.05)', border: '1px dashed rgba(16,185,129,0.2)', borderRadius: '8px' }}>✓ {authSuccess}</div>}

                    <div className="input-group">
                      <label className="input-label">College (Locked for Testing)</label>
                      <select className="input-field" disabled style={{ width: '100%' }}>
                        <option>College of Computing and Information Sciences (CCIS)</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Student ID or Email</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. 23-140015 or test@gmail.com"
                        required
                        value={loginIdentifier}
                        onChange={handleLoginIdentifierChange}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          className="input-field"
                          placeholder="••••••••"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowLoginPassword(!showLoginPassword)} 
                          className="password-toggle-btn"
                        >
                          {showLoginPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="btn-signin">Sign In</button>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No account yet?</span>
                      <button 
                        type="button" 
                        className="btn-create-account-red"
                        onClick={() => {
                          setAuthMode('register');
                          setAuthError('');
                          setAuthSuccess('');
                        }}
                      >
                        Create Account
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', textAlign: 'center' }}>Create Account</h2>

                    {authError && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', padding: '10px', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px dashed rgba(239,68,68,0.2)', borderRadius: '8px' }}>⚠️ {authError}</div>}

                    <div className="input-group">
                      <label className="input-label">Student Number (Format: xx-xxxxxx)</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. 23-140015"
                        required
                        pattern="\d{2}-\d{6}"
                        value={regStudentId}
                        onChange={handleRegStudentIdChange}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Legitimate Email Address</label>
                      <input
                        type="email"
                        className="input-field"
                        placeholder="e.g. name@domain.com"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          className="input-field"
                          placeholder="••••••••"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowRegPassword(!showRegPassword)} 
                          className="password-toggle-btn"
                        >
                          {showRegPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="btn-signin">Register Student</button>

                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', marginTop: '10px' }}
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                    >
                      Already have an account? Sign In
                    </button>
                  </form>
                )}

                <div className="clickable-about-link" onClick={() => setAboutModalOpen(true)} style={{ display: 'block', textAlign: 'center', marginTop: '16px' }}>
                  ABOUT MMSU CCIS
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM NEWS / DEVELOPMENT REPLICA SECTION */}
        <section style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '60px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Latest News</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                This system was developed by MMSU CCIS as an initiative to provide a centralized digital knowledge hub for academic resources, course pathfinding tools, and policy guidelines for students, faculty, and administrators.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <div className="news-feed-item">
                <div className="news-feed-meta">
                  <span className="news-tag">CCIS System</span>
                  <span>System Pre-seed</span>
                </div>
                <h3>Advising System v1.0.0 Operational</h3>
                <p>The topological sort cycle-detection and custom local vector indexing engines are fully operational and waiting to advise irregular student schedules.</p>
              </div>

              <div className="news-feed-item">
                <div className="news-feed-meta">
                  <span className="news-tag">Student Council</span>
                  <span>Orientation Link</span>
                </div>
                <h3>Irregular Student Orientation Checklist</h3>
                <p>Register your account with your correct Student Number to map out prerequisite waiving options and graduation extensions safely.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ACCESSIBILITY FOOTER */}
        <footer className="solido-footer" style={{ marginTop: 0, padding: '30px 24px', backgroundColor: 'var(--primary)' }}>
          <div className="solido-nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ fontSize: '13px', opacity: '0.8', color: 'white' }}>
              © 2026 Mariano Marcos State University. All Rights Reserved.
            </div>
            <div style={{ fontSize: '13px', opacity: '0.8', color: 'white' }}>
              Designed & Developed by the{' '}
              <span 
                style={{ textDecoration: 'underline', cursor: 'pointer', color: '#3b82f6', fontWeight: 'bold' }} 
                onClick={() => setAboutModalOpen(true)}
              >
                College of Computing and Information Sciences
              </span>{' '}
              4A students.
            </div>
          </div>
        </footer>

        {/* ABOUT POPUP MODAL */}
        {aboutModalOpen && (
          <div className="about-modal-overlay" onClick={() => setAboutModalOpen(false)}>
            <div className="about-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setAboutModalOpen(false)}>×</button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                <img src="/CCIS.png" style={{ height: '50px' }} alt="CCIS Logo" />
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800' }}>MMSU CCIS</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>College of Computing and Information Sciences</p>
                </div>
              </div>

              <div className="modal-section">
                <h4 style={{ color: '#3b82f6' }}>Mandate</h4>
                <p>To provide advanced education, professional instruction, and research coordination in computing, informatics, and information technology to serve regional development and technical excellence.</p>
              </div>

              <div className="modal-section">
                <h4 style={{ color: '#3b82f6' }}>Mission</h4>
                <p>To direct, lead, and coordinate the university's computing and technological efforts towards maximum technological innovation and socio-economic benefits for the people.</p>
              </div>

              <div className="modal-section">
                <h4 style={{ color: '#3b82f6' }}>Vision</h4>
                <p>The College of Computing and Information Sciences (CCIS) as the center of excellence in computing sciences towards an inclusive, resilient, smart, and sustainable MMSU.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER CONDITIONAL PAGE: LOGGED IN MAIN PORTAL
  // ----------------------------------------------------
  return (
    <div className={`solido-app ${theme === 'dark' ? 'dark-mode-active' : ''}`}>
      {/* SOLIDO STICKY TOP NAVBAR */}
      <nav className="solido-nav">
        <div className="solido-nav-container">
          <div className="solido-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/mmsu-logo.png" style={{ height: '32px' }} alt="MMSU Logo" />
            <img src="/CCIS.png" style={{ height: '32px' }} alt="CCIS Logo" />
          </div>
          <button 
            type="button" 
            className="mobile-nav-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '×' : '☰'}
          </button>
          <ul className={`solido-nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <li onClick={() => { setIsMobileMenuOpen(false); setActiveTab('dashboard'); scrollToSection('news'); }}>Latest News</li>
            <li onClick={() => { setIsMobileMenuOpen(false); setActiveTab('dashboard'); scrollToSection('categories'); }}>Categories</li>
            <li onClick={() => { setIsMobileMenuOpen(false); setActiveTab('dashboard'); scrollToSection('links'); }}>Quick Links</li>
            <li onClick={() => { setIsMobileMenuOpen(false); setActiveTab('handbook-bot'); }}>Handbook Bot</li>
            <li onClick={() => { setIsMobileMenuOpen(false); setActiveTab('pathfinder'); }}>Prospectus</li>
            
            {/* Conditional Tabs based on User Roles */}
            {user.role !== 'Student' && (
              <li onClick={() => { setIsMobileMenuOpen(false); setActiveTab('sync'); }}>Prospectus Sync</li>
            )}

            <li style={{ cursor: 'pointer', fontSize: '18px', marginLeft: '12px' }} onClick={() => { setIsMobileMenuOpen(false); setSettingsActiveTab('profile'); setShowSettingsModal(true); }}>⚙️</li>
          </ul>
        </div>
      </nav>
      {renderSettingsModal()}

      {/* SOLIDO BRANDING HEADER BANNER */}
      <header className="solido-header">
        <div className="solido-header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src="/logo_dn.png" style={{ height: '55px', objectFit: 'contain' }} alt="Main Logo" />
            <div>
              <h1 className="solido-title" style={{ fontSize: '22px', margin: 0 }}>MMSU KNOWLEDGE HUB</h1>
              <p className="solido-subtitle" style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Public Academic Portal with Live Updates and Bulletins</p>
            </div>
          </div>
          
          {/* Active User Card & Clock */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="pst-clock-card" style={{ textAlign: 'left', minWidth: '180px', padding: '12px 20px' }}>
              <span className="pst-label" style={{ color: 'var(--accent)' }}>Active Session</span>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>{user.name}</div>
              <div style={{ fontSize: '11px', opacity: '0.8' }}>
                {user.studentId} • <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{user.role}</span>
              </div>
              <button 
                onClick={handleLogOut} 
                style={{ marginTop: '8px', padding: '4px 8px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', backgroundColor: 'transparent', color: 'white', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Log Out
              </button>
            </div>

            <div className="pst-clock-card">
              <span className="pst-label">Philippine Standard Time</span>
              <div className="pst-time">{formatPstTime(pst)}</div>
              <div className="pst-date">{formatPstDate(pst)}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="solido-intro-desc">
        <p>
          Welcome, <b>{user.name}</b>! You are logged in as a <b>{user.role}</b>. 
          Depending on your roles, you can explore curriculum roadmaps, seek policy answers with our NLP chatbot, or manage distributed databases and credentials.
        </p>
      </div>

      {/* MAIN CONTAINER */}
      <div className="solido-main-container">
        
        {/* TAB 1: COMMAND CENTER (DASHBOARD) */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
            {/* News bulletins */}
            <section id="news" className="solido-section" style={{ border: 'none' }}>
              <h2 className="solido-section-title">Latest News & Academic Bulletins</h2>
              <p className="solido-section-subtitle">Stay informed with the latest updates from across the university campuses.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginTop: '24px' }}>
                <div className="alert-card-bantay">
                  <div className="alert-card-header">BANTAY ACADEMICS</div>
                  <div className="alert-card-body">
                    <span className="alert-badge-live">LIVE ALERT</span>
                    <p style={{ marginTop: '12px', fontSize: '14px', lineHeight: '1.5', fontWeight: '500' }}>
                      As of 2:00 PM today, the **Batch 2026 Enrollment & Graduation Clearance Portal** 
                      has been officially opened. All irregular students are advised to run their pending/failed courses 
                      through the **Pathfinder DAG Recalculator** to prevent Maximum Residency Rule (MRR) violations.
                    </p>
                    <button className="alert-action-btn" onClick={() => setActiveTab('pathfinder')}>
                      Open Pathfinder DAG
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="news-feed-item">
                    <div className="news-feed-meta">
                      <span className="news-tag">CCIS Batac</span>
                      <span className="hits-tag">92 Hits</span>
                    </div>
                    <h3>DOST invites award-winning MMSU game developers to Creative Tech Fest</h3>
                    <p>The Department of Science and Technology (DOST) has officially invited students from the College of Computing and Information Sciences to showcase their thesis-designed educational games during the regional Creative Tech Festival.</p>
                  </div>

                  <div className="news-feed-item">
                    <div className="news-feed-meta">
                      <span className="news-tag">All Campuses</span>
                      <span className="hits-tag">154 Hits</span>
                    </div>
                    <h3>Class Suspension due to Heavy Monsoon Rainfall</h3>
                    <p>Following local disaster council briefs, academic sessions across Batac, Laoag, and Currimao campuses are shifted to synchronous virtual classes today due to flood risks and transport delays in Ilocos Norte.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Categories */}
            <section id="categories" className="solido-section">
              <h2 className="solido-section-title">Knowledge Categories</h2>
              <p className="solido-section-subtitle">Access specialized guidelines and structural handbooks designed to support student navigation.</p>
              
              <div className="categories-grid">
                <div className="category-item-card">
                  <div className="category-item-header">
                    <h4>Shifting Rules</h4>
                    <span className="hits-badge">{categoryHits.shifting} Hits</span>
                  </div>
                  <p>Review the minimum General Weighted Average (GWA) requirements, advisor endorsements, and interviewer protocols required to shift programs between colleges.</p>
                  <button className="category-action-btn" onClick={() => handleCategoryClick('shifting', 'What are the rules for shifting between colleges?')}>
                    Learn More
                  </button>
                </div>

                <div className="category-item-card">
                  <div className="category-item-header">
                    <h4>Maximum Residency (MRR)</h4>
                    <span className="hits-badge">{categoryHits.mrr} Hits</span>
                  </div>
                  <p>Understand the 1.5x curriculum length limit (6 years for BSCS) and the administrative appeal steps required to secure residency extensions from the Dean.</p>
                  <button className="category-action-btn" onClick={() => handleCategoryClick('mrr', 'What is the maximum residency rule (MRR) for BSCS?')}>
                    Learn More
                  </button>
                </div>

                <div className="category-item-card">
                  <div className="category-item-header">
                    <h4>Graduation & Latin Honors</h4>
                    <span className="hits-badge">{categoryHits.honors} Hits</span>
                  </div>
                  <p>Consult the mandatory GWA brackets (1.00 - 1.75) for Latin Honors, grade thresholds (no grade below 2.50), and general academic disqualifiers.</p>
                  <button className="category-action-btn" onClick={() => handleCategoryClick('honors', 'What GWA is needed for Latin honors?')}>
                    Learn More
                  </button>
                </div>

                <div className="category-item-card">
                  <div className="category-item-header">
                    <h4>Clearance Procedures</h4>
                    <span className="hits-badge">{categoryHits.clearance} Hits</span>
                  </div>
                  <p>Navigate multi-stage departmental clearances, including library book returns, thesis hard-bound library deposits, and financial accounting holds.</p>
                  <button className="category-action-btn" onClick={() => handleCategoryClick('clearance', 'What are the graduation clearance requirements?')}>
                    Learn More
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Links */}
            <section id="links" className="solido-section">
              <h2 className="solido-section-title">Quick Links</h2>
              <p className="solido-section-subtitle">Launch public databases, virtual classrooms, and administrative portals via direct redirections.</p>
              
              <div className="links-grid">
                <div className="link-item-card" onClick={() => handleLinkClick('portal', 'https://mys.mmsu.edu.ph')}>
                  <div className="link-item-title">
                    <h5>MMSU Students Portal</h5>
                    <span className="hits-badge-link">{linkHits.portal} Hits</span>
                  </div>
                  <p>Enroll in subjects, view term grades, and track billing assessments online.</p>
                </div>

                <div className="link-item-card" onClick={() => handleLinkClick('mvle', 'https://mvle4.mmsu.edu.ph')}>
                  <div className="link-item-title">
                    <h5>Virtual Learning (MVLE)</h5>
                    <span className="hits-badge-link">{linkHits.mvle} Hits</span>
                  </div>
                  <p>Access course syllabi, assignments, and virtual classroom modules.</p>
                </div>

                <div className="link-item-card" onClick={() => handleLinkClick('library', 'https://uls.mmsu.edu.ph')}>
                  <div className="link-item-title">
                    <h5>University Library System</h5>
                    <span className="hits-badge-link">{linkHits.library} Hits</span>
                  </div>
                  <p>Browse digital academic catalogs, research papers, and search inventories.</p>
                </div>

                <div className="link-item-card" onClick={() => handleLinkClick('tracking', 'https://tracking.mmsu.edu.ph')}>
                  <div className="link-item-title">
                    <h5>Document Tracking</h5>
                    <span className="hits-badge-link">{linkHits.tracking} Hits</span>
                  </div>
                  <p>Track the real-time routing status of official student forms and transcripts.</p>
                </div>

                <div className="link-item-card" onClick={() => handleLinkClick('mcat', 'https://mcat.mmsu.edu.ph')}>
                  <div className="link-item-title">
                    <h5>Admissions Portal (MCAT)</h5>
                    <span className="hits-badge-link">{linkHits.mcat} Hits</span>
                  </div>
                  <p>Consult entrance examination schedules and publication lists.</p>
                </div>

                <div className="link-item-card" onClick={() => handleLinkClick('alumni', 'https://alumni.mmsu.edu.ph')}>
                  <div className="link-item-title">
                    <h5>MMSU Alumni Network</h5>
                    <span className="hits-badge-link">{linkHits.alumni} Hits</span>
                  </div>
                  <p>Register graduate profiles, job opportunities, and networking updates.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: HANDBOOK Q&A BOT */}
        {activeTab === 'handbook-bot' && (
          <section className="solido-section" style={{ border: 'none' }}>
            <h2 className="solido-section-title">Handbook Consulting Chatbot (Local RAG)</h2>
            <p className="solido-section-subtitle">Search handbook regulations semantically. The TF-IDF algorithm matches keywords locally, outputting cited references.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', marginTop: '24px' }}>
              <div className="chat-container">
                <div className="chat-messages" style={{ height: '400px' }}>
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`chat-bubble ${msg.sender}`}>
                      <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                      {msg.citation && (
                        <div className="citation-card" style={{ marginTop: '12px' }}>
                          📄 Source: {msg.citation} (Match: {Math.round(msg.score * 100)}%)
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoadingChat && (
                    <div className="chat-bubble bot" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      Vectorizing query and searching local HNSW index...
                    </div>
                  )}
                </div>

                <form className="chat-input-bar" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Ask a question about GWA, shifting, residency, library fines..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="btn-send">Search</button>
                </form>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="panel" style={{ padding: '24px', backgroundColor: 'var(--bg-primary)', maxHeight: '310px', overflowY: 'auto' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Suggested Handbook Queries</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQueryRAG(q)}
                        className="suggestion-chip-btn"
                      >
                        💡 {q}
                      </button>
                    ))}
                  </div>
                </div>

                {activeHandbookHighlight && (
                  <div className="panel" style={{ padding: '20px', border: '1px solid rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.04)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>✓</span> Verified Reference Source
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                      This answer is extracted from <strong>{activeHandbookHighlight}</strong>. Verify this physically under that specific article in the student handbook.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: CURRICULUM PATHFINDER */}
        {activeTab === 'pathfinder' && (
          <section className="solido-section" style={{ border: 'none' }}>
            <h2 className="solido-section-title">Curriculum Pathfinder & Prerequisite Map</h2>
            <p className="solido-section-subtitle">Graph-theoretic pathfinder modeling the curriculum as a Directed Acyclic Graph (DAG).</p>

            <div className="pathfinder-container" style={{ marginTop: '24px' }}>
              <div>
                <div className="course-checklist" style={{ height: '520px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '8px' }}>
                    <h3>Subject Inventory</h3>
                    <input
                      type="text"
                      placeholder="Search subject or code..."
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '13px' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '12px', flexGrow: 1 }}
                        value={currentSemester}
                        onChange={(e) => setCurrentSemester(parseInt(e.target.value))}
                      >
                        <option value={1}>Calculate from 1st Sem</option>
                        <option value={2}>Calculate from 2nd Sem</option>
                      </select>
                      <button onClick={clearPathfinderFilters} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                        Clear
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filteredCourses.map(course => {
                      const isFailed = failedCourses.includes(course.id);
                      return (
                        <label 
                          key={course.id} 
                          className="course-check-item"
                          style={{
                            borderColor: isFailed ? 'rgba(217, 119, 6, 0.4)' : 'var(--border-color)',
                            backgroundColor: isFailed ? 'rgba(217, 119, 6, 0.05)' : 'var(--bg-secondary)'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isFailed}
                            onChange={() => handleToggleCourseFailed(course.id)}
                          />
                          <div>
                            <strong>{course.id}</strong> - {course.name}
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              Units: {course.units} • Year {course.defaultYear} Sem {course.defaultSemester}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="plan-timeline">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Adjusted Semester Schedules</h3>
                  {recalculatedPlan && (
                    <span style={{ fontSize: '13px', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', fontWeight: 'bold' }}>
                      Graduation Time: {Math.ceil(recalculatedPlan.totalSemestersNeeded / 2)} Years ({recalculatedPlan.totalSemestersNeeded} Semesters)
                    </span>
                  )}
                </div>

                {recalculatedPlan && recalculatedPlan.isExceedingMRR && (
                  <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px dashed rgb(239 68 68 / 0.4)', color: '#ef4444', borderRadius: '12px', fontWeight: '600', fontSize: '13px', lineHeight: '1.4' }}>
                    ⚠️ Maximum Residency Rule (MRR) Violated: The recalculated plan requires more than 6 years of residency. You will need to file a formal extension petition with the Dean.
                  </div>
                )}

                {recalculatedPlan ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {recalculatedPlan.adjustedPlan.map((sem, idx) => (
                      <div key={idx} className="semester-block">
                        <div className="semester-title">
                          <span>Year {sem.year}, Semester {sem.semester === 1 ? '1st Sem' : '2nd Sem'}</span>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                            {sem.totalUnits} / 21 Units
                          </span>
                        </div>
                        <div className="semester-courses">
                          {sem.courses.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                              No courses scheduled (waiting on prerequisites).
                            </div>
                          ) : (
                            sem.courses.map(course => (
                              <div key={course.id} className={`course-badge ${course.isDelayed ? 'delayed' : ''}`}>
                                <span className="course-badge-id">
                                  {course.id} {course.isDelayed && '⚠️'}
                                </span>
                                <span className="course-badge-name" style={{ height: '32px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                  {course.name}
                                </span>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
                                  <span>{course.units} Units</span>
                                  {course.isDelayed && <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Delayed</span>}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Calculating plan...</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: OPERATIONS SYNC */}
        {activeTab === 'sync' && user.role !== 'Student' && (
          <section className="solido-section" style={{ border: 'none' }}>
            <h2 className="solido-section-title">Multi-Campus Database Synchronization Console</h2>
            <p className="solido-section-subtitle">Simulates real-time database replication between Batac, Laoag, and Currimao campus nodes using LWW timestamps.</p>
            
            <div className="sync-grid" style={{ marginTop: '24px' }}>
              {['Batac', 'Laoag', 'Currimao'].map(node => (
                <div key={node} className="sync-node-card">
                  <div className="sync-node-header">
                    <span>Node: {node} Campus</span>
                    <span className="status-dot"></span>
                  </div>
                  <div className="sync-logs">
                    {campusSyncLogs[node].map((log, idx) => (
                      <div key={idx} className="sync-log-entry">{log}</div>
                    ))}
                  </div>
                  <button className="sync-btn" onClick={() => triggerSyncNode(node)}>
                    Trigger Local Sync
                  </button>
                </div>
              ))}
            </div>

            {/* Conflict Simulator Panel */}
            <div className="panel" style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', border: '1px dashed var(--border-color)', marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Database Conflict Simulator (LWW Demonstration)</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Target Record ID</label>
                  <select 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                    value={conflictRecordId}
                    onChange={(e) => setConflictRecordId(parseInt(e.target.value))}
                  >
                    <option value={2}>ID 2 (CCIS Lab 1 assignment)</option>
                    <option value={4}>ID 4 (Fisheries Lab Maintenance)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Batac Campus Entry</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                    value={batacContent}
                    onChange={(e) => setBatacContent(e.target.value)}
                  />
                  <select 
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '6px', fontSize: '11px' }}
                    value={batacTimeOffset}
                    onChange={(e) => setBatacTimeOffset(parseInt(e.target.value))}
                  >
                    <option value={10}>Edited 10 mins in future</option>
                    <option value={30}>Edited 30 mins in future</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Laoag Campus Entry</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)' }}
                    value={laoagContent}
                    onChange={(e) => setLaoagContent(e.target.value)}
                  />
                  <select 
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '6px', fontSize: '11px' }}
                    value={laoagTimeOffset}
                    onChange={(e) => setLaoagTimeOffset(parseInt(e.target.value))}
                  >
                    <option value={20}>Edited 20 mins in future</option>
                    <option value={40}>Edited 40 mins in future</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button 
                    onClick={runConflictSimulation}
                    style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: 'var(--secondary)', color: 'white', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Run Sync Clash
                  </button>
                </div>
              </div>
            </div>

            {/* Master Table */}
            <div style={{ marginTop: '24px' }}>
              <h3>Unified Master Ledger</h3>
              <div style={{ overflowX: 'auto', marginTop: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px' }}>ID</th>
                      <th style={{ padding: '12px' }}>Category</th>
                      <th style={{ padding: '12px' }}>Data Content</th>
                      <th style={{ padding: '12px' }}>Sync Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unifiedDatabase.map(row => (
                      <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>{row.id}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', fontSize: '11px', fontWeight: '600' }}>
                            {row.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{row.content}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {new Date(row.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* SOLIDO BRANDED FOOTER */}
      <footer className="solido-footer">
        <div className="solido-footer-container">
          
          <div className="solido-footer-branding">
            <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
              <img src="/mmsu-logo.png" style={{ height: '40px' }} alt="MMSU Logo" />
              <img src="/CCIS.png" style={{ height: '40px' }} alt="CCIS Logo" />
            </div>
            <div>
              <h3>Mariano Marcos State University</h3>
              <p>College of Computing and Information Sciences (CCIS)</p>
              <p style={{ marginTop: '12px', fontSize: '13px', opacity: '0.7' }}>
                Brgy. 16-S Quiling Sur, City of Batac<br />
                Ilocos Norte, Philippines 2906<br />
                ccis@mmsu.edu.ph
              </p>
            </div>
          </div>

          <div className="solido-footer-info">
            <h4 style={{ color: '#3b82f6' }}>Our Mandate</h4>
            <p>To provide advanced education, professional instruction, and research coordination in computing, informatics, and information technology to serve regional development.</p>
          </div>

          <div className="solido-footer-info">
            <h4 style={{ color: '#3b82f6' }}>Our Mission</h4>
            <p>To direct, lead, and coordinate the university's computing and technological efforts towards maximum technological innovation and socio-economic benefits.</p>
          </div>

        </div>

        <div className="solido-footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p>© 2026 Mariano Marcos State University. All Rights Reserved.</p>
          <p style={{ fontSize: '12px', opacity: '0.6' }}>
            Designed & Developed by the{' '}
            <span 
              style={{ textDecoration: 'underline', cursor: 'pointer', color: '#3b82f6', fontWeight: 'bold' }} 
              onClick={() => setAboutModalOpen(true)}
            >
              College of Computing and Information Sciences
            </span>{' '}
            4A students.
          </p>
        </div>
      </footer>

      {/* ABOUT POPUP MODAL FOR LOGGED IN PORTAL */}
      {aboutModalOpen && (
        <div className="about-modal-overlay" onClick={() => setAboutModalOpen(false)}>
          <div className="about-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setAboutModalOpen(false)}>×</button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <img src="/CCIS.png" style={{ height: '50px' }} alt="CCIS Logo" />
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>MMSU CCIS</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>College of Computing and Information Sciences</p>
              </div>
            </div>

            <div className="modal-section">
              <h4 style={{ color: '#3b82f6' }}>Mandate</h4>
              <p>To provide advanced education, professional instruction, and research coordination in computing, informatics, and information technology to serve regional development and technical excellence.</p>
            </div>

            <div className="modal-section">
              <h4 style={{ color: '#3b82f6' }}>Mission</h4>
              <p>To direct, lead, and coordinate the university's computing and technological efforts towards maximum technological innovation and socio-economic benefits for the people.</p>
            </div>

            <div className="modal-section">
              <h4 style={{ color: '#3b82f6' }}>Vision</h4>
              <p>The College of Computing and Information Sciences (CCIS) as the center of excellence in computing sciences towards an inclusive, resilient, smart, and sustainable MMSU.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
