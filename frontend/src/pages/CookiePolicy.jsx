import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookie, Shield, CheckCircle2, Save, ArrowLeft, Info } from 'lucide-react';
import Button from '../components/Button';
import Badge from '../components/Badge';

const CookiePolicy = () => {
  const navigate = useNavigate();
  const [functionalCookies, setFunctionalCookies] = useState(true);
  const [analyticsCookies, setAnalyticsCookies] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = () => {
    localStorage.setItem('skillmatch_cookie_functional', functionalCookies);
    localStorage.setItem('skillmatch_cookie_analytics', analyticsCookies);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>
        </div>

        {/* Header Title Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Cookie className="h-6 w-6" />
            </div>
            <div>
              <Badge variant="indigo">Data Storage & Preferences</Badge>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
                Cookie & Storage Policy
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Last Updated: October 17, 2026 • Compliant with Modern Web Privacy Standards
          </p>
        </div>

        {/* Interactive Preference Center Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-8 mb-8 shadow-md">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="h-4 w-4" /> Interactive Preference Center
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-3">Customize Your Storage Settings</h2>
          <p className="text-xs md:text-sm text-slate-300 mb-6 max-w-2xl">
            SkillMatch AI relies on local web storage to keep you securely signed in and preserve your active resume workspaces. You can control non-essential preferences below.
          </p>

          <div className="space-y-4 mb-6">
            {/* Essential */}
            <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between border border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">Essential & Authentication Storage</span>
                  <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">REQUIRED</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Enables secure JWT sessions (`token`), workspace caching, and CSRF protection. Cannot be disabled.
                </p>
              </div>
              <input type="checkbox" checked disabled className="h-5 w-5 accent-indigo-500 rounded cursor-not-allowed opacity-75" />
            </div>

            {/* Functional */}
            <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between border border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">Functional & Interface Preferences</span>
                  <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">OPTIONAL</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Remembers your collapsed sidebar views, roadmap filter selections, and layout preferences.
                </p>
              </div>
              <input 
                type="checkbox" 
                checked={functionalCookies}
                onChange={(e) => setFunctionalCookies(e.target.checked)}
                className="h-5 w-5 accent-indigo-500 rounded cursor-pointer" 
              />
            </div>

            {/* Analytics */}
            <div className="bg-white/10 rounded-2xl p-4 flex items-center justify-between border border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">Performance & Diagnostics</span>
                  <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">OPTIONAL</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Helps us diagnose client-side loading times and UI interaction speeds without collecting personal data.
                </p>
              </div>
              <input 
                type="checkbox" 
                checked={analyticsCookies}
                onChange={(e) => setAnalyticsCookies(e.target.checked)}
                className="h-5 w-5 accent-indigo-500 rounded cursor-pointer" 
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={handleSavePreferences}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              rightIcon={<Save className="h-4 w-4" />}
            >
              Save Preferences
            </Button>
            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-in fade-in">
                <CheckCircle2 className="h-4 w-4" /> Preferences saved successfully!
              </span>
            )}
          </div>
        </div>

        {/* Document Explanation */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm space-y-6 text-slate-700 leading-relaxed text-sm">
          
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. What Are Cookies and Local Storage?</h2>
            <p>
              Cookies and Web Storage (such as HTML5 `localStorage` and `sessionStorage`) are small pieces of data stored on your computer or mobile device by your browser. They allow modern web applications to maintain state across pages without repeatedly demanding your login password.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Exact Keys Stored by SkillMatch AI</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Key Name</th>
                    <th className="p-3">Storage Type</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-3 font-mono font-semibold text-indigo-600">token</td>
                    <td className="p-3">localStorage</td>
                    <td className="p-3">Signed JWT Bearer token for authenticated backend API requests</td>
                    <td className="p-3">Session / 24 Hours</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-indigo-600">user</td>
                    <td className="p-3">localStorage</td>
                    <td className="p-3">Current user profile metadata (name, email) for top bar display</td>
                    <td className="p-3">Session / 24 Hours</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-indigo-600">active_workspace</td>
                    <td className="p-3">localStorage</td>
                    <td className="p-3">Preserves current active resume match between page reloads</td>
                    <td className="p-3">Persistent until cleared</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. How to Clear Browser Data</h2>
            <p className="mb-2">
              You can manually inspect or clear your stored data at any time via your browser settings:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
              <li><strong>Google Chrome:</strong> Settings &gt; Privacy and Security &gt; Delete browsing data.</li>
              <li><strong>Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data &gt; Clear Data.</li>
              <li><strong>Microsoft Edge:</strong> Settings &gt; Privacy, search, and services &gt; Clear browsing data.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
