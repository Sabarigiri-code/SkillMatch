import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { BrainCircuit, Menu, X, ExternalLink, Globe, ArrowUp, Mail, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => {
      setSubscribed(false);
    }, 6000);
  };

  const navigateToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink 
              to="/" 
              className="flex items-center gap-2 group"
              onClick={scrollToTop}
            >
              <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors shadow-xs">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                SkillMatch AI
              </span>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => navigateToSection('about')} 
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                About
              </button>
              <button 
                onClick={() => navigateToSection('how-it-works')} 
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button 
                onClick={() => navigateToSection('features')} 
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button 
                onClick={() => navigateToSection('ai-capabilities')} 
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                AI Capabilities
              </button>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
              <Button variant="primary" onClick={() => navigate('/register')}>Get Started</Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-indigo-600 focus:outline-none p-1"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg absolute w-full animate-in fade-in slide-in-from-top-2">
            <button 
              onClick={() => navigateToSection('about')} 
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"
            >
              About
            </button>
            <button 
              onClick={() => navigateToSection('how-it-works')} 
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"
            >
              How It Works
            </button>
            <button 
              onClick={() => navigateToSection('features')} 
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"
            >
              Features
            </button>
            <button 
              onClick={() => navigateToSection('ai-capabilities')} 
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50"
            >
              AI Capabilities
            </button>
            <div className="pt-4 flex flex-col gap-2">
              <Button variant="secondary" className="w-full" onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}>Login</Button>
              <Button variant="primary" className="w-full" onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }}>Get Started</Button>
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex flex-col pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Newsletter / Stay Ahead Banner */}
          <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-800/90 via-slate-800 to-indigo-950/60 border border-slate-700/60 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3 border border-indigo-500/20">
                <Sparkles className="h-3.5 w-3.5" /> Stay Ahead in Tech
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Get Weekly AI Career & Hiring Insights
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Curated resume tips, in-demand skill breakdowns, and interview questions delivered straight to your inbox.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative min-w-[280px]">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                />
              </div>
              <Button 
                type="submit"
                variant="primary"
                className="whitespace-nowrap px-5 py-2.5 shadow-md hover:shadow-indigo-500/25 cursor-pointer"
              >
                {subscribed ? 'Subscribed! 🎉' : 'Subscribe'}
              </Button>
            </form>
          </div>

          {/* 5-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-14">
            
            {/* Column 1: Brand & Bio */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div 
                className="flex items-center gap-2 mb-4 cursor-pointer group inline-flex"
                onClick={() => {
                  if (location.pathname !== '/') navigate('/');
                  scrollToTop();
                }}
              >
                <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-500 transition-colors">
                  <BrainCircuit className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  SkillMatch AI
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Intelligent AI career intelligence. Analyze resumes, discover critical skill gaps, match with real jobs, and master technical interviews.
              </p>
              
              {/* Social Icons */}
              <div className="flex space-x-3 mb-6">
                <button 
                  onClick={() => {
                    if (location.pathname !== '/') navigate('/');
                    scrollToTop();
                  }}
                  title="Official Website"
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                >
                  <Globe className="h-4 w-4" />
                </button>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="GitHub"
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="LinkedIn"
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a 
                  href="https://x.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="X (Twitter)"
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                100% Privacy Protected
              </div>
            </div>
            
            {/* Column 2: Platform Solutions */}
            <div>
              <h3 className="font-semibold text-white mb-5 uppercase tracking-wider text-xs">Platform</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/dashboard/resume" className="hover:text-indigo-400 transition-colors">
                    Resume Analyzer
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/jobs" className="hover:text-indigo-400 transition-colors">
                    Job Matcher
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/skills" className="hover:text-indigo-400 transition-colors">
                    Skill Gap Analysis
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/roadmap" className="hover:text-indigo-400 transition-colors">
                    Learning Roadmap
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/interview" className="hover:text-indigo-400 transition-colors">
                    AI Mock Interview
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/progress" className="hover:text-indigo-400 transition-colors">
                    Progress Tracker
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h3 className="font-semibold text-white mb-5 uppercase tracking-wider text-xs">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link 
                    to="/docs" 
                    className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1 group"
                  >
                    Documentation 
                    <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-indigo-400 transition-colors">
                    Blog & Guides
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-indigo-400 transition-colors">
                    Help Center & FAQ
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => navigateToSection('how-it-works')} 
                    className="hover:text-indigo-400 transition-colors text-left"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigateToSection('features')} 
                    className="hover:text-indigo-400 transition-colors text-left"
                  >
                    Platform Features
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal & Policy */}
            <div>
              <h3 className="font-semibold text-white mb-5 uppercase tracking-wider text-xs">Legal & Trust</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/privacy" className="hover:text-indigo-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-indigo-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:text-indigo-400 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-indigo-400 transition-colors">
                    Data Encryption & Security
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-indigo-400 transition-colors">
                    AI Transparency & Ethics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Contact & Support */}
            <div>
              <h3 className="font-semibold text-white mb-5 uppercase tracking-wider text-xs">Contact & Office</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Direct Support</span>
                  <a 
                    href="mailto:support@skillmatchai.com" 
                    className="text-white hover:text-indigo-400 transition-colors inline-flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4 text-indigo-400" />
                    <span>support@skillmatchai.com</span>
                  </a>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">Office Location</span>
                  <div className="text-slate-300 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Salem, Tamil Nadu, India</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs text-slate-300 font-medium">24/7 AI Career Support</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <p>
                &copy; {new Date().getFullYear()} SkillMatch AI. All rights reserved.
              </p>
              <span className="hidden sm:inline text-slate-700">•</span>
              <p className="text-slate-400">
                Engineered with precision for ambitious career builders.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>All systems operational</span>
              </div>

              {/* Back to top button */}
              <button 
                onClick={scrollToTop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs font-medium cursor-pointer"
              >
                <ArrowUp className="h-3.5 w-3.5" /> Back to Top
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
