import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { BrainCircuit, Sparkles, CheckCircle2, Briefcase, ShieldCheck, ArrowLeft } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      
      {/* ─── Animated Ambient Glow Orbs ─── */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-500/15 rounded-full blur-3xl animate-float-drift pointer-events-none" />
      <div className="absolute -bottom-36 -right-32 w-[32rem] h-[32rem] bg-purple-500/20 dark:bg-purple-600/15 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-80 h-80 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-violet-400/15 dark:bg-violet-600/10 rounded-full blur-3xl animate-float-reverse pointer-events-none" />

      {/* ─── Modern Tech Dot Grid Pattern with Vignette ─── */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#6366f1_1.25px,transparent_1.25px)] [background-size:28px_28px] opacity-[0.22] dark:opacity-[0.18] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" 
      />

      {/* ─── Top Navigation Bar ─── */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-all bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
      </div>

      {/* ─── Floating Decorative Feature Badges (Desktop) ─── */}
      {/* Badge 1: Top-Left */}
      <div className="hidden xl:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-indigo-100 dark:border-indigo-900/50 shadow-xl shadow-indigo-500/5 animate-float-slow pointer-events-none absolute top-24 left-12 2xl:left-28 z-10">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">AI ATS Scoring</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> 98% Match Accuracy
          </p>
        </div>
      </div>

      {/* Badge 2: Bottom-Left */}
      <div className="hidden xl:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-purple-100 dark:border-purple-900/50 shadow-xl shadow-purple-500/5 animate-float-reverse pointer-events-none absolute bottom-24 left-10 2xl:left-24 z-10">
        <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <BrainCircuit className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Skill Gap Matrix</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">1,500+ Tech Skills Indexed</p>
        </div>
      </div>

      {/* Badge 3: Top-Right */}
      <div className="hidden xl:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-sky-100 dark:border-sky-900/50 shadow-xl shadow-sky-500/5 animate-float-reverse pointer-events-none absolute top-24 right-12 2xl:right-28 z-10">
        <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
          <Briefcase className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Live Job Matching</p>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Real-time Role Alignment</p>
        </div>
      </div>

      {/* Badge 4: Bottom-Right */}
      <div className="hidden xl:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-emerald-100 dark:border-emerald-900/50 shadow-xl shadow-emerald-500/5 animate-float-slow pointer-events-none absolute bottom-24 right-10 2xl:right-24 z-10">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Enterprise Security</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">100% Private & Encrypted</p>
        </div>
      </div>

      {/* ─── Main Content Container ─── */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Logo with Ambient Glow */}
        <div className="text-center mb-6">
          <NavLink to="/" className="inline-flex items-center justify-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/30 rounded-xl blur-md group-hover:bg-indigo-500/50 transition-all" />
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
