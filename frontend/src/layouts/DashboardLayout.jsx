import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, LayoutDashboard, FileText, History, Briefcase, Target, 
  TrendingUp, Compass, Award, MessageSquare, LineChart, Settings, LogOut,
  Search, Bell, Menu, X, ChevronDown, CheckCircle2
} from 'lucide-react';
import { cn } from '../utils/cn';
import Input from '../components/Input';
import api from '../utils/api';
import { useWorkspace } from '../context/WorkspaceContext';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Resume Analyzer', href: '/dashboard/resume', icon: FileText },
  { name: 'Resume History', href: '/dashboard/history', icon: History },
  { name: 'Job Analyzer', href: '/dashboard/jobs', icon: Search },
  { name: 'Skill Gap', href: '/dashboard/skills', icon: TrendingUp },
  { name: 'Learning Roadmap', href: '/dashboard/roadmap', icon: Compass },
  { name: 'Assessment', href: '/dashboard/assessment', icon: Award },
  { name: 'Assessment History', href: '/dashboard/assessment-history', icon: History },
  { name: 'Interview Prep', href: '/dashboard/interview', icon: MessageSquare },
  { name: 'Progress', href: '/dashboard/progress', icon: LineChart },
];

const bottomNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Just now';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    if (isNaN(diffMs) || diffMs < 0) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch (e) {
    return 'Recent';
  }
};

const DashboardLayout = () => {
  const { activeJobMatchId } = useWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [searchItems, setSearchItems] = useState([
    { type: 'Page', title: 'Dashboard Overview', location: 'Live Analytics & Pipeline', link: '/dashboard' },
    { type: 'Page', title: 'Resume Analyzer', location: 'ATS Scanner & Skill Extractor', link: '/dashboard/resume' },
    { type: 'Page', title: 'Resume History', location: 'Uploaded Resumes & Scores', link: '/dashboard/history' },
    { type: 'Page', title: 'Job Analyzer', location: 'JD Parser & Match Engine', link: '/dashboard/jobs' },
    { type: 'Page', title: 'Skill Gap Analysis', location: 'Comparison & Deficits', link: '/dashboard/skills' },
    { type: 'Page', title: 'Placement Sprint Roadmap', location: '15-25 Day Placement Prep', link: '/dashboard/roadmap' },
    { type: 'Page', title: 'Technical Assessment', location: 'Skill Quizzes & MCQs', link: '/dashboard/assessment' },
    { type: 'Page', title: 'Assessment History', location: 'Past Test Results', link: '/dashboard/assessment-history' },
    { type: 'Page', title: 'AI Mock Interview', location: 'Technical Interview Simulator', link: '/dashboard/interview' },
    { type: 'Page', title: 'Progress Tracker', location: 'Placement Velocity', link: '/dashboard/progress' },
    { type: 'Page', title: 'Account Settings', location: 'Profile & Credentials', link: '/dashboard/settings' },
  ]);

  const fetchRealNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotifications([]);
        return;
      }

      const [resumesRes, matchesRes, assessmentsRes] = await Promise.allSettled([
        api.get('/resumes'),
        api.get('/matches'),
        api.get('/assessments/history')
      ]);

      const realNotifs = [];
      const dynamicSearchList = [
        { type: 'Page', title: 'Dashboard Overview', location: 'Live Analytics & Pipeline', link: '/dashboard' },
        { type: 'Page', title: 'Resume Analyzer', location: 'ATS Scanner & Skill Extractor', link: '/dashboard/resume' },
        { type: 'Page', title: 'Resume History', location: 'Uploaded Resumes & Scores', link: '/dashboard/history' },
        { type: 'Page', title: 'Job Analyzer', location: 'JD Parser & Match Engine', link: '/dashboard/jobs' },
        { type: 'Page', title: 'Skill Gap Analysis', location: 'Comparison & Deficits', link: '/dashboard/skills' },
        { type: 'Page', title: 'Placement Sprint Roadmap', location: '15-25 Day Placement Prep', link: '/dashboard/roadmap' },
        { type: 'Page', title: 'Technical Assessment', location: 'Skill Quizzes & MCQs', link: '/dashboard/assessment' },
        { type: 'Page', title: 'Assessment History', location: 'Past Test Results', link: '/dashboard/assessment-history' },
        { type: 'Page', title: 'AI Mock Interview', location: 'Technical Interview Simulator', link: '/dashboard/interview' },
        { type: 'Page', title: 'Progress Tracker', location: 'Placement Velocity', link: '/dashboard/progress' },
        { type: 'Page', title: 'Account Settings', location: 'Profile & Credentials', link: '/dashboard/settings' },
      ];

      // 1. Real Assessment History
      if (assessmentsRes.status === 'fulfilled' && Array.isArray(assessmentsRes.value?.data)) {
        const assessments = assessmentsRes.value.data;
        if (assessments.length > 0) {
          const sorted = [...assessments].sort((a, b) => new Date(b.takenAt || 0) - new Date(a.takenAt || 0));
          const latest = sorted[0];
          const scoreDisplay = latest.score != null ? `${latest.score}%` : 'Recorded';
          realNotifs.push({
            id: `assessment-${latest.id}`,
            title: 'Assessment Recorded',
            text: `Technical quiz finished with score ${scoreDisplay} • Review detailed breakdown`,
            time: formatRelativeTime(latest.takenAt),
            timestamp: new Date(latest.takenAt || 0).getTime(),
            link: '/dashboard/assessment-history'
          });
        }
      }

      // 2. Real Job Matches
      if (matchesRes.status === 'fulfilled' && Array.isArray(matchesRes.value?.data)) {
        const matches = matchesRes.value.data;
        if (matches.length > 0) {
          const sortedMatches = [...matches].sort((a, b) => new Date(b.analyzedAt || 0) - new Date(a.analyzedAt || 0));
          const latestMatch = sortedMatches[0];
          const companyStr = latestMatch.company ? ` at ${latestMatch.company}` : '';
          realNotifs.push({
            id: `match-${latestMatch.id}`,
            title: 'Job Match Evaluated',
            text: `${latestMatch.jobTitle || 'Role'}${companyStr} • Match: ${latestMatch.overallScore}%`,
            time: formatRelativeTime(latestMatch.analyzedAt),
            timestamp: new Date(latestMatch.analyzedAt || 0).getTime(),
            link: '/dashboard/jobs',
            state: { jobTitle: latestMatch.jobTitle, company: latestMatch.company }
          });

          sortedMatches.slice(0, 5).forEach(m => {
            if (m.jobTitle) {
              dynamicSearchList.push({
                type: 'Job Match',
                title: m.jobTitle,
                company: m.company || 'Analyzed Match',
                location: `${m.overallScore}% Compatibility`,
                link: '/dashboard/jobs'
              });
            }
          });
        }
      }

      // 3. Real Resumes
      if (resumesRes.status === 'fulfilled' && Array.isArray(resumesRes.value?.data)) {
        const resumes = resumesRes.value.data;
        if (resumes.length > 0) {
          const sortedResumes = [...resumes].sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
          const latestResume = sortedResumes[0];
          const skillCount = latestResume.detectedSkills ? latestResume.detectedSkills.length : 0;
          realNotifs.push({
            id: `resume-${latestResume.id}`,
            title: 'Resume Analyzed',
            text: `${latestResume.originalFileName || 'Resume'} • ATS: ${latestResume.atsScore}/100 • ${skillCount} skills identified`,
            time: formatRelativeTime(latestResume.uploadedAt),
            timestamp: new Date(latestResume.uploadedAt || 0).getTime(),
            link: '/dashboard/history'
          });

          if (latestResume.detectedSkills) {
            latestResume.detectedSkills.slice(0, 15).forEach(skill => {
              dynamicSearchList.push({
                type: 'Skill Profile',
                title: skill,
                location: 'Detected in Resume',
                link: '/dashboard/skills'
              });
            });
          }
        }
      }

      setSearchItems(dynamicSearchList);

      // Sort notifications by timestamp descending
      realNotifs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      // Filter dismissed
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const dismissedKey = `dismissed_notifs_${currentUser.email || 'user'}`;
      const dismissed = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
      const activeNotifs = realNotifs.filter(n => !dismissed.includes(n.id));

      setNotifications(activeNotifs);
    } catch (err) {
      console.error("Error fetching real notifications:", err);
    }
  };

  const clearAll = () => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const dismissedKey = `dismissed_notifs_${currentUser.email || 'user'}`;
    const dismissed = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
    const newDismissed = Array.from(new Set([...dismissed, ...notifications.map(n => n.id)]));
    localStorage.setItem(dismissedKey, JSON.stringify(newDismissed));
    setNotifications([]);
  };

  const dismissOne = (notifId) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const dismissedKey = `dismissed_notifs_${currentUser.email || 'user'}`;
    const dismissed = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
    const newDismissed = Array.from(new Set([...dismissed, notifId]));
    localStorage.setItem(dismissedKey, JSON.stringify(newDismissed));
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  const unreadCount = notifications.length;

  useEffect(() => {
    // Purge old mock notifications from previous versions if present
    try {
      const rawStored = localStorage.getItem('notifications');
      if (rawStored && (rawStored.includes('Stripe') || rawStored.includes('15%') || rawStored.includes('Senior React'))) {
        localStorage.removeItem('notifications');
      }
    } catch (e) {}

    fetchRealNotifications();

    const handleRealtimeUpdate = () => {
      fetchRealNotifications();
    };

    window.addEventListener('resume-uploaded', handleRealtimeUpdate);
    window.addEventListener('match-created', handleRealtimeUpdate);
    window.addEventListener('assessment-completed', handleRealtimeUpdate);
    window.addEventListener('roadmap-updated', handleRealtimeUpdate);

    return () => {
      window.removeEventListener('resume-uploaded', handleRealtimeUpdate);
      window.removeEventListener('match-created', handleRealtimeUpdate);
      window.removeEventListener('assessment-completed', handleRealtimeUpdate);
      window.removeEventListener('roadmap-updated', handleRealtimeUpdate);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load actual user from localStorage
  const loadUser = () => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : {
      name: 'User',
      email: 'user@example.com',
    };
  };

  const [user, setUser] = useState(loadUser());

  useEffect(() => {
    const handleUserUpdate = () => setUser(loadUser());
    window.addEventListener('user-updated', handleUserUpdate);
    return () => window.removeEventListener('user-updated', handleUserUpdate);
  }, []);
  
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    navigate('/');
  };

  const NavItem = ({ item, onClick }) => (
    <NavLink
      to={item.href}
      end={item.href === '/dashboard'}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
          isActive 
            ? "bg-indigo-50 text-indigo-700 dark:bg-white/10 dark:text-white" 
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon className={cn("mr-3 h-5 w-5 shrink-0 transition-colors", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-500")} />
          {item.name}
        </>
      )}
    </NavLink>
  );

  const filteredResults = searchQuery 
    ? searchItems.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (r.location && r.location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row dark:bg-slate-900">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 dark:bg-slate-800 dark:border-slate-700",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-700">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">SkillMatch AI</span>
            </Link>
          </div>

          <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
            <div className="py-4 px-3 space-y-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3 mt-2">Overview</div>
              {navigation.slice(0, 1).map((item) => <NavItem key={item.name} item={item} onClick={() => setSidebarOpen(false)} />)}
              
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3 mt-6">Resume & Jobs</div>
              {navigation.slice(1, 4).map((item) => <NavItem key={item.name} item={item} onClick={() => setSidebarOpen(false)} />)}
              
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3 mt-6">Learning & Skills</div>
              {navigation.slice(4, 9).map((item) => <NavItem key={item.name} item={item} onClick={() => setSidebarOpen(false)} />)}
            </div>

            {/* Bottom Actions - Pushed to bottom of scrollable area */}
            <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-700">
              <NavItem item={navigation[9]} onClick={() => setSidebarOpen(false)} />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-rose-600 rounded-lg hover:bg-rose-50 transition-colors mt-1 dark:text-rose-400 dark:hover:bg-rose-950/50"
              >
                <LogOut className="mr-3 h-5 w-5 shrink-0" />
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0 dark:bg-slate-800 dark:border-slate-700">
          
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-bold text-lg text-slate-900 dark:text-white">SkillMatch AI</span>
          </div>

          {/* Header Right */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Search Bar (Hidden on small screens) */}
            <div className="hidden lg:flex relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                placeholder="Search skills, jobs, resources..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-64 dark:bg-slate-900 dark:text-white"
              />
              
              {/* Search Dropdown */}
              {showSearch && searchQuery && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in duration-200">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((result, idx) => (
                      <Link 
                        key={idx} 
                        to={result.link}
                        state={{ jobTitle: result.title, company: result.company || '' }}
                        onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                        className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{result.title}</span>
                          <span className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">{result.type}</span>
                        </div>
                        {result.location && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{result.location}</p>}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={clearAll} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium dark:text-indigo-400">
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <Link 
                          key={notif.id} 
                          to={notif.link}
                          state={notif.state}
                          className="block px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors cursor-pointer bg-indigo-50/20 dark:bg-indigo-900/10"
                          onClick={() => {
                            dismissOne(notif.id);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{notif.title}</span>
                            <span className="text-[11px] text-slate-400 font-medium">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug font-medium">{notif.text}</p>
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">All caught up!</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                          Real-time updates from your resume scans, job matches, and assessments will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full py-1 pr-2 pl-1 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {user.profilePhoto ? (
                  <img 
                    src={user.profilePhoto} 
                    alt={user.name} 
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="hidden sm:block text-left mr-1">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user.name.split(' ')[0]}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    {user.profilePhoto ? (
                      <img 
                        src={user.profilePhoto} 
                        alt={user.name} 
                        className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-600 object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold shrink-0">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link 
                    to="/dashboard/settings" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" /> Account Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative p-4 sm:p-6 lg:p-8 custom-scrollbar print:overflow-visible print:bg-white print:block">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
