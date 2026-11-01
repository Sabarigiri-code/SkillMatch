import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Brain, Target, Compass, FileText, 
  Search, LineChart, Briefcase, ChevronRight, Zap, CheckCircle2, Award, BookOpen,
  BrainCircuit, TrendingUp, Code, Cpu, Cloud, Laptop, Star, Users, Flame,
  Mic, Volume2, Square, Play, Layers, ShieldCheck, Check, Clock
} from 'lucide-react';
import Button from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Badge from '../components/Badge';

const FEATURED_ROLES = [
  {
    title: "Full Stack Engineer",
    icon: Code,
    badge: "Most Popular",
    company: "Tier-1 Tech Enterprises",
    matchScore: 96,
    salary: "$135,000 / yr",
    matchedSkills: ["React 19", "Spring Boot", "TypeScript", "MongoDB", "REST APIs"],
    skillGap: "GraphQL & Docker",
    interviewQ: "How do you handle distributed caching with Redis and maintain database consistency across microservices?",
    sampleAnswer: "By implementing the Cache-Aside pattern with TTL and asynchronous cache invalidation via Kafka events.",
    roadmapMilestone: "Week 3: Microservices & Event-Driven Architecture",
    resumeFilename: "alex_chen_fullstack_resume.pdf"
  },
  {
    title: "AI & ML Solutions",
    icon: Cpu,
    badge: "High Demand",
    company: "Generative AI Labs",
    matchScore: 94,
    salary: "$155,000 / yr",
    matchedSkills: ["Python", "PyTorch", "LLM Fine-Tuning", "RAG Pipelines", "FastAPI"],
    skillGap: "Vector DB Sharding",
    interviewQ: "Compare dense embeddings with hybrid BM25 search in high-throughput RAG systems.",
    sampleAnswer: "Hybrid search balances semantic recall with exact keyword precision, re-ranked via cross-encoders.",
    roadmapMilestone: "Week 4: LLM Evaluation Rubrics & LangChain Agent Orchestration",
    resumeFilename: "sarah_ai_engineer_resume.pdf"
  },
  {
    title: "Cloud DevOps & SRE",
    icon: Cloud,
    badge: "Fast Hiring",
    company: "Global Cloud Platforms",
    matchScore: 92,
    salary: "$142,000 / yr",
    matchedSkills: ["Kubernetes", "AWS Cloud", "Terraform", "CI/CD Pipelines", "Prometheus"],
    skillGap: "eBPF Observability",
    interviewQ: "Walk through how you design zero-downtime blue-green deployments on Kubernetes with automated rollbacks.",
    sampleAnswer: "Using Kubernetes Services with weighted traffic routing via Istio Service Mesh and automated health check probes.",
    roadmapMilestone: "Week 2: Multi-Region High Availability & Disaster Recovery",
    resumeFilename: "jordan_devops_resume.pdf"
  },
  {
    title: "Frontend Architect",
    icon: Laptop,
    badge: "Trending",
    company: "Next-Gen Fintech",
    matchScore: 98,
    salary: "$140,000 / yr",
    matchedSkills: ["React", "Next.js", "Web Performance", "State Architecture", "Tailwind CSS"],
    skillGap: "WebAssembly (WASM)",
    interviewQ: "How would you optimize Core Web Vitals (LCP, INP, CLS) for a high-traffic dynamic dashboard?",
    sampleAnswer: "Code-splitting critical bundles, lazy-loading offscreen components, and reducing main-thread JS execution.",
    roadmapMilestone: "Week 3: Advanced Hydration & Micro-Frontends",
    resumeFilename: "elena_frontend_resume.pdf"
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner', 'interview', 'roadmap'
  const [simulatedVoiceActive, setSimulatedVoiceActive] = useState(false);
  const [simulatedSeconds, setSimulatedSeconds] = useState(14);

  const activeRole = FEATURED_ROLES[selectedRoleIdx] || FEATURED_ROLES[0];

  useEffect(() => {
    let interval = null;
    if (simulatedVoiceActive) {
      interval = setInterval(() => {
        setSimulatedSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulatedVoiceActive]);

  const handleAnalyzeClick = () => {
    // Clear old login session to force a fresh login
    localStorage.clear();
    // Redirect to login, but tell it to return to the resume analyzer after auth!
    navigate('/login', { state: { returnTo: '/dashboard/resume' } });
  };

  const handleSessionLaunch = (path) => {
    localStorage.clear();
    navigate('/login', { state: { returnTo: path } });
  };

  const handleSessionPillClick = (sessionKey) => {
    if (sessionKey === 'scanner' || sessionKey === 'gap') {
      setActiveTab('scanner');
    } else if (sessionKey === 'roadmap') {
      setActiveTab('roadmap');
    } else if (sessionKey === 'interview') {
      setActiveTab('interview');
      setSimulatedVoiceActive(true);
    }

    const demoSection = document.getElementById('demo-showcase');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Ambient Mesh Gradients & Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-tr from-indigo-400/25 via-violet-400/20 to-fuchsia-400/15 rounded-full blur-3xl pointer-events-none [transform:translateZ(0)] will-change-transform [contain:paint]" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none [transform:translateZ(0)] will-change-transform [contain:paint]" />
        <div className="absolute top-1/3 -left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none [transform:translateZ(0)] will-change-transform [contain:paint]" />
        
        {/* Subtle Engineering Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0e7ff_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none [transform:translateZ(0)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-indigo-200/80 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)] text-indigo-700 text-xs sm:text-sm font-semibold mb-6 hover:border-indigo-300 transition-all cursor-pointer group [transform:translateZ(0)]">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 -ml-4" />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent font-bold">
              ✨ Real-Time Voice AI Mock Interviews Active
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium hidden sm:inline">Powered by Gemini 2.5</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Hero Headlines */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Know Your Skills. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
              Match Your Career.
            </span>
          </h1>
          
          <p className="mt-4 max-w-2xl text-lg sm:text-xl text-slate-600 mx-auto mb-8 leading-relaxed">
            Instant ATS resume intelligence, deep technical skill gap detection, and interactive voice mock interviews tailored to top tech companies.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
            <Button 
              size="lg"
              onClick={handleAnalyzeClick}
              rightIcon={<ArrowRight className="h-5 w-5" />}
              className="w-full sm:w-auto rounded-full font-semibold px-9 py-4 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all text-base"
            >
              Analyze My Resume
            </Button>
            <Button 
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto rounded-full font-semibold px-8 py-4 border-2 border-slate-200 bg-white hover:bg-indigo-50/70 hover:border-indigo-300 hover:text-indigo-700 transition-all duration-300 group text-base shadow-sm"
              onClick={() => document.getElementById('demo-showcase')?.scrollIntoView({ behavior: 'smooth' })}
              leftIcon={<Sparkles className="h-5 w-5 text-indigo-500 group-hover:rotate-12 transition-transform" />}
            >
              Explore Interactive Demo
            </Button>
          </div>

          {/* Authentic Platform Sessions Pipeline Bar (Interactive Buttons) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Platform Sessions Suite:
            </span>
            <button
              type="button"
              id="pill-ats-scanner"
              onClick={() => handleSessionPillClick('scanner')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border shadow-sm font-semibold text-xs cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                activeTab === 'scanner'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
                  : 'bg-white/90 text-slate-700 border-slate-200/90 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${activeTab === 'scanner' ? 'text-white' : 'text-indigo-600'}`} />
              <span>ATS Resume Parser</span>
            </button>
            <button
              type="button"
              id="pill-skill-gap"
              onClick={() => handleSessionPillClick('gap')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border shadow-sm font-semibold text-xs cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                activeTab === 'scanner'
                  ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                  : 'bg-white/90 text-slate-700 border-slate-200/90 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-violet-600" />
              <span>Skill Gap Diagnostics</span>
            </button>
            <button
              type="button"
              id="pill-roadmap"
              onClick={() => handleSessionPillClick('roadmap')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border shadow-sm font-semibold text-xs cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200'
                  : 'bg-white/90 text-slate-700 border-slate-200/90 hover:border-emerald-300 hover:text-emerald-600'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${activeTab === 'roadmap' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Personalized Roadmap</span>
            </button>
            <button
              type="button"
              id="pill-voice-interview"
              onClick={() => handleSessionPillClick('interview')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border shadow-sm font-semibold text-xs cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                activeTab === 'interview'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
                  : 'bg-indigo-50/90 text-indigo-700 border-indigo-200 hover:border-indigo-400'
              }`}
            >
              <Mic className={`w-3.5 h-3.5 ${activeTab === 'interview' ? 'text-white' : 'text-indigo-600'}`} />
              <span>Voice AI Mock Interview</span>
            </button>
          </div>

          {/* Role Filter Selector */}
          <div id="demo-showcase" className="mb-9 flex flex-wrap justify-center items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" /> Select Target Track:
            </span>
            {FEATURED_ROLES.map((role, idx) => {
              const RoleIcon = role.icon;
              const isSelected = selectedRoleIdx === idx;
              return (
                <button
                  key={role.title}
                  onClick={() => setSelectedRoleIdx(idx)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                      : 'bg-white/80 text-slate-600 border border-slate-200/80 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 shadow-sm'
                  }`}
                >
                  <RoleIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                  <span>{role.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {role.matchScore}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Showcase Window with Floating Glass Badges */}
          <div className="relative mx-auto max-w-5xl [transform:translateZ(0)]">
            {/* Floating Glassmorphic Badge 1 (Top Left) */}
            <div className="hidden lg:flex absolute top-14 -left-10 bg-white/95 border border-emerald-200 shadow-xl rounded-2xl p-3.5 items-center gap-3 z-20 animate-bounce duration-1000 [transform:translateZ(0)]" style={{ animationDuration: '4s' }}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">98.4% ATS Compatibility</div>
                <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> Passed Top 5 ATS Scanners
                </div>
              </div>
            </div>

            {/* Floating Glassmorphic Badge 2 (Bottom Right) */}
            <div className="hidden lg:flex absolute -bottom-5 -right-6 bg-white/95 border border-indigo-200 shadow-xl rounded-2xl p-3.5 items-center gap-3 z-20 animate-bounce duration-1000 [transform:translateZ(0)]" style={{ animationDuration: '4.5s', animationDelay: '1s' }}>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Mic className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">Voice AI Feedback Active</div>
                <div className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                  Live Speech-to-Text Rubrics
                </div>
              </div>
            </div>

            {/* Main Interactive Showcase Container */}
            <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-[0_25px_70px_-15px_rgba(79,70,229,0.18)] overflow-hidden text-left [transform:translateZ(0)]">
              
              {/* Window Header Bar with Live Tabs */}
              <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block" />
                  </div>
                  <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline">
                    skillmatch-engine://{activeRole.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ai
                  </span>
                </div>

                {/* Tab Switchers */}
                <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('scanner')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'scanner'
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>ATS Scanner</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('interview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'interview'
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Voice Mock Interview</span>
                    <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">New</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('roadmap')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'roadmap'
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Career Roadmap</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: ATS Resume Scanner */}
              {activeTab === 'scanner' && (
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Left: Resume Document Preview with Laser Scan */}
                    <div className="md:col-span-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/90 p-5 relative overflow-hidden shadow-sm group">
                      {/* Laser Line */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_18px_rgba(99,102,241,0.9)] z-10 pointer-events-none will-change-transform [transform:translateZ(0)]"
                        style={{
                          animation: 'laserScan 3.5s ease-in-out infinite'
                        }}
                      />

                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{activeRole.resumeFilename}</div>
                            <div className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                              <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} /> AI Parsing Active
                            </div>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Verified PDF
                        </span>
                      </div>

                      {/* Detected Skills Chips */}
                      <div className="mb-4">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                          Extracted Core Competencies
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {activeRole.matchedSkills.map(skill => (
                            <span key={skill} className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold px-2 py-0.5 rounded-lg">
                              ✓ {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Mock Text Lines */}
                      <div className="space-y-2 opacity-50 pt-2 border-t border-slate-100">
                        <div className="h-2 w-5/6 bg-slate-300 rounded-full" />
                        <div className="h-2 w-full bg-slate-200 rounded-full" />
                        <div className="h-2 w-3/4 bg-slate-300 rounded-full" />
                      </div>
                    </div>

                    {/* Middle: AI Neural Core */}
                    <div className="hidden md:flex md:col-span-2 flex-col items-center justify-center relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-300/50 relative z-10 animate-pulse">
                        <BrainCircuit className="h-7 w-7" />
                      </div>
                      <div className="text-center mt-2">
                        <div className="text-[11px] font-bold text-indigo-600">Gemini 2.5</div>
                        <div className="text-[10px] text-slate-400">1.2s Parse Speed</div>
                      </div>
                    </div>

                    {/* Right: Real-Time Match Output */}
                    <div className="md:col-span-5 flex flex-col gap-3.5">
                      {/* Match Card */}
                      <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Target Match Score
                          </span>
                          <span className="bg-emerald-500 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-sm">
                            {activeRole.matchScore}% Match
                          </span>
                        </div>
                        <div className="text-base font-extrabold text-slate-900">{activeRole.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{activeRole.company}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">{activeRole.salary}</span>
                        </div>
                      </div>

                      {/* Skill Gap Card */}
                      <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-500" /> High-Impact Skill Gap
                          </span>
                          <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                            Priority #1
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">
                          Add <strong className="text-amber-700 font-bold">{activeRole.skillGap}</strong> to unlock senior tier interview shortlists.
                        </p>
                      </div>

                      {/* Quick Action Button */}
                      <Button
                        size="sm"
                        onClick={handleAnalyzeClick}
                        className="w-full rounded-xl justify-center font-bold text-xs py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:shadow-indigo-500/25"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Scan Your Own Resume Now
                      </Button>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: Voice Mock Interview Live Simulation */}
              {activeTab === 'interview' && (
                <div className="p-6 md:p-8 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white">
                  <div className="max-w-3xl mx-auto">
                    
                    {/* Role Header */}
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-indigo-900/60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                          <Mic className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                            Interactive Voice Interview Room
                          </div>
                          <div className="text-sm font-extrabold text-white">{activeRole.title} Track</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-emerald-300 font-medium font-mono">Gemini Voice Agent Ready</span>
                      </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-indigo-900/40 rounded-2xl border border-indigo-500/20 p-4 mb-5">
                      <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Technical Question:
                      </div>
                      <p className="text-sm md:text-base font-semibold text-white leading-relaxed">
                        "{activeRole.interviewQ}"
                      </p>
                    </div>

                    {/* Voice Recording Simulation Visualizer */}
                    <div className="bg-slate-950/70 rounded-2xl border border-indigo-800/50 p-5 mb-5">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSimulatedVoiceActive(!simulatedVoiceActive)}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                              simulatedVoiceActive
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50 animate-pulse'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/40'
                            }`}
                          >
                            {simulatedVoiceActive ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                          </button>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              {simulatedVoiceActive ? (
                                <>
                                  <span className="text-rose-400">Recording Live Voice...</span>
                                  <span className="text-xs font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                                    00:{simulatedSeconds < 10 ? `0${simulatedSeconds}` : simulatedSeconds}
                                  </span>
                                </>
                              ) : (
                                <span className="text-indigo-200">Click to Simulate Voice Answer</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Direct microphone speech-to-text with database audio archiving
                            </div>
                          </div>
                        </div>

                        {/* Animated Equalizer Sound Bars */}
                        <div className="flex items-center gap-1 h-8 px-3 py-1 bg-indigo-950/80 rounded-xl border border-indigo-800/40">
                          {[12, 24, 18, 30, 16, 28, 22, 14, 26, 20].map((height, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full transition-all duration-150 ${
                                simulatedVoiceActive ? 'bg-gradient-to-t from-indigo-400 to-fuchsia-400' : 'bg-indigo-900'
                              }`}
                              style={{
                                height: simulatedVoiceActive ? `${Math.max(6, (height + (i % 3) * 6)) % 28 + 4}px` : '6px',
                                animation: simulatedVoiceActive ? `waveform ${0.5 + (i % 5) * 0.15}s ease-in-out infinite alternate` : 'none'
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Live Transcription Box */}
                      <div className="bg-indigo-950/60 rounded-xl p-3 border border-indigo-800/30">
                        <div className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider mb-1 flex items-center justify-between">
                          <span>Speech Transcription (Live Preview):</span>
                          <span className="text-emerald-400 font-mono text-[10px]">Confidence: 98.4%</span>
                        </div>
                        <p className="text-xs text-indigo-100 font-mono italic leading-relaxed">
                          "{activeRole.sampleAnswer}"
                        </p>
                      </div>
                    </div>

                    {/* Instant AI Evaluation Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-indigo-900/30 rounded-xl p-3 border border-indigo-500/20 text-center">
                        <div className="text-[10px] uppercase font-bold text-indigo-300">Technical Depth</div>
                        <div className="text-lg font-extrabold text-emerald-400 mt-0.5">95 / 100</div>
                      </div>
                      <div className="bg-indigo-900/30 rounded-xl p-3 border border-indigo-500/20 text-center">
                        <div className="text-[10px] uppercase font-bold text-indigo-300">Delivery & Clarity</div>
                        <div className="text-lg font-extrabold text-indigo-300 mt-0.5">92 / 100</div>
                      </div>
                      <div className="bg-indigo-900/30 rounded-xl p-3 border border-indigo-500/20 text-center">
                        <div className="text-[10px] uppercase font-bold text-indigo-300">Overall Readiness</div>
                        <div className="text-lg font-extrabold text-fuchsia-400 mt-0.5">Top 5%</div>
                      </div>
                    </div>

                    {/* Direct Action Button */}
                    <div className="mt-5">
                      <Button
                        size="sm"
                        onClick={() => handleSessionLaunch('/dashboard/interview')}
                        className="w-full rounded-xl justify-center font-bold text-xs py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md hover:shadow-indigo-500/25"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Enter Real Voice Interview Room Now
                      </Button>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: Career Roadmap */}
              {activeTab === 'roadmap' && (
                <div className="p-6 md:p-8">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          4-Week Precision Plan
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900">
                          Accelerate to Senior {activeRole.title}
                        </h4>
                      </div>
                      <Badge variant="success" className="font-bold text-xs">
                        Target: {activeRole.salary}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {/* Step 1 */}
                      <div className="flex items-start gap-4 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                          ✓
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">Phase 1: Core Framework Mastery</span>
                            <span className="text-[11px] text-emerald-600 font-bold">100% Completed</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Proficiency validated in {activeRole.matchedSkills.slice(0, 3).join(', ')}.
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex items-start gap-4 p-3.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800/80">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                          2
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-100">{activeRole.roadmapMilestone}</span>
                            <span className="text-[11px] text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                              In Progress
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            Deep-dive module closing skill gap in <strong>{activeRole.skillGap}</strong>.
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex items-start gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                        <div className="w-8 h-8 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 font-bold text-xs">
                          3
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Phase 3: Tier-1 Tech Mock Interviews</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Scheduled Week 4</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            AI-evaluated behavioral and technical system design voice sessions.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Direct Action Button */}
                    <div className="mt-6">
                      <Button
                        size="sm"
                        onClick={() => handleSessionLaunch('/dashboard/roadmap')}
                        className="w-full rounded-xl justify-center font-bold text-xs py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white shadow-md hover:shadow-emerald-500/25"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Generate Your Personalized Roadmap
                      </Button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Keyframe Styles for Laser & Waveform */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes laserScan {
              0% { transform: translate3d(0, 0px, 0); opacity: 0.2; }
              20% { opacity: 1; }
              50% { transform: translate3d(0, 200px, 0); opacity: 0.9; }
              80% { opacity: 1; }
              100% { transform: translate3d(0, 0px, 0); opacity: 0.2; }
            }
            @keyframes waveform {
              0% { transform: scaleY(0.4); }
              100% { transform: scaleY(1.4); }
            }
          `}} />

        </div>
      </section>

      {/* 3. The 4 Core Sessions Inside SkillMatch */}
      <section className="py-20 bg-white border-y border-slate-100 relative overflow-hidden scroll-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Layers className="w-3.5 h-3.5" /> Inside the Application
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              4 Real AI Sessions Built for Your Career Journey
            </h2>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              No generic questionnaires or static advice. Every session inside SkillMatch is powered by live AI models that analyze your authentic data and evaluate your technical skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Session 1: Resume Analysis */}
            <div className="group bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/90 p-6 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-sm">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                    Session 01
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Resume Intelligence</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Upload PDF or Word documents. Automated extraction parses skills, work experience duration, and computes ATS match compatibility.
                </p>
                <div className="bg-white rounded-xl p-3 border border-slate-100 text-xs text-slate-500 space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">Supported Formats:</span>
                    <span className="font-mono text-indigo-600">.PDF, .DOCX</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">Parser Engine:</span>
                    <span className="text-emerald-600 font-semibold">Gemini AI</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleSessionLaunch('/dashboard/resume')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Launch Resume Session</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Session 2: Skill Gap Detection */}
            <div className="group bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/90 p-6 hover:border-violet-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold shadow-sm">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-violet-50 text-violet-700 px-2.5 py-1 rounded-lg border border-violet-100">
                    Session 02
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Skill Gap Diagnostics</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Compares your extracted competencies against target industry roles to pinpoint high-priority missing frameworks and tools.
                </p>
                <div className="bg-white rounded-xl p-3 border border-slate-100 text-xs text-slate-500 space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">Benchmark Roles:</span>
                    <span className="text-violet-600 font-semibold">Live Job Profiles</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">Gap Classification:</span>
                    <span className="text-amber-600 font-semibold">Priority #1 to #3</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleSessionLaunch('/dashboard/skill-gap')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-violet-600 text-slate-700 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Diagnose Skill Gaps</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Session 3: Learning Roadmap */}
            <div className="group bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/90 p-6 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                    <Compass className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                    Session 03
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Learning Roadmap</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  A personalized, phased curriculum structured to systematically close your identified gaps with curated modules and milestone tasks.
                </p>
                <div className="bg-white rounded-xl p-3 border border-slate-100 text-xs text-slate-500 space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">Curriculum Structure:</span>
                    <span className="text-emerald-600 font-semibold">4-Week Milestones</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">Progress Tracking:</span>
                    <span className="text-indigo-600 font-semibold">Interactive Checklist</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleSessionLaunch('/dashboard/roadmap')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>View Learning Path</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Session 4: Voice Mock Interview */}
            <div className="group bg-gradient-to-b from-indigo-900/5 to-white rounded-2xl border-2 border-indigo-200/90 p-6 hover:border-indigo-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                    <Mic className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-lg shadow-sm">
                    Voice Active
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Voice AI Mock Interview</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Practice spoken interview responses with real-time microphone speech-to-text. Evaluated with 0-100 scoring rubrics, strengths & audio saved to database.
                </p>
                <div className="bg-white rounded-xl p-3 border border-indigo-100 text-xs text-slate-500 space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">Audio Input:</span>
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Live Speech-to-Text
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">Persistence:</span>
                    <span className="text-indigo-600 font-semibold">MongoDB Audio Store</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleSessionLaunch('/dashboard/interview')}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <span>Enter Voice Interview</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Quick Session Architecture Summary */}
          <div className="mt-12 bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Complete End-to-End Pipeline in One Account</h4>
                <p className="text-xs text-slate-500">Your resume, identified gaps, roadmap progress, and voice interview recordings stay synced across all sessions.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => handleSessionLaunch('/dashboard/resume')}
                className="rounded-xl font-bold text-xs px-5 py-2.5 cursor-pointer"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Start Session 1
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* 3.5 About Section */}
      <section id="about" className="py-24 bg-white relative overflow-hidden scroll-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6">
                <BrainCircuit className="h-4 w-4" />
                <span>About SkillMatch AI</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Bridging the gap between your potential and your dream career.
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                SkillMatch AI was built to solve a critical problem in the modern job market: highly capable professionals often get filtered out by Applicant Tracking Systems (ATS) simply because they don't know exactly which keywords or skills a specific job requires.
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                We act as your personal AI Career Copilot. We don't just read your resume; we deeply understand your experience, cross-reference it with thousands of real-time job descriptions, and highlight the exact missing links standing between you and your next big offer.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-3xl font-bold text-indigo-600 mb-2">90%</h4>
                  <p className="text-sm text-slate-600 font-medium">Of resumes are rejected by ATS before human review.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-3xl font-bold text-violet-600 mb-2">3x</h4>
                  <p className="text-sm text-slate-600 font-medium">Higher interview rate when using AI skill optimization.</p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-violet-100 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      <Search className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">1. Upload & Analyze</h4>
                      <p className="text-sm text-slate-500 mt-1">Our AI extracts your skills from any format.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-full bg-violet-50 flex items-center justify-center shrink-0">
                      <Target className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">2. Match & Compare</h4>
                      <p className="text-sm text-slate-500 mt-1">We compare your profile against live industry standards.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">3. Optimize & Apply</h4>
                      <p className="text-sm text-slate-500 mt-1">Tailor your resume instantly to beat the ATS.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-24 bg-slate-50 scroll-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Four simple steps to transform your career trajectory.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-slate-200 z-0"></div>
            
            {[
              { title: "Upload Resume", icon: FileText, desc: "Drop your PDF resume for instant AI parsing." },
              { title: "Analyze Skills", icon: Search, desc: "AI identifies your core competencies and strengths." },
              { title: "Match Jobs", icon: Briefcase, desc: "Get matched with open roles requiring your skills." },
              { title: "Build Roadmap", icon: Compass, desc: "Follow a tailored plan to learn missing skills." }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 mb-6 relative">
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                    {idx + 1}
                  </div>
                  <step.icon className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Features Section */}
      <section id="features" className="py-24 bg-white scroll-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-slate-600">Everything you need to land your next big opportunity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: "Resume AI Analysis", desc: "Extracts and evaluates your skills from plain text formatting instantly." },
              { icon: Zap, title: "Skill Gap Analysis", desc: "Identifies exactly what you need to learn to qualify for your target role." },
              { icon: Compass, title: "Learning Roadmap", desc: "Generates a customized curriculum based on your skill gaps." },
              { icon: Award, title: "Skill Assessment", desc: "Verify your abilities through AI-driven technical questionnaires." },
              { icon: BookOpen, title: "Interview Preparation", desc: "Practice with AI-generated interview questions tailored to the job." }
            ].map((feature, idx) => (
              <Card key={idx} className="group hover:border-indigo-200 transition-colors">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. AI Capabilities & 7. Dashboard Preview */}
      <section id="ai-capabilities" className="py-24 bg-slate-900 text-white overflow-hidden scroll-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-6">
                <Brain className="h-4 w-4" />
                <span>Powered by Advanced LLMs</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Unmatched AI Capabilities</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Our proprietary AI engine goes beyond simple keyword matching. It understands context, seniority, and skill relationships to provide human-like career intelligence.
              </p>
              
              <ul className="space-y-5">
                {[
                  "Contextual resume understanding",
                  "Deep job description analysis",
                  "Accurate semantic skill extraction",
                  "Personalized learning recommendations",
                  "Automated interview evaluation"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-indigo-400 shrink-0" />
                    <span className="text-slate-300 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dashboard Preview mockup */}
            <div className="relative lg:h-[600px] flex items-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 rounded-full "></div>
              <div className="relative w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <div className="ml-4 h-4 w-32 bg-slate-700 rounded-full"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="h-24 flex-1 bg-slate-700 rounded-xl p-4 flex flex-col justify-between">
                      <div className="h-3 w-1/2 bg-slate-600 rounded-full"></div>
                      <div className="text-3xl font-bold text-white">92%</div>
                    </div>
                    <div className="h-24 flex-1 bg-indigo-600 rounded-xl p-4 flex flex-col justify-between">
                      <div className="h-3 w-1/2 bg-indigo-400 rounded-full"></div>
                      <div className="text-3xl font-bold text-white">142</div>
                    </div>
                  </div>

                  <div className="h-48 bg-slate-700 rounded-xl p-4">
                    <div className="h-3 w-1/4 bg-slate-600 rounded-full mb-6"></div>
                    <div className="flex items-end gap-2 h-28">
                      {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                        <div key={i} className="flex-1 bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-400" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-12 bg-slate-700 rounded-lg flex items-center px-4">
                      <div className="h-2 w-1/3 bg-slate-600 rounded-full"></div>
                      <div className="ml-auto h-6 w-16 bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center rounded-full">Match</div>
                    </div>
                    <div className="h-12 bg-slate-700 rounded-lg flex items-center px-4">
                      <div className="h-2 w-1/2 bg-slate-600 rounded-full"></div>
                      <div className="ml-auto h-6 w-16 bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center rounded-full">Match</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. CTA Section */}
      <section className="py-24 bg-white text-center relative overflow-hidden scroll-section">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-50 rounded-full  -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            Ready to understand your career readiness?
          </h2>
          <p className="text-xl text-slate-600 mb-10">
            Join thousands of professionals using SkillMatch AI to level up their careers and land their dream jobs.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/dashboard')}
            rightIcon={<ArrowRight className="h-5 w-5" />}
            className="rounded-full px-10 py-6 text-lg shadow-xl shadow-indigo-200"
          >
            Get Started
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
