import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import api from '../utils/api';
import { 
  RefreshCw, CheckCircle2, CircleDashed, Clock, Lock,
  BookOpen, Code, Terminal, PlayCircle, Trophy, AlertCircle, 
  Compass, Printer, ChevronDown, ChevronUp, Zap, Star, ArrowRight,
  Calendar, Sparkles, CheckCheck, Briefcase, GraduationCap,
  Flame, Target, Mic, FileText, X
} from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import { cn } from '../utils/cn';
import EmptyState from '../components/EmptyState';

const statusConfig = {
  completed: {
    border: 'border-emerald-300 dark:border-emerald-600/50',
    bg: 'bg-gradient-to-r from-emerald-50/90 to-teal-50/60 dark:from-emerald-950/70 dark:to-teal-950/60',
    badge: 'bg-emerald-500 text-white font-bold',
    badgeLabel: 'Completed',
    dot: 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-900/60 text-white',
    numberClass: 'text-white',
  },
  current: {
    border: 'border-indigo-400 dark:border-indigo-500/60',
    bg: 'bg-gradient-to-r from-indigo-50/90 to-violet-50/80 dark:from-indigo-950/80 dark:to-violet-950/70',
    badge: 'bg-indigo-600 text-white font-bold shadow-xs',
    badgeLabel: 'Active Sprint',
    dot: 'bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900/60 text-white shadow-sm',
    numberClass: 'text-white',
  },
  locked: {
    border: 'border-slate-200 dark:border-slate-700',
    bg: 'bg-slate-50/80 dark:bg-slate-800/50',
    badge: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-bold',
    badgeLabel: 'Locked',
    dot: 'bg-slate-100 ring-4 ring-slate-100/60 text-slate-500 border border-slate-200 dark:bg-slate-700 dark:ring-slate-800/80 dark:text-slate-300 dark:border-slate-600',
    numberClass: 'text-slate-600 dark:text-slate-300',
  },
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const getDateAfterDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + Number(days));
  return d.toISOString().split('T')[0];
};

const calculateDaysFromDate = (dateStr) => {
  if (!dateStr) return 10;
  try {
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  } catch (e) {
    return 10;
  }
};

const LearningRoadmap = () => {
  const { activeJobMatchId } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([0]));
  
  // Student Placement Drive countdown state (defaults to 10 days as requested)
  const [sprintDays, setSprintDays] = useState(10);
  const [customDaysInput, setCustomDaysInput] = useState(10);
  const [driveDate, setDriveDate] = useState(() => getDateAfterDays(10));
  const [showSprintSuccess, setShowSprintSuccess] = useState(false);

  // Sequential task locking & progression states
  const [lockedFeedback, setLockedFeedback] = useState(null);
  const [unlockAlert, setUnlockAlert] = useState(null);

  const [roadmap, setRoadmap] = useState(() => {
    const saved = localStorage.getItem('activeFlow_roadmap');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Handle clicking on a disabled/locked module
  const handleLockedClick = (e, idx, week) => {
    if (e) e.stopPropagation();
    const prevModuleNum = idx; // 1-indexed number of required module
    const prevSkill = roadmap?.weeks[idx - 1]?.skill || `Module ${prevModuleNum}`;
    setLockedFeedback({
      currentModule: idx + 1,
      currentSkill: week?.skill || `Module ${idx + 1}`,
      requiredModule: prevModuleNum,
      requiredSkill: prevSkill
    });
    setTimeout(() => {
      setLockedFeedback(prev => (prev?.currentModule === idx + 1 ? null : prev));
    }, 4500);
  };

  // Auto-expand the active incomplete module when roadmap loads
  useEffect(() => {
    if (roadmap?.weeks && roadmap.weeks.length > 0) {
      const activeIdx = roadmap.weeks.findIndex(w => !w.completed);
      setExpandedWeeks(new Set([activeIdx !== -1 ? activeIdx : 0]));
    }
  }, [roadmap?.id]);

  // Sync state if roadmap already has saved sprintDays / driveDate
  useEffect(() => {
    if (roadmap?.sprintDays) {
      setSprintDays(roadmap.sprintDays);
      setCustomDaysInput(roadmap.sprintDays);
      if (roadmap.driveDate) {
        setDriveDate(roadmap.driveDate);
      } else {
        setDriveDate(getDateAfterDays(roadmap.sprintDays));
      }
    }
  }, [roadmap?.sprintDays, roadmap?.driveDate]);

  const handleSelectPresetDays = (days) => {
    setSprintDays(days);
    setCustomDaysInput(days);
    setDriveDate(getDateAfterDays(days));
  };

  const handleCustomDaysChange = (val) => {
    setCustomDaysInput(val);
    const days = parseInt(val, 10);
    if (!isNaN(days) && days > 0) {
      setSprintDays(days);
      setDriveDate(getDateAfterDays(days));
    }
  };

  const handleDriveDateChange = (val) => {
    setDriveDate(val);
    const days = calculateDaysFromDate(val);
    setSprintDays(days);
    setCustomDaysInput(days);
  };

  const getActiveMatchData = () => {
    if (!activeJobMatchId) return null;
    if (location.state?.matchData && location.state.matchData.id === activeJobMatchId) return location.state.matchData;
    const saved = localStorage.getItem('activeFlow_match');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === activeJobMatchId) return parsed;
      } catch (e) {
        // ignore parse error
      }
    }
    return null;
  };

  const resolveSkillGaps = async () => {
    // 1. From active match data in location state or localStorage
    const activeMatch = getActiveMatchData();
    if (activeMatch) {
      if (activeMatch.skillGaps && activeMatch.skillGaps.length > 0) {
        return {
          role: activeMatch.jobTitle || 'Associate Java Full Stack Developer',
          skills: activeMatch.skillGaps.map(g => (typeof g === 'string' ? g : g.skill)),
          matchId: activeMatch.id
        };
      }
      if (activeMatch.missingSkills && activeMatch.missingSkills.length > 0) {
        return {
          role: activeMatch.jobTitle || 'Associate Java Full Stack Developer',
          skills: activeMatch.missingSkills,
          matchId: activeMatch.id
        };
      }
    }

    // 2. Try fetching from server match record
    const matchId = activeJobMatchId || roadmap?.jobMatchId;
    if (matchId) {
      try {
        const res = await api.get(`/matches/${matchId}`);
        if (res.data) {
          const s = (res.data.skillGaps && res.data.skillGaps.length > 0)
            ? res.data.skillGaps.map(g => (typeof g === 'string' ? g : g.skill))
            : (res.data.missingSkills || []);
          return {
            role: res.data.jobTitle || roadmap?.targetRole || 'Associate Java Full Stack Developer',
            skills: s,
            matchId: matchId
          };
        }
      } catch (e) {
        console.warn('Could not fetch match by id:', e);
      }
    }

    // 3. Fallback: extract skill names from existing roadmap weeks
    if (roadmap?.weeks && roadmap.weeks.length > 0) {
      const extracted = roadmap.weeks.map(w => w.skill).filter(Boolean);
      return {
        role: roadmap.targetRole || 'Associate Java Full Stack Developer',
        skills: extracted,
        matchId: roadmap.jobMatchId || activeJobMatchId
      };
    }

    return null;
  };

  const handleRegenerateSprint = async (days = sprintDays) => {
    setIsGenerating(true);
    setError('');
    const targetDays = Number(days) || 10;
    try {
      const matchInfo = await resolveSkillGaps();
      if (!matchInfo || !matchInfo.skills || matchInfo.skills.length === 0) {
        setError('Unable to find skill gaps. Please review your Job Analyzer or Skill Gaps page.');
        setIsGenerating(false);
        return;
      }

      const reqBody = {
        targetRole: matchInfo.role,
        skillGaps: matchInfo.skills,
        jobMatchId: matchInfo.matchId,
        sprintDays: targetDays,
        sprintWeeks: Math.max(1, Math.ceil(targetDays / 7)),
        driveDate: driveDate || getDateAfterDays(targetDays)
      };

      const res = await api.post('/roadmaps/generate', reqBody);

      setRoadmap(res.data);
      localStorage.setItem('activeFlow_roadmap', JSON.stringify(res.data));
      setExpandedWeeks(new Set([0]));
      setShowSprintSuccess(true);
      setTimeout(() => setShowSprintSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to regenerate sprint roadmap:', err);
      setError(err.response?.data?.message || 'Failed to generate sprint roadmap. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const fetchOrGenerateRoadmap = async () => {
      // 1. If we clicked a specific roadmap from the Dashboard
      if (location.state?.roadmapId) {
        try {
          setIsLoading(true);
          const res = await api.get('/roadmaps');
          const specificRoadmap = res.data.find(r => r.id === location.state.roadmapId);
          if (specificRoadmap) {
            setRoadmap(specificRoadmap);
            setIsLoading(false);
            return;
          }
        } catch(e) {
          console.error("Failed to fetch specific roadmap", e);
        }
      }

      // 2. If we just navigated from Skill Gaps, generate a new sprint roadmap
      if (location.state?.matchData) {
        setIsLoading(true);
        try {
          // First check if one already exists for this match
          const res = await api.get('/roadmaps');
          const existing = res.data.find(r => r.jobMatchId === location.state.matchData.id);
          if (existing) {
            setRoadmap(existing);
            setIsLoading(false);
            return;
          }

          // Generate new sprint roadmap (10-day crash course default)
          const matchData = location.state.matchData;
          const reqBody = {
            targetRole: matchData.jobTitle || 'Target Role',
            skillGaps: matchData.skillGaps ? matchData.skillGaps.map(g => (typeof g === 'string' ? g : g.skill)) : (matchData.missingSkills || []),
            jobMatchId: matchData.id,
            sprintDays: 10,
            sprintWeeks: 2,
            driveDate: getDateAfterDays(10)
          };

          const generateRes = await api.post('/roadmaps/generate', reqBody);
          setRoadmap(generateRes.data);
          localStorage.setItem('activeFlow_roadmap', JSON.stringify(generateRes.data));
        } catch(e) {
          console.error("Failed to fetch or generate roadmap", e);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // 3. Fallback: If navigating via sidebar/back button, load the active workspace's roadmap or latest roadmap
      setIsLoading(true);
      try {
        const res = await api.get('/roadmaps');
        if (res.data && res.data.length > 0) {
          let existing = null;
          if (activeJobMatchId) {
            existing = res.data.find(r => r.jobMatchId === activeJobMatchId);
          }
          if (!existing) {
            existing = res.data[0];
          }
          if (existing) {
            setRoadmap(existing);
            localStorage.setItem('activeFlow_roadmap', JSON.stringify(existing));
          } else {
            setRoadmap(null);
          }
        } else {
          setRoadmap(null);
        }
      } catch (err) {
        console.error("Failed to load roadmap for workspace", err);
        setRoadmap(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrGenerateRoadmap();
  }, [location.state, activeJobMatchId]);

  const toggleStatus = async (weekNumber, currentStatus) => {
    if (!roadmap) return;
    try {
      const isCompleted = !currentStatus;
      const currentIdx = roadmap.weeks.findIndex(w => w.weekNumber === weekNumber);

      // Guard: if trying to complete, verify all preceding modules are already completed
      if (isCompleted && currentIdx > 0) {
        const hasUnfinishedPreceding = roadmap.weeks.slice(0, currentIdx).some(w => !w.completed);
        if (hasUnfinishedPreceding) {
          handleLockedClick(null, currentIdx, roadmap.weeks[currentIdx]);
          return;
        }
      }

      const response = await api.put(
        `/roadmaps/${roadmap.id}/progress?weekNumber=${weekNumber}&completed=${isCompleted}`
      );
      setRoadmap(response.data);
      localStorage.setItem('activeFlow_roadmap', JSON.stringify(response.data));
      window.dispatchEvent(new CustomEvent('roadmap-updated', { detail: response.data }));

      if (isCompleted) {
        // Automatically expand the next newly unlocked module!
        const nextIdx = currentIdx + 1;
        if (nextIdx < roadmap.weeks.length) {
          setExpandedWeeks(new Set([nextIdx]));
          const nextSkill = roadmap.weeks[nextIdx]?.skill || `Module ${nextIdx + 1}`;
          setUnlockAlert({
            completedModule: currentIdx + 1,
            unlockedModule: nextIdx + 1,
            unlockedSkill: nextSkill
          });
          setTimeout(() => setUnlockAlert(null), 5000);
        }
      } else {
        // If unmarked complete, expand the uncompleted module and keep subsequent locked modules closed
        setExpandedWeeks(new Set([currentIdx]));
      }
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  const toggleExpand = (idx) => {
    // If this week is locked, show locked feedback instead of opening
    if (idx > 0 && roadmap?.weeks && !roadmap.weeks.slice(0, idx).every(w => w.completed)) {
      handleLockedClick(null, idx, roadmap.weeks[idx]);
      return;
    }

    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  if (isLoading || isGenerating) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[65vh] gap-6 px-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
            <Zap className="h-12 w-12 text-white animate-bounce" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
        </div>
        <div className="text-center max-w-lg">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 mb-3">
            <GraduationCap className="h-3.5 w-3.5" /> {sprintDays}-Day Campus Placement Sprint
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
            {isGenerating ? `Synthesizing ${sprintDays}-Day Placement Crash Course...` : 'Loading Your Learning Plan...'}
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Structuring all required technical skills into an intensive {sprintDays}-day roadmap with high-frequency campus placement interview questions, coding drills, and capstone project defenses.
          </p>
        </div>
        <div className="flex gap-2.5 mt-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <EmptyState
          icon={Compass}
          title="Skill Gaps Required"
          description="Your personalized learning roadmap is built from your skill gaps. Please review your skill gaps first."
          action={
            <button
              onClick={() => navigate('/dashboard/skills')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              Go to Skill Gaps <ArrowRight className="h-4 w-4" />
            </button>
          }
        />
      </div>
    );
  }

  const completedCount = roadmap.weeks?.filter(w => w.completed).length || 0;
  const totalWeeks = roadmap.weeks?.length || 0;
  const isMultiMonthPlan = totalWeeks > 5;
  const progress = roadmap.progressPercentage || (totalWeeks > 0 ? Math.round((completedCount / totalWeeks) * 100) : 0);
  const activeSprintDays = roadmap.sprintDays || sprintDays || (totalWeeks * 7);

  return (
    <div className="roadmap-print-root max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">

      {/* Success Notification */}
      {showSprintSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold">
              ✨ {activeSprintDays}-Day Campus Placement Crash Course generated! Tailored to your drive timeline with interview prep & coding drills.
            </p>
          </div>
          <button 
            onClick={() => setShowSprintSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Student Campus Placement Drive Timeline Controller */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/30 rounded-2xl p-6 shadow-xl text-white print:hidden relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm">
                <GraduationCap className="h-3.5 w-3.5" /> Student Placement Drive Mode
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-300 bg-white/10 px-2.5 py-1 rounded-full">
                <Target className="h-3 w-3 text-amber-300" /> Exact Day Countdown
              </span>
            </div>
            
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Upcoming Campus Recruitment Drive?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Have a campus drive in <strong>10 days</strong>, <strong>7 days</strong>, or a custom date? Select your exact timeline to condense missing skills into high-yield placement modules with high-frequency interview questions, coding drills, and project defense scenarios.
            </p>
          </div>

          {/* Quick Timeline Selector & Action */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 shrink-0 flex flex-col gap-3 min-w-[320px]">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center justify-between">
              <span>Select Drive Timeline:</span>
              <span className="text-amber-400 font-extrabold">{sprintDays} Days Remaining</span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { days: 5, label: '5d', desc: 'Blitz' },
                { days: 7, label: '7d', desc: '1 Wk' },
                { days: 10, label: '10d', desc: 'Popular', highlight: true },
                { days: 14, label: '14d', desc: '2 Wk' },
                { days: 21, label: '21d', desc: '3 Wk' }
              ].map(p => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => handleSelectPresetDays(p.days)}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-center transition-all cursor-pointer",
                    sprintDays === p.days
                      ? "bg-amber-400 border-amber-300 text-slate-950 font-black shadow-md scale-105"
                      : "bg-white/5 border-white/15 text-white/90 hover:bg-white/15"
                  )}
                  title={`${p.days} Days Drive Preparation`}
                >
                  <span className="text-sm font-black leading-none">{p.label}</span>
                  <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">{p.desc}</span>
                </button>
              ))}
            </div>

            {/* Exact Days Input & Date Picker */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <div>
                <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                  Exact Days Left:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customDaysInput}
                    onChange={(e) => handleCustomDaysChange(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-400 font-semibold pointer-events-none">
                    days
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                  Drive Date:
                </label>
                <input
                  type="date"
                  value={driveDate}
                  min={getTodayString()}
                  onChange={(e) => handleDriveDateChange(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => handleRegenerateSprint(sprintDays)}
              disabled={isGenerating}
              className="w-full mt-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Zap className={cn("h-4 w-4 fill-current", isGenerating && "animate-spin")} />
              {isGenerating ? "Synthesizing Crash Course..." : `Generate ${sprintDays}-Day Crash Course`}
            </button>
          </div>
        </div>
      </div>

      {/* Campus Placement Alert Banner if previously had 29 weeks */}
      {isMultiMonthPlan && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400/60 rounded-2xl p-5 text-amber-950 dark:text-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm print:hidden">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-md shadow-amber-500/20">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                  Campus Drive Timeline Alert
                </span>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  ⚡ {sprintDays} Days to Recruitment Drive
                </span>
              </div>
              <h4 className="font-extrabold text-base md:text-lg mt-1 text-slate-900 dark:text-white">
                Current Plan spans {totalWeeks} weeks (~{Math.round(totalWeeks * 7 / 30)} months)
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                With your campus drive arriving in <strong>{sprintDays} days</strong>, studying 1 skill per week for {totalWeeks} weeks will take too long. Condense all {totalWeeks} missing skills into an intensive <strong>{sprintDays}-Day Placement Crash Course</strong> containing high-frequency interview questions, rapid coding drills, and project defense scenarios.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleRegenerateSprint(sprintDays)}
            disabled={isGenerating}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-500/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Zap className="h-4 w-4" /> Convert to {sprintDays}-Day Sprint
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="roadmap-hero relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 rounded-2xl p-8 shadow-xl text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                <Zap className="h-3.5 w-3.5 fill-current" /> CAMPUS PLACEMENT SPRINT ({activeSprintDays} DAYS)
              </span>
              {driveDate && (
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  <Calendar className="h-3 w-3 text-amber-300" /> Target Drive: {driveDate}
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                <Sparkles className="h-3 w-3" /> All Skills Included
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Fast-Track Learning Roadmap
            </h1>
            <p className="text-indigo-200 text-base">
              Target Role:{' '}
              <span className="font-semibold text-white">{roadmap.targetRole || 'Software Engineer'}</span>
            </p>

            <div className="mt-5 max-w-md">
              <div className="flex justify-between text-xs font-semibold text-indigo-200 mb-1.5">
                <span>Sprint Curriculum Completion</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Quick Duration Switcher & Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-6 print:hidden">
              <div className="inline-flex items-center rounded-xl bg-white/10 p-1 backdrop-blur-sm border border-white/20 text-xs font-semibold">
                {[
                  { days: 7, label: '7 Days' },
                  { days: 10, label: '10 Days' },
                  { days: 14, label: '14 Days' },
                  { days: 21, label: '21 Days' }
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => { handleSelectPresetDays(item.days); handleRegenerateSprint(item.days); }}
                    disabled={isGenerating}
                    className={cn(
                      "px-3 py-1.5 rounded-lg transition-all",
                      activeSprintDays === item.days
                        ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                        : "text-white/80 hover:text-white"
                    )}
                  >
                    ⚡ {item.label}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => handleRegenerateSprint(activeSprintDays)}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-semibold transition-colors backdrop-blur-sm shadow-sm"
                title="Regenerate Placement Sprint with fresh AI synthesis"
              >
                <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                {isGenerating ? "Regenerating..." : "Regenerate Sprint"}
              </button>

              <button 
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-semibold transition-colors backdrop-blur-sm shadow-sm"
              >
                <Printer className="h-4 w-4" /> Export PDF
              </button>

              <button 
                onClick={() => navigate('/dashboard/assessment', { state: { roadmapId: roadmap.id } })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-sm font-bold transition-all shadow-md active:scale-95"
              >
                <PlayCircle className="h-4 w-4" /> Mock Assessment
              </button>
            </div>
          </div>

          <div className="flex md:flex-col gap-3 shrink-0 print:hidden">
            <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20 shadow-inner">
              <div className="text-3xl font-extrabold">{progress}%</div>
              <div className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mt-0.5">Mastered</div>
            </div>
            <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20 shadow-inner">
              <div className="text-3xl font-extrabold">{completedCount}<span className="text-lg text-indigo-300">/{totalWeeks}</span></div>
              <div className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mt-0.5">Modules Done</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-rose-700">{error}</p>
        </div>
      )}

      {/* Placement Roadmap Summary Box */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            <strong>Campus Placement Strategy:</strong> Focus 2.5–3 hours daily per module. Review top interview questions & complete the coding scenario before college interviews.
          </span>
        </div>
        <div className="shrink-0 font-bold bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-sm">
          Target: Complete in {activeSprintDays} Days ({driveDate ? `By ${driveDate}` : 'Crash Course'})
        </div>
      </div>

      {/* Week / Module Cards */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-600" />
          Placement Sprint Modules
          <span className="ml-auto text-sm font-normal text-slate-500">
            {totalWeeks} intensive {totalWeeks === 1 ? 'module' : 'modules'} total ({activeSprintDays}-day schedule)
          </span>
        </h2>

        {roadmap.weeks && roadmap.weeks.map((week, idx) => {
          const isFirstModule = idx === 0;
          const isPrerequisiteMet = isFirstModule || roadmap.weeks.slice(0, idx).every(w => w.completed);
          const isCompleted = week.completed;
          const isEnabled = isPrerequisiteMet;
          const isCurrent = isEnabled && !isCompleted;
          const status = isCompleted ? 'completed' : isCurrent ? 'current' : 'locked';
          const cfg = statusConfig[status];
          const isExpanded = isEnabled && expandedWeeks.has(idx);

          // Calculate exact day ranges (e.g. Days 1–2, Days 3–4, Days 5–6, Days 7–8, Days 9–10)
          const daysPerModule = Math.max(1, Math.round(activeSprintDays / totalWeeks));
          const startDay = (idx * daysPerModule) + 1;
          const endDay = idx === totalWeeks - 1 ? activeSprintDays : Math.min(activeSprintDays, (idx + 1) * daysPerModule);
          const moduleNum = (week.weekNumber && week.weekNumber > 0 && roadmap.weeks.filter(w => w.weekNumber === week.weekNumber).length === 1) ? week.weekNumber : (idx + 1);

          return (
            <div
              key={idx}
              className={cn(
                'week-card rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-sm print:break-inside-avoid print:mb-4',
                cfg.border,
                cfg.bg,
                status === 'locked' && 'week-card-locked shadow-none cursor-not-allowed select-none',
                isCompleted && 'week-card-completed shadow-xs',
                isCurrent && 'week-card-current ring-2 ring-indigo-400/30 shadow-md'
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-4 p-5 select-none transition-colors",
                  status === 'locked' ? "cursor-not-allowed hover:bg-slate-100/40 dark:hover:bg-slate-800/40" : "cursor-pointer"
                )}
                onClick={(e) => {
                  if (status === 'locked') {
                    handleLockedClick(e, idx, week);
                  } else {
                    toggleExpand(idx);
                  }
                }}
              >
                <div className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-xl font-extrabold text-lg shrink-0 transition-transform shadow-xs',
                  cfg.dot
                )}>
                  <span className={cfg.numberClass}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    ) : status === 'locked' ? (
                      <Lock className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                    ) : (
                      moduleNum
                    )}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={cn(
                      "text-xs font-black px-2.5 py-0.5 rounded-md border",
                      status === 'locked' 
                        ? "text-slate-700 bg-slate-100 border-slate-200 dark:text-slate-200 dark:bg-slate-700/80 dark:border-slate-600" 
                        : isCompleted 
                        ? "text-emerald-700 bg-emerald-100/90 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800" 
                        : "text-indigo-700 bg-indigo-100/90 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-800"
                    )}>
                      Days {startDay}–{endDay} Target
                    </span>
                    <h3 className={cn(
                      "text-base font-bold",
                      status === 'locked' ? "text-slate-800 dark:text-slate-100" : "text-slate-900 dark:text-white"
                    )}>
                      Module {moduleNum}: {week.skill}
                    </h3>
                    <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1', cfg.badge)}>
                      {status === 'locked' && <Lock className="h-2.5 w-2.5" />}
                      {status === 'current' && <Zap className="h-2.5 w-2.5" />}
                      {status === 'completed' && <CheckCircle2 className="h-2.5 w-2.5" />}
                      {status === 'locked' ? 'Locked' : cfg.badgeLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-200 font-medium">
                    <span className={cn(
                      "flex items-center gap-1 font-semibold",
                      status === 'locked' ? "text-slate-700 dark:text-slate-300" : "text-slate-700 dark:text-slate-100"
                    )}>
                      <Clock className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" /> {week.estimatedTime || `${Math.round((endDay - startDay + 1) * 3)} hours (Days ${startDay}-${endDay})`}
                    </span>
                    {week.topics && week.topics.length > 0 && (
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-200">
                        <BookOpen className="h-3.5 w-3.5 text-slate-500 dark:text-slate-300" /> {week.topics.length} key topics & interview focus areas
                      </span>
                    )}
                    {status === 'locked' && (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 dark:text-amber-200 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-700/80 inline-flex items-center gap-1 shadow-xs">
                        <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400" /> Complete Module {idx} first to enable
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 print:hidden">
                  {status === 'locked' ? (
                    <button
                      type="button"
                      onClick={(e) => handleLockedClick(e, idx, week)}
                      className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 dark:bg-slate-700/60 dark:text-slate-300 dark:border-slate-600 cursor-not-allowed transition-all"
                      title={`Locked: Complete Module ${idx} (${roadmap.weeks[idx - 1]?.skill}) first to unlock`}
                    >
                      <Lock className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleStatus(week.weekNumber, week.completed); }}
                      className={cn(
                        'p-2 rounded-full transition-all cursor-pointer shadow-xs',
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:scale-105 dark:bg-emerald-900/70 dark:text-emerald-300 dark:hover:bg-emerald-800 dark:border dark:border-emerald-700/60'
                          : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200 hover:scale-105 dark:bg-slate-800 dark:text-indigo-300 dark:border-indigo-700/60 dark:hover:bg-indigo-950/60'
                      )}
                      title={isCompleted ? 'Mark module as incomplete' : 'Mark module as completed'}
                    >
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <CircleDashed className="h-5 w-5" />}
                    </button>
                  )}
                  <div className={cn(
                    "p-1 transition-colors",
                    status === 'locked' ? "text-slate-400 dark:text-slate-400 cursor-not-allowed" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  )}>
                    {status === 'locked' ? (
                      <Lock className="h-4 w-4 text-slate-400 dark:text-slate-400" />
                    ) : isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>

              {(isExpanded) && (
                <div className="border-t border-slate-200/80 dark:border-slate-700 p-5 print:block bg-white/60 dark:bg-slate-900/40">
                  <div className="grid md:grid-cols-3 gap-5">
                    {/* Topics and Interview Focus */}
                    <div className="min-w-0">
                      <div className="week-section-label text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 print:hidden" /> Key Placement Topics & Interview Concepts
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {week.topics && week.topics.length > 0 ? (
                          week.topics.map((topic, i) => {
                            const isInterview = /interview|question|tricky|frequently|scenario|core|pattern|edge/i.test(topic);
                            const parts = typeof topic === 'string' ? topic.split(/\s*-\s*Interview:\s*/i) : [topic];
                            const mainText = parts[0];
                            const interviewQuestion = parts.length > 1 ? parts.slice(1).join(' - Interview: ') : null;

                            return (
                              <div 
                                key={i} 
                                className={cn(
                                  "text-xs p-3 rounded-xl border shadow-xs transition-all w-full min-w-0 overflow-hidden flex flex-col gap-2",
                                  isInterview
                                    ? "bg-violet-50/90 border-violet-200/90 text-violet-950 dark:bg-violet-950/40 dark:border-violet-800/80 dark:text-violet-200"
                                    : "bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                                )}
                              >
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={cn(
                                    "text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 inline-flex items-center gap-1 shadow-xs",
                                    isInterview ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                                  )}>
                                    {isInterview ? '🎯 Interview Concept' : `Topic ${i + 1}`}
                                  </span>
                                </div>
                                <div className="font-medium text-xs leading-relaxed text-slate-800 dark:text-slate-200 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                                  {mainText}
                                </div>
                                {interviewQuestion && (
                                  <div className="p-2.5 rounded-lg bg-violet-100/70 border border-violet-200/80 text-[11px] text-violet-950 dark:bg-violet-900/30 dark:border-violet-700/60 dark:text-violet-200 font-normal leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
                                    <span className="font-bold text-violet-700 dark:text-violet-300 block mb-0.5">Interview Question:</span>
                                    {interviewQuestion.replace(/^['"]|['"]$/g, '')}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-xs text-slate-400 italic">No topics listed</span>
                        )}
                      </div>
                    </div>

                    {/* Practical Coding Task / Drill */}
                    <div className="min-w-0">
                      <div className="week-section-label text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 print:hidden" /> Hands-On Placement Coding Drill
                      </div>
                      <div className="task-box bg-slate-900 text-emerald-400 rounded-xl p-4 text-xs font-mono leading-relaxed shadow-sm border border-slate-800 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                        <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1 font-sans uppercase font-bold">
                          <Code className="h-3 w-3 text-emerald-400" /> Practical Task Prompt:
                        </div>
                        <p className="text-slate-100 font-sans text-xs leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
                          {week.practicalTask || 'Hands-on coding exercise tailored for campus drive technical rounds.'}
                        </p>
                      </div>
                    </div>

                    {/* Capstone Project Highlight */}
                    <div className="min-w-0">
                      <div className="week-section-label text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 print:hidden" /> Capstone Project Defense
                      </div>
                      <div className="project-box bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/80 p-4 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed shadow-sm break-words [overflow-wrap:anywhere] [word-break:break-word]">
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Resume Project Defense:
                        </div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                          {week.project || 'Resume project showcase to discuss with the technical interviewer.'}
                        </p>
                        <div className="mt-3 pt-2.5 border-t border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
                          <span>Interview Round Focus</span>
                          <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-700">STAR Method</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Module Checkpoint Bridges: Assessment & Interview Prep */}
                  <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Ready for Days {startDay}–{endDay} verification?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/dashboard/assessment', { state: { skill: week.skill, roadmapId: roadmap.id } })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-200 dark:border-indigo-800 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5" /> Checkpoint Quiz
                      </button>
                      <button
                        onClick={() => navigate('/dashboard/interview', { state: { jobTitle: roadmap.targetRole, skill: week.skill } })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-800 font-bold text-xs border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <Mic className="h-3.5 w-3.5" /> Voice Mock Interview
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Print layout fallback */}
              {!isExpanded && (
                <div className="hidden print:block border-t border-slate-100 p-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="week-section-label text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Topics</div>
                      <div className="flex flex-wrap gap-1.5">
                        {week.topics && week.topics.map((topic, i) => (
                          <span key={i} className="topic-badge text-xs font-medium bg-white text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="week-section-label text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Practical Task</div>
                      <div className="task-box bg-white rounded-xl border border-slate-200 p-3 text-sm text-slate-700 leading-relaxed">
                        {week.practicalTask || 'No task specified.'}
                      </div>
                    </div>
                    <div>
                      <div className="week-section-label text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Capstone Project</div>
                      <div className="project-box bg-indigo-50 rounded-xl border border-indigo-100 p-3 text-sm text-indigo-900 leading-relaxed">
                        {week.project || 'No project specified.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="print:hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-indigo-900/50">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">Campus Interview Simulation</span>
          </div>
          <h3 className="text-xl font-bold">Validate Your Placement Readiness</h3>
          <p className="text-slate-300 text-sm mt-1 max-w-lg">
            Test your knowledge with company-specific placement assessment MCQs and technical code predicting challenges.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/assessment', { state: { roadmapId: roadmap.id } })}
          className="shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          Start Mock Assessment <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Floating Alert: Sequential Unlock Toast */}
      {unlockAlert && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-md bg-emerald-950 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-0.5">Next Module Unlocked!</h4>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Great progress! <strong>Module {unlockAlert.completedModule}</strong> completed. <strong>Module {unlockAlert.unlockedModule}: {unlockAlert.unlockedSkill}</strong> is now unlocked and ready.
            </p>
          </div>
          <button 
            onClick={() => setUnlockAlert(null)}
            className="text-emerald-400 hover:text-white p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Floating Alert: Prerequisite Required Toast */}
      {lockedFeedback && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-amber-500/40 flex items-start gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-0.5">Prerequisite Required</h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              <strong>Module {lockedFeedback.currentModule}</strong> is locked. Please complete <strong>Module {lockedFeedback.requiredModule}: {lockedFeedback.requiredSkill}</strong> first.
            </p>
          </div>
          <button 
            onClick={() => setLockedFeedback(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

    </div>
  );
};

export default LearningRoadmap;
