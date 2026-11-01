import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { BrainCircuit, ArrowLeft } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      
      {/* ─── Soft Central Ambient Glow Behind Card ─── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-indigo-500/12 via-violet-500/10 to-indigo-400/8 rounded-full blur-3xl pointer-events-none [transform:translateZ(0)]" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-indigo-100/40 dark:from-indigo-950/20 to-transparent rounded-full blur-3xl pointer-events-none [transform:translateZ(0)]" />

      {/* ─── Top Navigation Bar ─── */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-all bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow hover:border-indigo-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
      </div>

      {/* ─── Main Content Container ─── */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Logo with Ambient Glow */}
        <div className="text-center mb-6">
          <NavLink to="/" className="inline-flex items-center justify-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/25 rounded-xl blur-md group-hover:bg-indigo-500/40 transition-all" />
              <div className="relative bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-md group-hover:scale-105 transition-transform">
                <BrainCircuit className="h-7 w-7 text-white" />
              </div>
            </div>
            <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 tracking-tight">
              SkillMatch AI
            </span>
          </NavLink>
        </div>

        {/* Auth Outlet (Login / Register Card) */}
        <div className="mt-2">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
